"use server";

import Stripe from "stripe";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_PRODUCT_BY_IDS } from "@/sanity/queries/product.query";
import { Order, QUERY_PRODUCT_BY_IDS_RESULT } from "@/sanity.types";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { siteConfig } from "@/config/site.config";
import { SanityDocument } from "next-sanity";
import { enforceRateLimit } from "@/lib/security";

const MINIMUM_ORDER_AMOUNT = 0.5;

// --- HELPER 1: Validate Stock and Calculate Totals ---
function validateStockAndCalculateTotal(
  items: ZSchemaType["cartItemSchema"][],
  products: NonNullable<QUERY_PRODUCT_BY_IDS_RESULT>,
) {
  const productQuantities = new Map<string, number>();
  for (const item of items) {
    const current = productQuantities.get(item.productId) || 0;
    productQuantities.set(item.productId, current + item.quantity);
  }

  const validationErrors: string[] = [];
  let totalAmount = 0;

  for (const [productId, totalQuantity] of productQuantities.entries()) {
    const product = products.find((p) => p._id === productId);

    if (!product) {
      const item = items.find((i) => i.productId === productId);
      validationErrors.push(`Product "${item?.name}" is no longer available.`);
      continue;
    }

    if ((product.stock ?? 0) === 0) {
      validationErrors.push(`"${product.name}" is out of stock.`);
      continue;
    }

    if (totalQuantity > (product.stock ?? 0)) {
      validationErrors.push(
        `Only ${product.stock} of "${product.name}" available (you have ${totalQuantity}).`,
      );
    }

    totalAmount += (product.price ?? 0) * totalQuantity;
  }

  return { validationErrors, totalAmount };
}

// --- HELPER 2: Build Stripe Line Items ---
function buildStripeLineItems(
  items: ZSchemaType["cartItemSchema"][],
  products: NonNullable<QUERY_PRODUCT_BY_IDS_RESULT>,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const product = products.find((p) => p._id === item.productId);
    if (!product) continue;

    let name = product.name || "Custom Dress";
    const variantInfo = [];
    if (item.selectedSize) variantInfo.push(`Size: ${item.selectedSize}`);
    if (item.selectedColor) variantInfo.push(`Color: ${item.selectedColor}`);

    if (variantInfo.length > 0) {
      name += ` (${variantInfo.join(", ")})`;
    }

    // FIX: Filter for image objects and map to extract the string URLs
    const stripeImages = product.snapshots
      ? product.snapshots
          .filter(
            (snap) => snap._type === "image" && typeof snap.url === "string",
          )
          .map((snap) => snap.url as string)
      : [];

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name,
          images: stripeImages,
          metadata: {
            productId: product._id,
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null,
          },
        },
        unit_amount: Math.round((product.price ?? 0) * 100),
      },
      quantity: item.quantity,
    });
  }

  return lineItems;
}

/**
 * Atomically creates an order and decrements stock for each product.
 * Uses a Sanity transaction to ensure either all operations succeed or none.
 * Uses atomic dec() without revision checks, allowing safe concurrent checkouts.
 * @param orderData - The order document data (must include _id and _type)
 * @param items - Array of { productId, quantity, priceAtPurchase }
 * @returns The created order document ID
 * @throws If stock is insufficient or any other error occurs.
 */
export async function createOrderAndDecrementStock(
  orderData: Omit<
    SanityDocument<Order>,
    "_createdAt" | "_updatedAt" | "_rev"
  > & {
    _id: string;
    _type: "order";
  },
  items: { productId: string; quantity: number; priceAtPurchase: number }[],
): Promise<string> {
  const productIds = items.map((i) => i.productId);

  // 1. Fetch all products' stock in one query
  const products = await client.fetch<{ _id: string; stock: number | null }[]>(
    `*[_type == "product" && _id in $ids]{ _id, stock }`,
    { ids: productIds },
  );
  const productMap = new Map(products.map((p) => [p._id, p]));

  // 2. Validate stock sufficiency for every item
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if ((product.stock ?? 0) < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.productId}`);
    }
  }

  // 3. Build the transaction — atomic dec() allows safe concurrent checkouts
  const transaction = writeClient.transaction();
  transaction.create(orderData);

  for (const item of items) {
    transaction.patch(item.productId, (patch) =>
      patch.dec({ stock: item.quantity }),
    );
  }

  await transaction.commit();
  return orderData._id;
}

type CheckoutResult =
  | { success: true; url: string | undefined }
  | { success: false; message: string; details?: unknown };

export async function createCheckoutSession(
  formData: FormData,
): Promise<CheckoutResult> {
  try {
    const stripe = getStripe();

    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      throw new Error("Unauthorized");
    }
    await enforceRateLimit("checkout", 10, 60_000, userId);

    // 1. Parse Data
    const rawItems = formData.get("items");
    if (typeof rawItems !== "string") {
      return { success: false, message: "Missing cart items." };
    }

    const objectData = {
      items: JSON.parse(rawItems),
      paymentMethod: formData.get("paymentMethod"),
    };

    // 2. Validate Schema
    const validationResult = zSchema.createSessionSchema.safeParse(objectData);
    if (!validationResult.success) {
      return {
        success: false,
        message:
          validationResult.error.message ??
          "Missing or invalid required fields.",
        details: validationResult.error.flatten(),
      };
    }

    const { items, paymentMethod } = validationResult.data;

    if (!items || items.length === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    // 3. Fetch Products from Sanity
    const productIds = items.map((item) => item.productId);
    const products = await client.fetch(QUERY_PRODUCT_BY_IDS, {
      ids: productIds,
    });

    // 4. Validate Stock and Prices
    const { validationErrors, totalAmount } = validateStockAndCalculateTotal(
      items,
      products,
    );

    if (validationErrors.length > 0) {
      return { success: false, message: validationErrors.join(" ") };
    }

    if (totalAmount < MINIMUM_ORDER_AMOUNT) {
      return {
        success: false,
        message: `Order total must be at least $${MINIMUM_ORDER_AMOUNT.toFixed(2)}`,
      };
    }

    // 5. Build Stripe Payload
    const lineItems = buildStripeLineItems(items, products);

    const itemsJson = JSON.stringify(
      items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      })),
    );

    // Update metadata to include itemsJson
    const metadata = {
      clerkUserId: userId,
      userEmail: user.emailAddresses[0]?.emailAddress,
      productIds: items.map((i) => i.productId).join(","),
      quantities: items.map((i) => i.quantity).join(","),
      itemsJson,
    };

    // 6. Process Payment / Create Session (Next step goes here)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      payment_method_types: ["card"],
      customer_email: metadata.userEmail,
      metadata,
      payment_intent_data: { metadata },
      shipping_address_collection: {
        allowed_countries: [
          "GB",
          "US",
          "CA",
          "AU",
          "NZ",
          "IE",
          "DE",
          "FR",
          "ES",
          "IT",
          "NL",
          "BE",
          "AT",
          "CH",
          "SE",
          "NO",
          "DK",
          "FI",
          "PT",
          "PL",
          "CZ",
          "GR",
          "HU",
          "RO",
          "BG",
          "HR",
          "SI",
          "SK",
          "LT",
          "LV",
          "EE",
          "LU",
          "MT",
          "CY",
          "JP",
          "SG",
          "HK",
          "KR",
          "TW",
          "MY",
          "TH",
          "IN",
          "AE",
          "SA",
          "IL",
          "ZA",
          "BR",
          "MX",
          "AR",
          "CL",
          "CO",
        ],
      },
      success_url: `${siteConfig.url}/pre-made/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/pre-made/checkout/cancel`,
    });

    return { success: true, url: session.url ?? undefined };
  } catch (error) {
    console.error("Checkout session error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
}

"use server";

import Stripe from "stripe";
import { zSchema, ZSchemaType } from "@/lib/zod";
import { client, writeClient } from "@/sanity/lib/client";
import { QUERY_PRODUCT_BY_IDS } from "@/sanity/queries/product.query";
import { Order, QUERY_PRODUCT_BY_IDS_RESULT } from "@/sanity.types";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { getResend } from "@/lib/resend";
import { siteConfig } from "@/config/site.config";
import { redirect } from "next/navigation";
import { Route } from "next";
import { SanityDocument } from "next-sanity";

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

  // 1. Fetch all products' stock and _rev in one query
  const products = await client.fetch(
    `*[_type == "product" && _id in $ids]{ _id, _rev, stock }`,
    { ids: productIds },
  );
  const productMap = new Map(products.map((p: { _id: string }) => [p._id, p]));

  // 2. Validate stock sufficiency for every item
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    // @ts-expect-error - expect error here cause we hardcoded the query
    if ((product.stock ?? 0) < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.productId}`);
    }
  }

  // 3. Build the transaction
  const transaction = writeClient.transaction();
  transaction.create(orderData);

  for (const item of items) {
    const product = productMap.get(item.productId)!;
    transaction.patch(item.productId, (patch) =>
      patch
        // @ts-expect-error - expect error here cause we hardcoded the query
        .ifRevisionId(product._rev) // ensures the product hasn't changed since our fetch
        .dec({ stock: item.quantity }),
    );
  }

  await transaction.commit();
  return orderData._id;
}

export async function createCheckoutSession(formData: FormData) {
  // 1. Parse Data
  const objectData = {
    items: JSON.parse(formData.get("items") as string),
    paymentMethod: formData.get("paymentMethod"),
  };

  try {
    const stripe = getStripe();

    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      throw new Error("Unauthorized");
    }

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
      payment_method_types: [paymentMethod as "card" | "paypal"],
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

// import { getResend } from "@/lib/resend";
// import { client, writeClient } from "@/sanity/lib/client";
// import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
// import { AdminOrderEmail } from "@/components/emails/admin/adminOrder.email";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { zSchema, ZSchemaType } from "@/lib/zod";

// export async function processAndSubmitOrder(formData: FormData) {
//   // 1. Extract and parse data from FormData
//   const orderData = {
//     customerName: formData.get("customerName") as string,
//     customerEmail: formData.get("customerEmail") as string,
//     total: Number(formData.get("total")),
//     paymentMethod: formData.get("paymentMethod") as "stripe" | "paypal",
//     // Parse the stringified items back into an array
//     items: JSON.parse(
//       formData.get("items") as string,
//     ) as ZSchemaType["cartItemSchema"],
//   };

//   try {
//     // Authenticate user
//     const { userId } = await auth();
//     const user = await currentUser();
//     if (!userId || !user) {
//       throw new Error("Unauthorized");
//     }

//     console.log(JSON.stringify(orderData, null, 4));

//     const validationResult = zSchema.cartItemSchema.safeParse(orderData.items);
//     if (!validationResult.success) {
//       return {
//         success: false,
//         message:
//           validationResult.error.message ??
//           "Missing or invalid required fields.",
//         details: validationResult.error.flatten(),
//       };
//     }

//     return {
//       success: true,
//       message: "Your payment was processed and the order has been placed.",
//     };

//     // // 2. Process Payment First
//     // // TODO: Replace this block with your actual payment gateway logic
//     // const paymentResult = await mockPaymentProcessor(orderData);

//     // if (!paymentResult.success) {
//     //   return { success: false, message: "Payment processing failed." };
//     // }

//     // // 3. Add Order to Sanity
//     // const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

//     // const newOrder = await writeClient.create({
//     //   _type: "order",
//     //   orderNumber,
//     //   customerName: orderData.customerName,
//     //   customerEmail: orderData.customerEmail,
//     //   total: orderData.total,
//     //   paymentMethod: orderData.paymentMethod,
//     //   paymentStatus: "Paid",
//     //   status: "pending",
//     //   items: orderData.items,
//     // });

//     // // 4. Send Email to Admin
//     // const resend = getResend();
//     // const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

//     // const { error } = await resend.emails.send({
//     //   from: process.env.RESEND_FROM_EMAIL!,
//     //   to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
//     //   subject: `New Order Received: ${orderNumber}`,
//     //   react: AdminOrderEmail({
//     //     orderId: newOrder._id,
//     //     orderNumber: newOrder.orderNumber,
//     //     customerName: newOrder.customerName,
//     //     customerEmail: newOrder.customerEmail,
//     //     total: newOrder.total,
//     //     paymentMethod: newOrder.paymentMethod,
//     //     paymentStatus: newOrder.paymentStatus,
//     //     items: newOrder.items,
//     //     socialHandles,
//     //   }),
//     // });

//     // return {
//     //   success: true,
//     //   resendError: error?.message,
//     //   message: "Order placed successfully!",
//     //   orderId: newOrder._id,
//     // };
//   } catch (error) {
//     console.error("Order processing error:", error);
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Failed to process order",
//     };
//   }
// }

// // Mock payment function for demonstration
// async function mockPaymentProcessor(data: {
//   customerName: string;
//   customerEmail: string;
//   total: number;
//   paymentMethod: "stripe" | "paypal";
//   items: {
//     _key: string;
//     productId: string;
//     name: string;
//     price: number;
//     quantity: number;
//     size: string | null;
//     color: string | null;
//     image: string | null;
//   }[];
// }) {
//   await new Promise((resolve) =>
//     setTimeout(() => resolve({ success: true }), 1000),
//   );
//   return { success: true };
// }

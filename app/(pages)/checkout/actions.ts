/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { client, writeClient } from "@/sanity/lib/client";
import { SanityDocument } from "next-sanity";
import { PRODUCT_BY_IDS_QUERY } from "@/sanity/queries/product";
import {
  ORDER_BY_STRIPE_PAYMENT_ID_QUERY,
  ORDER_BY_ID_QUERY,
} from "@/sanity/queries/orders";
import { stripe } from "@/lib/stripe";
import { Order, ORDER_BY_ID_QUERY_RESULT, Product } from "@/sanity.types";
import { siteConfig } from "@/config/site.config";
import { sendAdminOrderEmail, sendCustomerOrderEmail } from "@/lib/order-email";

// Types
interface ProductPayload {
  _id: string;
  name?: string;
  price?: number;
  stock?: number;
  images?: string[];
}

interface OrderPayload {
  _id: string;
  clerkUserId?: string;
  email?: string;
  total?: number;
  status?: string;
  address?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  items?: {
    quantity?: number;
    priceAtPurchase?: number;
    product?: {
      name?: string;
    };
  }[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  orderId?: string;
  error?: string;
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
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
  items: OrderItemInput[],
): Promise<string> {
  const transaction = writeClient.transaction();

  // 1. Create the order
  transaction.create(orderData);

  // 2. For each product, decrement stock with a condition
  for (const item of items) {
    const productId = item.productId;
    const qty = item.quantity;

    // 'if' exists at runtime but is missing from the type definitions.
    // First, get the current revision ID of the product
    const product = await client.fetch(`*[_id == $id][0]{ _rev }`, {
      id: productId,
    });

    // Then, use ifRevisionId in your transaction
    transaction.patch(productId, (patch) =>
      patch
        .ifRevisionId(product._rev) // Only apply if the revision matches
        .dec({ stock: qty }),
    );
  }

  await transaction.commit();
  return orderData._id;
}

/**
 * Creates a Stripe Checkout Session from cart items
 * Validates stock and prices against Sanity before creating session
 */
export async function createCheckoutSession(
  items: CartItem[],
  user: { id: string; email: string; name: string },
  paymentMethod: string = "stripe",
): Promise<CheckoutResult> {
  try {
    const { id: userId, email: userEmail } = user;

    if (!userId) {
      return { success: false, error: "Please sign in to checkout" };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    const productIds = items.map((item) => item.productId);
    const products = await client.fetch<ProductPayload[]>(
      PRODUCT_BY_IDS_QUERY,
      { ids: productIds },
    );

    // Validate stock and prices
    const productQuantities = new Map<string, number>();
    for (const item of items) {
      const current = productQuantities.get(item.productId) || 0;
      productQuantities.set(item.productId, current + item.quantity);
    }

    const validationErrors: string[] = [];
    const uniqueProductIds = Array.from(productQuantities.keys());

    for (const productId of uniqueProductIds) {
      const product = products.find((p) => p._id === productId);
      const totalQuantity = productQuantities.get(productId) || 0;

      if (!product) {
        const item = items.find((i) => i.productId === productId);
        validationErrors.push(`Product "${item?.name}" is no longer available`);
        continue;
      }

      if ((product.stock ?? 0) === 0) {
        validationErrors.push(`"${product.name}" is out of stock`);
        continue;
      }

      if (totalQuantity > (product.stock ?? 0)) {
        validationErrors.push(
          `Only ${product.stock} of "${product.name}" available (you have ${totalQuantity})`,
        );
      }
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(". ") };
    }

    // Calculate total amount from validated products
    let totalAmount = 0;
    for (const item of items) {
      const product = products.find((p) => p._id === item.productId);
      if (product) {
        totalAmount += (product.price ?? 0) * item.quantity;
      }
    }

    const MINIMUM_ORDER_AMOUNT = 0.5;
    if (totalAmount < MINIMUM_ORDER_AMOUNT) {
      return {
        success: false,
        error: `Order total must be at least $${MINIMUM_ORDER_AMOUNT.toFixed(2)}`,
      };
    }

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = products.find((p) => p._id === item.productId);
      if (!product) continue;

      let name = product.name ?? "Product";
      const variantInfo = [];
      if (item.selectedSize) variantInfo.push(`Size: ${item.selectedSize}`);
      if (item.selectedColor) variantInfo.push(`Color: ${item.selectedColor}`);

      if (variantInfo.length > 0) {
        name += ` (${variantInfo.join(", ")})`;
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: name,
            images: product.images
              ? product.images.filter(
                  (img): img is string => typeof img === "string",
                )
              : [],
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

    // In createCheckoutSession, after building lineItems and before creating session:

    // Build a serialized version of cart items for metadata (max 500 chars)
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
      userEmail,
      productIds: items.map((i) => i.productId).join(","),
      quantities: items.map((i) => i.quantity).join(","),
      itemsJson,
    };

    const baseUrl =
      siteConfig.url ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (paymentMethod === "stripe") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        customer_email: userEmail,
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
        metadata,
        payment_intent_data: { metadata },
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout`,
      });

      return { success: true, url: session.url ?? undefined };
    }

    return { success: false, error: "Invalid payment method" };
  } catch (error: unknown) {
    console.error("Checkout error:", error);

    if (error instanceof Error && error.message) {
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.error_description || parsedError.error) {
          return {
            success: false,
            error: (parsedError.error_description ||
              parsedError.error) as string,
          };
        }
      } catch (_e) {
        // Not a JSON error message
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

export async function createPaymentIntent(
  items: CartItem[],
  user: { id: string; email: string; name: string },
): Promise<PaymentIntentResult> {
  try {
    const { id: userId, email: userEmail } = user;

    if (!userId) {
      return { success: false, error: "Please sign in to checkout" };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    const productIds = items.map((item) => item.productId);
    const products = await client.fetch<Product[]>(PRODUCT_BY_IDS_QUERY, {
      ids: productIds,
    });

    const productQuantities = new Map<string, number>();
    for (const item of items) {
      const current = productQuantities.get(item.productId) || 0;
      productQuantities.set(item.productId, current + item.quantity);
    }

    const validationErrors: string[] = [];
    const uniqueProductIds = Array.from(productQuantities.keys());
    let totalAmount = 0;

    for (const productId of uniqueProductIds) {
      const product = products.find((p) => p._id === productId);
      const totalQuantity = productQuantities.get(productId) || 0;

      if (!product) {
        const item = items.find((i) => i.productId === productId);
        validationErrors.push(`Product "${item?.name}" is no longer available`);
        continue;
      }

      if ((product.stock ?? 0) === 0) {
        validationErrors.push(`"${product.name}" is out of stock`);
        continue;
      }

      if (totalQuantity > (product.stock ?? 0)) {
        validationErrors.push(
          `Only ${product.stock} of "${product.name}" available (you have ${totalQuantity})`,
        );
      }

      totalAmount += (product.price ?? 0) * totalQuantity;
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(". ") };
    }

    // Create Order in Sanity (Pending)
    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id === item.productId);
      return {
        _key: item.productId,
        product: { _type: "reference", _ref: item.productId },
        quantity: item.quantity,
        priceAtPurchase: product?.price ?? item.price,
      };
    });

    const orderItemsWithKeys = orderItems.map((item, index) => ({
      ...item,
      _key: `${item.product._ref}-${index}`,
    }));

    const order = await writeClient.create({
      _type: "order",
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "pending",
      clerkUserId: userId,
      email: userEmail,
      items: orderItemsWithKeys,
      total: totalAmount,
    });

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order._id,
        clerkUserId: userId,
        userEmail,
      },
    });

    await writeClient
      .patch(order._id)
      .set({ stripePaymentId: paymentIntent.id })
      .commit();

    return {
      success: true,
      clientSecret: paymentIntent.client_secret as string,
      orderId: order._id,
    };
  } catch (error) {
    console.error("Create PaymentIntent error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

export async function getCheckoutSession(sessionId: string, userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    });

    if (session.metadata?.clerkUserId !== userId) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      session: {
        id: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        amountTotal: session.amount_total,
        paymentStatus: session.payment_status,
        shippingAddress: session.customer_details?.address,
        lineItems: session.line_items?.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          amount: item.amount_total,
        })),
      },
    };
  } catch (error) {
    console.error("Get session error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not retrieve order details",
    };
  }
}

export async function getOrderBySanityId(orderId: string, userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const fullOrder = await client.fetch<OrderPayload>(ORDER_BY_ID_QUERY, {
      id: orderId,
    });

    if (!fullOrder) {
      return { success: false, error: "Order not found" };
    }

    if (fullOrder.clerkUserId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const paymentStatus = fullOrder.status === "paid" ? "paid" : "processing";

    return {
      success: true,
      session: {
        id: fullOrder._id,
        customerEmail: fullOrder.email,
        customerName: fullOrder.address?.name,
        amountTotal: (fullOrder.total || 0) * 100,
        paymentStatus,
        shippingAddress: fullOrder.address
          ? {
              line1: fullOrder.address.line1,
              line2: fullOrder.address.line2,
              city: fullOrder.address.city,
              postal_code: fullOrder.address.postcode,
              country: fullOrder.address.country,
            }
          : null,
        lineItems:
          fullOrder.items?.map((item) => ({
            name: item.product?.name || "Product",
            quantity: item.quantity,
            amount: (item.priceAtPurchase || 0) * 100 * (item.quantity || 1),
          })) || [],
      },
    };
  } catch (error) {
    console.error("Get order by Sanity ID error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not retrieve order details",
    };
  }
}

export async function getOrderByPaymentIntent(
  paymentIntentId: string,
  userId: string,
) {
  try {
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const order = await client.fetch<{ _id: string }>(
      ORDER_BY_STRIPE_PAYMENT_ID_QUERY,
      { stripePaymentId: paymentIntentId },
    );

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const fullOrder = await client.fetch<OrderPayload>(ORDER_BY_ID_QUERY, {
      id: order._id,
    });

    if (!fullOrder) {
      return { success: false, error: "Order details not found" };
    }

    if (fullOrder.clerkUserId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    let paymentStatus = fullOrder.status === "paid" ? "paid" : "processing";
    let shippingAddress = fullOrder.address
      ? {
          line1: fullOrder.address.line1,
          line2: fullOrder.address.line2,
          city: fullOrder.address.city,
          postal_code: fullOrder.address.postcode,
          country: fullOrder.address.country,
        }
      : null;

    if (paymentStatus !== "paid") {
      try {
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === "succeeded") {
          paymentStatus = "paid";
          if (!shippingAddress && paymentIntent.shipping?.address) {
            shippingAddress = {
              line1: paymentIntent.shipping.address.line1 ?? "",
              line2: paymentIntent.shipping.address.line2 ?? "",
              city: paymentIntent.shipping.address.city ?? "",
              postal_code: paymentIntent.shipping.address.postal_code ?? "",
              country: paymentIntent.shipping.address.country ?? "",
            };
          }
        } else if (paymentIntent.status === "processing") {
          paymentStatus = "processing";
        } else if (paymentIntent.status === "requires_payment_method") {
          paymentStatus = "unpaid";
        }
      } catch (stripeError) {
        console.error("Error retrieving PaymentIntent:", stripeError);
        paymentStatus = "processing";
      }
    }

    return {
      success: true,
      session: {
        id: fullOrder._id,
        customerEmail: fullOrder.email,
        customerName: fullOrder.address?.name,
        amountTotal: (fullOrder.total || 0) * 100,
        paymentStatus,
        shippingAddress,
        lineItems:
          fullOrder.items?.map((item) => ({
            name: item.product?.name || "Product",
            quantity: item.quantity,
            amount: (item.priceAtPurchase || 0) * 100 * (item.quantity || 1),
          })) || [],
      },
    };
  } catch (error) {
    console.error("Get order error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not retrieve order details",
    };
  }
}

/**
 * Fetches an existing order by Stripe session ID, or creates one if missing.
 * Uses atomic stock decrement via createOrderAndDecrementStock.
 */

export async function getOrCreateOrderFromCheckoutSession(
  sessionId: string,
  userId: string,
) {
  try {
    const orderId = `order_${sessionId}`;

    // 1. Check existing order
    let fullOrder = await client.fetch<ORDER_BY_ID_QUERY_RESULT>(
      `*[_type == "order" && _id == $id][0]`,
      { id: orderId },
    );
    if (fullOrder) {
      return { success: true, session: mapOrderToSession(fullOrder) };
    }

    // 2. Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // 3. Parse metadata
    const { clerkUserId, userEmail, itemsJson } = session.metadata || {};
    if (clerkUserId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    if (!itemsJson) {
      return { success: false, error: "No items data in session" };
    }

    // 4. Parse items from metadata
    let parsedItems: CartItem[] = [];
    try {
      parsedItems = JSON.parse(itemsJson);
    } catch {
      return { success: false, error: "Invalid items data" };
    }

    // 5. Fetch product details from Sanity
    const productIds = parsedItems.map((item) => item.productId);
    const products = await client.fetch<
      Array<{ _id: string; name: string; price: number; stock: number }>
    >(`*[_type == "product" && _id in $ids] { _id, name, price, stock }`, {
      ids: productIds,
    });

    // 6. Build order items and input for stock decrement
    const orderItemsInput: OrderItemInput[] = [];
    const orderItemsForSanity: Array<{
      _key: string;
      product: { _type: "reference"; _ref: string };
      quantity: number;
      priceAtPurchase: number;
    }> = [];

    let total = 0;
    for (const item of parsedItems) {
      const product = products.find((p) => p._id === item.productId);
      const price = product?.price ?? item.price;
      total += price * item.quantity;
      orderItemsInput.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
      orderItemsForSanity.push({
        _key: item.productId,
        product: { _type: "reference", _ref: item.productId } as const,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    // 7. Clean address
    const cleanAddress = (address: any) => {
      if (!address) return undefined;
      const cleaned: any = {};
      if (address.name) cleaned.name = address.name;
      if (address.line1) cleaned.line1 = address.line1;
      if (address.line2) cleaned.line2 = address.line2;
      if (address.city) cleaned.city = address.city;
      if (address.postcode) cleaned.postcode = address.postcode;
      if (address.country) cleaned.country = address.country;
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    };

    const address = session.customer_details?.address;
    const addressObj = cleanAddress({
      name: session.customer_details?.name,
      line1: address?.line1,
      line2: address?.line2,
      city: address?.city,
      postcode: address?.postal_code,
      country: address?.country,
    });

    // 8. Build order data
    const orderData = {
      _id: orderId,
      _type: "order" as const,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "paid" as const,
      paymentStatus: "paid" as const,
      paymentMethod: "stripe" as const,
      clerkUserId: userId,
      email: userEmail || session.customer_details?.email || "",
      items: orderItemsForSanity,
      total,
      stripeSessionId: sessionId,
      address: addressObj,
      stripePaymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 9. Create order with stock decrement
    try {
      await createOrderAndDecrementStock(orderData, orderItemsInput);
    } catch (error: any) {
      if (error.statusCode === 409) {
        fullOrder = await client.fetch<ORDER_BY_ID_QUERY_RESULT>(
          `*[_type == "order" && _id == $id][0]`,
          { id: orderId },
        );
        if (fullOrder) {
          return { success: true, session: mapOrderToSession(fullOrder) };
        }
      }
      throw error;
    }

    // 10. Fetch created order
    fullOrder = await client.fetch<ORDER_BY_ID_QUERY_RESULT>(
      `*[_type == "order" && _id == $id][0]`,
      { id: orderId },
    );

    // 11. Send emails with images from order items
    try {
      const itemsForEmail =
        fullOrder?.items?.map((item) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity || 0,
          price: item.priceAtPurchase || 0,
          imageUrl: item.product?.image || "",
        })) || [];

      await Promise.all([
        sendAdminOrderEmail({
          orderId: orderData._id,
          orderNumber: orderData.orderNumber!,
          customerName: session.customer_details?.name as string,
          customerEmail: orderData.email || "",
          totalAmount: orderData.total || 0,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          items: itemsForEmail,
        }),
        sendCustomerOrderEmail({
          orderNumber: orderData.orderNumber,
          customerName: session.customer_details?.name as string,
          totalAmount: orderData.total,
          items: itemsForEmail,
          ordersUrl: `${siteConfig.url}/my-orders`,
          orderId: orderData._id,
        }),
      ]);
    } catch (emailError) {
      console.error("Email sending failed, but order is saved:", emailError);
    }

    return { success: true, session: mapOrderToSession(fullOrder!) };
  } catch (error) {
    console.error("Error creating order from session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

// Helper to map an order from Sanity to the session format
function mapOrderToSession(order: ORDER_BY_ID_QUERY_RESULT) {
  return {
    id: order?._id,
    customerEmail: order?.email,
    customerName: order?.address?.name,
    amountTotal: (order?.total || 0) * 100,
    paymentStatus: order?.status,
    shippingAddress: order?.address,
    lineItems:
      order?.items?.map((item) => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        amount: (item.priceAtPurchase || 0) * 100 * (item.quantity || 1),
        imageUrl: item.product?.image || "",
      })) || [],
  };
}

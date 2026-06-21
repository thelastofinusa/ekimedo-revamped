/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { client, writeClient } from "@/sanity/lib/client";
import { sendAdminOrderEmail, sendCustomerOrderEmail } from "@/lib/order-email";
import { siteConfig } from "@/config/site.config";
import { createOrderAndDecrementStock } from "@/app/(pages)/checkout/actions";
import { ORDER_BY_ID_QUERY } from "@/sanity/queries/orders";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface OrderItemInput {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

// Helper to clean address (remove null/undefined and empty strings)
const cleanAddress = (
  address: any,
):
  | {
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      postcode?: string;
      country?: string;
    }
  | undefined => {
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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Invalid signature";
    console.error(`Webhook signature verification failed: ${errMsg}`);
    return NextResponse.json({ error: errMsg }, { status: 400 });
  }

  // Only handle checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    console.log(`Ignored event type: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Ensure the session is paid
  if (session.payment_status !== "paid") {
    console.log("Session not paid, skipping.");
    return NextResponse.json({ received: true });
  }

  const sessionId = session.id;
  const orderId = `order_${sessionId}`;

  // Idempotency check: order already exists?
  const existingOrder = await writeClient.fetch(ORDER_BY_ID_QUERY, {
    id: orderId,
  });
  if (existingOrder) {
    console.log(`Order ${orderId} already exists, skipping.`);
    return NextResponse.json({ received: true });
  }

  // Retrieve full session with expanded data
  const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent"],
  });

  // Build address object using the clean helper
  const address = fullSession.customer_details?.address;
  const addressObj = cleanAddress({
    name: fullSession.customer_details?.name,
    line1: address?.line1,
    line2: address?.line2,
    city: address?.city,
    postcode: address?.postal_code,
    country: address?.country,
  });

  const lineItems = fullSession.line_items?.data || [];
  const orderItemsInput: OrderItemInput[] = [];
  const orderItemsForSanity: Array<{
    _key: string;
    product: { _type: "reference"; _ref: string };
    quantity: number;
    priceAtPurchase: number;
  }> = [];
  let total = 0;

  // Build order items and compute total
  for (const item of lineItems) {
    const quantity = item.quantity || 0;
    const unitAmount = item.price?.unit_amount || 0;
    const price = unitAmount / 100;
    total += price * quantity;

    let productId: string | undefined;
    const product = item.price?.product;
    // Safely check if product is an object with metadata
    if (product && typeof product === "object" && "metadata" in product) {
      productId = product.metadata?.productId;
    }

    if (productId) {
      orderItemsInput.push({ productId, quantity, priceAtPurchase: price });
      orderItemsForSanity.push({
        _key: productId,
        product: { _type: "reference", _ref: productId },
        quantity,
        priceAtPurchase: price,
      });
    } else {
      console.warn("Product ID missing for line item:", item.description);
    }
  }

  const userId = fullSession.metadata?.clerkUserId;
  const userEmail =
    fullSession.customer_details?.email || fullSession.metadata?.userEmail;

  if (!userId) {
    console.error("No clerkUserId in session metadata");
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  if (orderItemsInput.length === 0) {
    console.error("No valid product items found in session");
    return NextResponse.json({ error: "No products" }, { status: 400 });
  }

  // Build order data
  const orderData = {
    _id: orderId,
    _type: "order" as const,
    orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "paid" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "stripe" as const,
    clerkUserId: userId,
    email: userEmail,
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

  try {
    // Atomically create order and decrement stock
    await createOrderAndDecrementStock(orderData, orderItemsInput);
    console.log(`Order ${orderId} created and stock decremented via webhook`);
  } catch (error: any) {
    // If duplicate (409), it's a race condition – order already exists
    if (error.statusCode === 409) {
      console.log(
        `Order ${orderId} already existed (race condition), ignoring.`,
      );
      return NextResponse.json({ received: true });
    }
    // For other errors, rethrow to let Stripe retry
    console.error("Transaction failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 },
    );
  }

  // Fetch the created order with product images for email
  const createdOrder = await client.fetch<{
    items?: Array<{
      _key: string;
      quantity: number | null;
      priceAtPurchase: number | null;
      product?: {
        name: string | null;
        image: string | null;
      } | null;
    }> | null;
  }>(
    `*[_type == "order" && _id == $id][0] { 
      items[] {
        _key,
        quantity,
        priceAtPurchase,
        product->{
          name,
          "image": images[0].asset->url
        }
      }
    }`,
    { id: orderId },
  );

  // Send emails (fire-and-forget)
  try {
    const itemsForEmail =
      createdOrder?.items?.map((item) => ({
        name: item.product?.name || "Product",
        quantity: item.quantity || 0,
        price: item.priceAtPurchase || 0,
        imageUrl: item.product?.image || "",
      })) || [];

    await Promise.all([
      sendAdminOrderEmail({
        orderId: orderId,
        orderNumber: orderData.orderNumber,
        customerName: fullSession.customer_details?.name as string,
        customerEmail: userEmail || "",
        totalAmount: total,
        paymentMethod: "stripe",
        paymentStatus: "paid",
        items: itemsForEmail,
      }),
      sendCustomerOrderEmail({
        orderNumber: orderData.orderNumber,
        customerName: fullSession.customer_details?.name as string,
        totalAmount: total,
        items: itemsForEmail,
        ordersUrl: `${siteConfig.url}/my-orders`,
        orderId: orderId,
      }),
    ]);
  } catch (emailError) {
    // Log but don't fail the webhook
    console.error("Email sending failed for order", orderId, emailError);
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { client, writeClient } from "@/sanity/lib/client";

import { QUERY_ORDER_BY_ID } from "@/sanity/queries/orders.query";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { getResend } from "@/lib/resend";
import { createOrderAndDecrementStock } from "@/actions/order.action";
import { AdminOrderEmail } from "@/components/emails/admin/adminOrder.email";
import { randomUUID } from "crypto";
import { CustomerOrderEmail } from "@/components/emails/customer/customerOrder.email";
import { siteConfig } from "@/config/site.config";
import { CustomerBookingEmail } from "@/components/emails/customer/customerBooking.email";
import { AdminBookingEmail } from "@/components/emails/admin/adminBooking.email";
import { QUERY_BOOKING_BY_ID } from "@/sanity/queries/booking.query";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret && process.env.NODE_ENV === "production") {
  console.error(
    "CRITICAL: STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail.",
  );
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface StripeAddress {
  name?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
}

interface CleanAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

// Helper to clean address (remove null/undefined and empty strings)
const cleanAddress = (
  address: StripeAddress | null | undefined,
): CleanAddress | undefined => {
  if (!address) return undefined;
  const cleaned: CleanAddress = {};
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
  const resend = getResend();

  try {
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured.");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }
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
  const metadata = session.metadata || {};

  // ... earlier code

  // -----------------------------------------------------------------
  // HANDLE CONSULTATION BOOKING
  // -----------------------------------------------------------------
  if (metadata.bookingId) {
    const bookingId = metadata.bookingId;

    // Idempotency: check if booking already marked as paid
    const existingBooking = await client.fetch<{
      _id: string;
      _rev: string;
      status: string;
    } | null>(`*[_type == "booking" && _id == $id][0]{ _id, _rev, status }`, {
      id: bookingId,
    });

    if (!existingBooking) {
      console.error(`Booking ${bookingId} not found.`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existingBooking.status === "paid") {
      console.log(`Booking ${bookingId} already paid, skipping.`);
      return NextResponse.json({ received: true });
    }

    // Update booking status to 'paid' with revision check for idempotency
    try {
      await writeClient
        .patch(bookingId)
        .ifRevisionId(existingBooking._rev)
        .set({ status: "paid" })
        .commit();
      console.log(`Booking ${bookingId} marked as paid via webhook.`);
    } catch (error) {
      // If revision mismatch, another webhook already updated it
      const patchError = error as { statusCode?: number };
      if (patchError.statusCode === 409) {
        console.log(
          `Booking ${bookingId} was already updated by another webhook (revision conflict), skipping.`,
        );
        return NextResponse.json({ received: true });
      }
      console.error(`Failed to update booking ${bookingId}:`, error);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 },
      );
    }

    // --- Send emails (fire-and-forget) ---
    let emailSentAdmin = false;
    let emailSentCustomer = false;

    try {
      const booking = await client.fetch(QUERY_BOOKING_BY_ID, {
        id: bookingId,
      });

      if (!booking) {
        console.error(`Booking ${bookingId} not found after update.`);
        throw new Error("Booking not found for email.");
      }

      const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

      // Admin email
      const { error: adminError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
        subject: `New Booking: ${booking.consultation?.title} from ${booking.customerName}`,
        react: AdminBookingEmail({
          bookingId: booking._id,
          consultationTitle: booking.consultation?.title || "",
          dateTime: booking.dateTime || "",
          customerName: booking.customerName || "",
          customerEmail: booking.customerEmail || "",
          customerPhone: booking.customerPhone || "",
          paymentMethod: booking.paymentMethod || "stripe",
          formFields: (booking.formFields || []).map((field) => ({
            fieldLabel: field.fieldLabel || "",
            fieldType: field.fieldType || "",
            fieldName: field.fieldName || "",
            value: field.value || "",
            files: Array.isArray(field.files)
              ? field.files
                  .filter((f) => f?.asset?.url != null)
                  .map((f) => ({ url: f.asset?.url }))
              : undefined,
          })) as {
            fieldLabel: string;
            fieldType: string;
            fieldName: string;
            value: string;
            files?:
              | {
                  url: string;
                }[]
              | undefined;
          }[],
          socialHandles,
        }),
      });
      if (!adminError) emailSentAdmin = true;

      // Customer email
      const { error: customerError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: booking.customerEmail as string,
        subject: `Booking Confirmation: ${booking.consultation?.title || ""}`,
        react: CustomerBookingEmail({
          customerName: booking.customerName || "",
          consultationTitle: booking.consultation?.title || "",
          dateTime: booking.dateTime || "",
          bookingId: booking._id,
          formFields: (booking.formFields || []).map((field) => ({
            fieldLabel: field.fieldLabel || "",
            fieldType: field.fieldType || "",
            fieldName: field.fieldName || "",
            value: field.value || "",
            files: Array.isArray(field.files)
              ? field.files
                  .filter((f) => f?.asset?.url != null)
                  .map((f) => ({ url: f.asset?.url }))
              : undefined,
          })) as {
            fieldLabel: string;
            fieldType: string;
            fieldName: string;
            value: string;
            files?:
              | {
                  url: string;
                }[]
              | undefined;
          }[],
          socialHandles,
        }),
      });
      if (!customerError) emailSentCustomer = true;
    } catch (emailError) {
      console.error("Email sending failed for booking", bookingId, emailError);
    } finally {
      // Update email statuses
      await writeClient
        .patch(bookingId)
        .set({
          emailSent: {
            admin: emailSentAdmin,
            customer: emailSentCustomer,
          },
        })
        .commit();
    }

    return NextResponse.json({ received: true });
  }

  // -----------------------------------------------------------------
  // HANDLE ORDER (existing logic)
  // -----------------------------------------------------------------
  if (!metadata.clerkUserId) {
    console.error("No clerkUserId or bookingId in session metadata");
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const orderId = `order_${sessionId}`;

  // Idempotency check: order already exists?
  const existingOrder = await client.fetch(QUERY_ORDER_BY_ID, { id: orderId });
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

  // For email items, we'll build a list from the line items
  const emailItems: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }> = [];

  for (const item of lineItems) {
    const quantity = item.quantity || 0;
    const unitAmount = item.price?.unit_amount || 0;
    const price = unitAmount / 100;
    total += price * quantity;

    const product = item.price?.product;
    // product is an expanded Stripe product
    let productId: string | undefined;
    let productName = "Product";
    let imageUrl = "";

    if (product && typeof product === "object") {
      // Product metadata has productId
      if ("metadata" in product) {
        productId = product.metadata?.productId;
      }
      // Product name
      if ("name" in product && typeof product.name === "string") {
        productName = product.name;
      }
      // Product images (array of strings)
      if (
        "images" in product &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        imageUrl = product.images[0];
      }
    }

    if (!productId) {
      throw new Error(`Product ID missing for line item: ${item.description}`);
    }

    const uniqueKey = randomUUID();

    orderItemsInput.push({ productId, quantity, priceAtPurchase: price });
    orderItemsForSanity.push({
      _key: uniqueKey,
      product: { _type: "reference", _ref: productId },
      quantity,
      priceAtPurchase: price,
    });

    emailItems.push({
      name: productName,
      quantity,
      price,
      imageUrl,
    });
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
  } catch (error: unknown) {
    // If duplicate (409), it's a race condition – order already exists
    const orderError = error as { statusCode?: number; message?: string };
    if (orderError.statusCode === 409) {
      console.log(
        `Order ${orderId} already existed (race condition), ignoring.`,
      );
      return NextResponse.json({ received: true });
    }
    // For other errors, rethrow to let Stripe retry
    console.error("Transaction failed:", error);
    return NextResponse.json(
      { error: orderError.message || "Failed to create order" },
      { status: 500 },
    );
  }

  // After order creation (inside the try block that catches errors)

  let emailSentAdmin = false;
  let emailSentCustomer = false;
  const socialHandles = await client.fetch(QUERY_SOCIAL_HANDLES);

  try {
    // Admin email
    const { error: adminError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
      subject: `New Order Received: ${orderData.orderNumber}`,
      react: AdminOrderEmail({
        orderId,
        orderNumber: orderData.orderNumber,
        customerName: fullSession.customer_details?.name as string,
        customerEmail: session.customer_email || "",
        total,
        paymentMethod: "stripe",
        paymentStatus: "paid",
        items: emailItems,
        socialHandles,
      }),
    });
    if (!adminError) emailSentAdmin = true;

    // Customer email
    const { error: customerError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: session.customer_email || "", // Send to the customer
      subject: `Order #${orderData.orderNumber} confirmation`,
      react: CustomerOrderEmail({
        customerName: fullSession.customer_details?.name as string,
        orderId,
        orderNumber: orderData.orderNumber,
        ordersUrl: `${siteConfig.url}/orders`,
        totalAmount: total,
        items: emailItems,
        socialHandles,
      }),
    });
    if (!customerError) emailSentCustomer = true;
  } catch (emailError) {
    console.error("Email sending failed for order", orderId, emailError);
  } finally {
    // Update the order with email statuses
    await writeClient
      .patch(orderId)
      .set({
        emailSent: {
          admin: emailSentAdmin,
          customer: emailSentCustomer,
        },
      })
      .commit();
  }

  return NextResponse.json({ received: true });
}

"use server";

import { getStripe } from "@/lib/stripe";

export async function createCheckoutSession(
  bookingId: string,
  consultationTitle: string,
  amount: number,
  customerEmail: string,
  consultationSlug: string,
) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation: ${consultationTitle}`,
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book-consultation/${consultationSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book-consultation/${consultationSlug}?payment=cancel`,
      customer_email: customerEmail,
      metadata: {
        bookingId,
      },
    });

    return { sessionId: session.id, sessionUrl: session.url };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return { error: "Failed to create payment session." };
  }
}

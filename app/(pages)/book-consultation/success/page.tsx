import { redirect } from "next/navigation";
import { client, writeClient } from "@/sanity/lib/client";
import { getResend } from "@/lib/resend";
import AdminBookingNotificationEmail from "@/components/emails/admin-booking-notification";
import { getStripe } from "@/lib/stripe";
import Link from "next/link";
import { SOCIAL_QUERY } from "@/sanity/queries/socials";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/book-consultation");
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Payment not completed. Please try again.</p>
      </div>
    );
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    return <div>No booking ID found.</div>;
  }

  // Fetch CURRENT booking status before doing anything
  const booking = await client.fetch(
    `*[_type == "booking" && _id == $id][0]{
      _id,
      status,
      customerName,
      customerEmail,
      customerPhone,
      dateTime,
      consultation->{ title }
    }`,
    { id: bookingId },
  );
  const socialHandles = await client.fetch(SOCIAL_QUERY);

  if (!booking) {
    return <div>Booking not found.</div>;
  }

  // ✅ IDEMPOTENCY: only patch + email if not already paid/confirmed/delivered
  const alreadyProcessed = ["paid", "confirmed", "delivered"].includes(
    booking.status,
  );

  if (!alreadyProcessed) {
    const resend = getResend();
    // Update booking status to "paid"
    await writeClient.patch(bookingId).set({ status: "paid" }).commit();

    // Send admin email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.NEXT_PUBLIC_RESEND_OWNER_EMAIL!,
        subject: `New Booking: ${booking.consultation.title}`,
        react: AdminBookingNotificationEmail({
          customerName: booking.customerName,
          serviceTitle: booking.consultation?.title || "Consultation",
          dateTime: new Date(booking.dateTime),
          location: "in-person",
          bookingId: booking._id,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
          socialLinks: socialHandles,
        }),
      });
    } catch (error) {
      console.error("Admin email failed:", error);
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold">Payment Successful!</h1>
      <p className="mt-4">
        Your booking has been confirmed. You will receive a confirmation email
        shortly.
      </p>
      <Link href="/" className="mt-6 text-blue-600 underline">
        Return to Home
      </Link>
    </div>
  );
}

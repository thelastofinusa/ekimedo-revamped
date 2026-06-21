import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { resend } from "@/lib/resend";
import AppointmentConfirmationEmail from "@/components/emails/appointment-confirmation";

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Fetch booking with consultation details
    const booking = await writeClient.fetch(
      `*[_type == "booking" && _id == $id][0]{
        _id,
        customerName,
        customerEmail,
        customerPhone,
        dateTime,
        status,
        consultation->{
          title
        }
      }`,
      { id: bookingId },
    );

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only proceed if status is "paid"
    if (booking.status !== "paid") {
      return NextResponse.json(
        { error: "Booking is not in paid status" },
        { status: 400 },
      );
    }

    // Send client email
    let emailError: string | null = null;
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: booking.customerEmail,
        subject: "Your Booking is Confirmed!",
        react: AppointmentConfirmationEmail({
          customerName: booking.customerName,
          serviceTitle: booking.consultation?.title || "Consultation",
          dateTime: new Date(booking.dateTime),
          location: "in-person",
          calendarUrl: "https://calendar.google.com/...",
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        }),
      });
    } catch (error) {
      console.error("Failed to send client email:", error);
      emailError =
        error instanceof Error ? error.message : "Failed to send email";
    }

    // Update booking status based on email success
    let newStatus = "confirmed"; // default
    if (!emailError) {
      newStatus = "delivered";
    }
    await writeClient.patch(bookingId).set({ status: newStatus }).commit();

    return NextResponse.json({
      success: true,
      status: newStatus,
      emailError,
    });
  } catch (error) {
    console.error("Error in booking confirmation:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_CONSULTATION_BY_SLUG } from "@/sanity/queries/consultation.query";
import { QUERY_BOOKING_BY_STRIPE_SESSION_ID } from "@/sanity/queries/booking.query";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { SubmitForm } from "./components/submit";
import { cancelBooking } from "@/actions/consultation.action";

export async function generateMetadata(
  props: PageProps<"/consultations/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const consultation = await client.fetch(
    QUERY_CONSULTATION_BY_SLUG,
    { onPMPage: null, slug },
    clientOptions,
  );

  if (!consultation) return notFound();

  return {
    title: consultation.title || "Consultation",
    description: consultation.description || "Book a dress consultation",
    openGraph: {
      type: "website",
      locale: "en_US",
      title: consultation.title as string,
      siteName: siteConfig.title,
      description: consultation.description as string,
      images: [
        {
          url: consultation.image ?? "",
          width: 1200,
          height: 630,
          alt: consultation.title as string,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: consultation.title as string,
      description: consultation.description as string,
      images: [consultation.image ?? ""],
    },
  };
}

export default async function ConsultationDetails(
  props: PageProps<"/consultations/[slug]">,
): Promise<React.JSX.Element> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const payment = searchParams.payment;
  const sessionId = searchParams.session_id;
  const bookingIdFromUrl = searchParams.booking_id;

  let paymentStatus: "success" | "failed" | null = null;
  let cancelMessage: string | null = null;
  let bookingId: string | null = null;

  // Handle payment failed – cancel booking if booking_id is present
  if (payment === "failed" && bookingIdFromUrl) {
    const result = await cancelBooking(bookingIdFromUrl as string);
    if (result.success) {
      cancelMessage = "Your booking has been cancelled. You can try again.";
    } else {
      cancelMessage = result.message || "Failed to cancel booking.";
    }
    paymentStatus = "failed";
  }
  // Handle payment success – fetch booking using session_id
  else if (payment === "success" && sessionId) {
    paymentStatus = "success";
    const booking = await client.fetch(
      QUERY_BOOKING_BY_STRIPE_SESSION_ID,
      { sessionId },
      clientOptions,
    );
    if (booking) {
      bookingId = booking._id;
    }
  }

  const consultation = await client.fetch(
    QUERY_CONSULTATION_BY_SLUG,
    { onPMPage: null, slug },
    clientOptions,
  );

  if (!consultation) return notFound();

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        isDynamic
        imagePath={consultation.image as string}
        title={consultation.title as string}
        description={consultation.description as string}
      />

      <SubmitForm
        consultation={consultation}
        paymentStatus={paymentStatus}
        bookingId={bookingId as string}
        cancelMessage={
          cancelMessage || "Your payment was not completed. Please try again."
        }
      />
    </div>
  );
}

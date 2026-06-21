import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { client, clientOptions, writeClient } from "@/sanity/lib/client";
import { CONSULTATION_BY_SLUG_QUERY } from "@/sanity/queries/consultation";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingForm } from "./components/booking-form";
import { sanityFetch } from "@/sanity/lib/live";
import { getStripe } from "@/lib/stripe";

// Helper to safely get a single string from searchParams
function getParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata(
  props: PageProps<"/book-consultation/[type]">,
): Promise<Metadata> {
  const { type } = await props.params;
  const consultation = await client.fetch(
    CONSULTATION_BY_SLUG_QUERY,
    { onPMPage: false, slug: type },
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

export default async function ConsultationType(
  props: PageProps<"/book-consultation/[type]">,
) {
  const { type } = await props.params;
  const searchParams = await props.searchParams;

  const payment = getParam(searchParams.payment);
  const sessionId = getParam(searchParams.session_id);
  const bookingIdParam = getParam(searchParams.booking_id);

  let paymentStatus: "success" | "cancel" | "error" | null = null;
  let bookingId: string | null = null;
  let consultationTitle: string | null = null;

  // Check for payment confirmation
  if (payment === "success") {
    if (sessionId) {
      // Stripe
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          const bId = session.metadata?.bookingId;
          if (bId) {
            const booking = await writeClient.fetch(
              `*[_type == "booking" && _id == $id][0]{ status, consultation->{ title } }`,
              { id: bId },
            );
            if (booking && booking.status !== "paid") {
              await writeClient.patch(bId).set({ status: "paid" }).commit();
              // Optionally send emails here if not handled by webhook
            }
            bookingId = bId;
            consultationTitle = booking?.consultation?.title;
            paymentStatus = "success";
          }
        }
      } catch (error) {
        console.error("Stripe verification error:", error);
        paymentStatus = "error";
      }
    } else if (bookingIdParam) {
      // PayPal or other
      const booking = await writeClient.fetch(
        `*[_type == "booking" && _id == $id][0]{ status, consultation->{ title } }`,
        { id: bookingIdParam },
      );
      if (booking && booking.status === "paid") {
        bookingId = bookingIdParam;
        consultationTitle = booking?.consultation?.title;
        paymentStatus = "success";
      } else {
        paymentStatus = "error";
      }
    }
  } else if (payment === "cancel") {
    paymentStatus = "cancel";
  } else if (payment === "error") {
    paymentStatus = "error";
  }

  const { data: consultation } = await sanityFetch({
    query: CONSULTATION_BY_SLUG_QUERY,
    params: { onPMPage: false, slug: type },
  });

  if (!consultation) return notFound();

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        isDynamic
        imagePath={consultation.image as string}
        title={consultation.title as string}
        description={consultation.description as string}
      />

      <BookingForm
        consultation={consultation}
        paymentStatus={paymentStatus}
        bookingId={bookingId}
        consultationTitle={consultationTitle}
      />
    </div>
  );
}

import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { client, clientOptions } from "@/sanity/lib/client";
import { CONSULTATION_BY_SLUG_QUERY } from "@/sanity/queries/consultation.query";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingForm } from "./components/booking-form";

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
  const consultation = await client.fetch(
    CONSULTATION_BY_SLUG_QUERY,
    { onPMPage: false, slug: type },
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

      <BookingForm consultation={consultation} />
    </div>
  );
}

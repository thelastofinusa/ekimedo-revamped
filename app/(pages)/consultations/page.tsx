import { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { HeroComp } from "@/components/shared/hero";

import { sanityFetch } from "@/sanity/lib/live";
import { QUERY_CONSULTATIONS } from "@/sanity/queries/consultation.query";
import { RenderConsultations } from "./components/render";
import { BookingProcess } from "./components/process";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_BOOKING_PROCESS } from "@/sanity/queries/process.query";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "The Consultation fee goes toward dress production if you wish to move forward with the process, otherwise The Consultation fee is NONREFUNDABLE.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Book a Consultation",
    siteName: siteConfig.title,
    description:
      "The Consultation fee goes toward dress production if you wish to move forward with the process, otherwise The Consultation fee is NONREFUNDABLE.",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Consultation",
    description:
      "The Consultation fee goes toward dress production if you wish to move forward with the process, otherwise The Consultation fee is NONREFUNDABLE.",
    images: ["/opengraph.png"],
  },
};

export default async function Consultation() {
  const { data: consultations } = await sanityFetch({
    query: QUERY_CONSULTATIONS,
    params: { onPMPage: false },
  });
  const process = await client.fetch(QUERY_BOOKING_PROCESS, {}, clientOptions);

  return (
    <div className="flex-1 relative overflow-x-clip">
      <HeroComp
        title="Find Your Perfect Dress"
        description={
          <span>
            The Consultation fee goes toward dress production if you wish to
            move forward with the process, otherwise The Consultation fee is{" "}
            <strong className="text-background uppercase">nonrefundable</strong>
            .
          </span>
        }
        imagePath="consultation.png"
      />

      <RenderConsultations consultations={consultations} />
      <BookingProcess process={process} />
    </div>
  );
}

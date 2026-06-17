import { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { HeroComp } from "@/components/shared/hero";
import { Consultations } from "./components/consultations";
import { consultationsData } from "@/constants/consultation";

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
        url: "/og.png",
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
    images: ["/twitter-image.png"],
  },
};

export default async function BookConsultation(
  props: PageProps<"/book-consultation/[type]">,
) {
  const { success, canceled } = await props.searchParams;

  const messageType =
    success === "true" ? "success" : canceled === "true" ? "canceled" : null;

  return (
    <div className="flex-1 overflow-x-clip">
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

      <Consultations data={consultationsData} messageType={messageType} />
    </div>
  );
}

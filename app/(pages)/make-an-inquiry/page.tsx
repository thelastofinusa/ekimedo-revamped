import { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { HeroComp } from "@/components/shared/hero";
import { SubmitForm } from "./components/submit";

export const metadata: Metadata = {
  title: "Make An Inquiry",
  description:
    "Bring your dream dress to life. Our bespoke service creates one-of-a-kind pieces tailored perfectly to your vision and measurements.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Make An Inquiry",
    siteName: siteConfig.title,
    description:
      "Bring your dream dress to life. Our bespoke service creates one-of-a-kind pieces tailored perfectly to your vision and measurements.",
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
    title: "Make An Inquiry",
    description:
      "Bring your dream dress to life. Our bespoke service creates one-of-a-kind pieces tailored perfectly to your vision and measurements.",
    images: ["/opengraph.png"],
  },
};

export default function MakeAnInquiry() {
  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Make An Inquiry"
        description="Bring your dream dress to life. Our bespoke service creates
            one-of-a-kind pieces tailored perfectly to your vision and
            measurements."
        imagePath="inquiry.jpeg"
      />

      <SubmitForm />
    </div>
  );
}

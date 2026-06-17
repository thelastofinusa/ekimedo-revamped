import { Metadata } from "next";
import { ConsultationCard } from "@/components/shared/consultation-card";
import { Container } from "@/components/shared/container";
import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { CONSULTATION_QUERY } from "@/sanity/queries/consultation.query";
import { sanityFetch } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: "Pre-made Dresses",
  description:
    "Shop our collection of pre-made dresses. Find the perfect piece to suit your style and measurements.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Pre-made Dresses",
    siteName: siteConfig.title,
    description:
      "Shop our collection of pre-made dresses. Find the perfect piece to suit your style and measurements.",
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
    title: "Pre-made Dresses",
    description:
      "Shop our collection of pre-made dresses. Find the perfect piece to suit your style and measurements.",
    images: ["/twitter-image.png"],
  },
};

export default async function PreMadeDresses() {
  const { data: consultations } = await sanityFetch({
    query: CONSULTATION_QUERY,
    params: { onPMPage: true },
  });

  return (
    <div className="flex flex-col">
      <HeroComp
        title="Pre-Made Dresses"
        description="Explore our curated selection of luxury fashion pieces, each crafted with unparalleled attention to detail."
        imagePath="shop.jpeg"
      />
      <div className="bg-secondary/30 py-24 lg:py-32">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:gap-16 lg:gap-24">
            {consultations.map((service, index) => (
              <ConsultationCard key={index} data={service} />
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}

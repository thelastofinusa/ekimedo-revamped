import { Container } from "@/components/shared/container";
import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { sanityFetch } from "@/sanity/lib/live";
import { QUERY_CONSULTATIONS } from "@/sanity/queries/consultation.query";
import { Metadata } from "next";
import React, { Suspense } from "react";
import { ConsultationCard } from "../consultations/components/render";
import { QUERY_PRODUCT } from "@/sanity/queries/product.query";
import { QUERY_CATEGORIES } from "@/sanity/queries/category.query";
import { QUERY_PRODUCT_COLOR } from "@/sanity/queries/color";
import { ProductGrid, ProductGridSkeleton } from "./components/product-grid";
import { Filters } from "./components/filters";

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
        url: "/opengraph.png",
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
    images: ["/opengraph.png"],
  },
};

export default async function PreMadeDresses() {
  const { data: products } = await sanityFetch({ query: QUERY_PRODUCT });
  const { data: categories } = await sanityFetch({ query: QUERY_CATEGORIES });
  const { data: colors } = await sanityFetch({ query: QUERY_PRODUCT_COLOR });
  const { data: consultations } = await sanityFetch({
    query: QUERY_CONSULTATIONS,
    params: { onPMPage: true },
  });

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Pre-Made Dresses"
        description="Explore our curated selection of luxury fashion pieces, each crafted with unparalleled attention to detail."
        imagePath="shop.jpeg"
      />

      <div className="py-24 lg:py-32">
        <Container className="relative flex flex-col gap-6 md:flex-row md:gap-8">
          <Suspense>
            <Filters
              categories={categories}
              colors={colors}
              products={products}
            />
          </Suspense>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} />
          </Suspense>
        </Container>
      </div>

      {consultations.length > 0 && (
        <div className="bg-secondary/30 py-24 lg:py-32">
          <Container>
            <div className="grid grid-cols-1 gap-12 md:gap-16 lg:gap-24">
              {consultations.map((consultation, index) => (
                <ConsultationCard key={index} consultations={consultation} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

import { siteConfig } from "@/config/site.config";
import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCT_BY_SLUG_QUERY } from "@/sanity/queries/product";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { ProductDetails } from "../components/details";
import { Container } from "@/components/shared/container";

export const generateMetadata = async (
  props: PageProps<"/pre-made-dresses/[slug]">,
): Promise<Metadata> => {
  const { slug } = await props.params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!product) notFound();

  // Get image URLs from snapshots, filtering only images
  const imageUrls = (product.snapshots ?? [])
    .filter((s) => s !== null && s._type === "image")
    .map((s) => s.url);

  const firstImage = imageUrls[0] ?? "";

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: "website",
      locale: "en_US",
      title: product.name!,
      siteName: siteConfig.title,
      description: product.description!,
      images: firstImage
        ? [
            {
              url: firstImage,
              width: 1200,
              height: 630,
              alt: product.name!,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name!,
      description: product.description!,
      images: [...imageUrls] as string[],
    },
  };
};

export default async function PreMadeDressDetails(
  props: PageProps<"/pre-made-dresses/[slug]">,
) {
  const { slug } = await props.params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!product) notFound();

  return (
    <div className="py-28 md:py-36">
      <Container size="sm">
        <ProductDetails product={product} />
      </Container>
    </div>
  );
}

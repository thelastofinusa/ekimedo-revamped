import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { Metadata } from "next";
import { ReviewsComp } from "./components/review";
import { Container } from "@/components/shared/container";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { client, clientOptions } from "@/sanity/lib/client";
import { REVIEW_QUERY } from "@/sanity/queries/review";

export const metadata: Metadata = {
  title: "Client Reviews",
  description: `Read what our clients have to say about ${siteConfig.title}.`,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Client Reviews",
    siteName: siteConfig.title,
    description: `Read what our clients have to say about ${siteConfig.title}.`,
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
    title: "Client Reviews",
    description: `Read what our clients have to say about ${siteConfig.title}.`,
    images: ["/twitter-image.png"],
  },
};

export default async function Reviews() {
  const reviews = await client.fetch(REVIEW_QUERY, {}, clientOptions);

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Stories of Transformation"
        description={
          <span>
            &quot;Real experiences from individuals who trusted{" "}
            {siteConfig.title} with their most cherished moments. Discover the
            elegance and craftsmanship that defines our Maison.&quot;
          </span>
        }
        imagePath="testimonials.jpeg"
      />

      <ReviewsComp reviews={reviews} />

      <section className="bg-card py-24">
        <Container size="xs" className="text-center">
          <div className="mb-10 flex flex-col items-center">
            <p className="mb-2 font-serif text-xl italic">
              Reflect on your couture journey
            </p>

            <pre className="text-muted-foreground mx-auto mb-10 max-w-xl font-sans text-sm whitespace-pre-wrap sm:text-base">
              If we&apos;ve had the privilege of creating your garment,
              we&apos;d be honored to hear about your experience and celebrate
              the final result with you.
            </pre>
            <Link
              href="/reviews/new"
              className={buttonVariants({ size: "lg" })}
            >
              Share Your Review
            </Link>
          </div>

          <div className="border-border/50 border-t pt-16 text-sm leading-relaxed font-light sm:text-base">
            <p className="mx-auto max-w-2xl">
              <strong>Note:</strong> Reviews are reserved for clients who have
              completed a consultation, alteration, or custom design service.
              All submissions are reviewed before being published.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

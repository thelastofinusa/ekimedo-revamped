import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { Metadata } from "next";
import { NewReviewForm } from "../components/new-review-form";

export const metadata: Metadata = {
  title: "New Review",
  description:
    "Your story matters. Tell us about your experience and how our craftsmanship played a part in your special moment.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "New Review",
    siteName: siteConfig.title,
    description:
      "Your story matters. Tell us about your experience and how our craftsmanship played a part in your special moment.",
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
    title: "New Review",
    description:
      "Your story matters. Tell us about your experience and how our craftsmanship played a part in your special moment.",
    images: ["/twitter-image.png"],
  },
};

export default function NewReview() {
  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Share Your Experience"
        description="Your story matters. Tell us about your experience and how our craftsmanship played a part in your special moment."
        imagePath="testimonials.jpeg"
      />

      <NewReviewForm />
    </div>
  );
}

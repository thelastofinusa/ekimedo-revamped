import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { Metadata } from "next";
import { CheckoutItems } from "./components/checkout-items";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout your items",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Checkout",
    siteName: siteConfig.title,
    description: "Checkout your items",
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
    title: "Checkout",
    description: "Checkout your items",
    images: ["/twitter-image.png"],
  },
};

export default function Checkout() {
  return (
    <div className="py-28 lg:py-36">
      <Container size="sm">
        <Suspense fallback="...">
          <CheckoutItems />
        </Suspense>
      </Container>
    </div>
  );
}

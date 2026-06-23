import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_FAQ } from "@/sanity/queries/faq.query";
import { QUERY_CATEGORIES } from "@/sanity/queries/category.query";
import { QUERY_SOCIAL_HANDLES } from "@/sanity/queries/social.query";
import { FAQsComp } from "./components/faqs";
import { CTA } from "@/components/shared/cta";
import { SubmitForm } from "./components/submit";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with us for any inquiries, support, or feedback. We're here to help and would love to hear from you!",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Contact Us",
    siteName: siteConfig.title,
    description:
      "Get in touch with us for any inquiries, support, or feedback. We're here to help and would love to hear from you!",
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
    title: "Contact Us",
    description:
      "Get in touch with us for any inquiries, support, or feedback. We're here to help and would love to hear from you!",
    images: ["/opengraph.png"],
  },
};

export default async function Contact() {
  const faqs = await client.fetch(QUERY_FAQ, {}, clientOptions);
  const categories = await client.fetch(QUERY_CATEGORIES, {}, clientOptions);
  const consultations = await client.fetch(
    `*[_type == "consultation"] {
    _id,
    "name": title,
    "slug": slug.current,
  }`,
    { onPMPage: null },
    clientOptions,
  );
  const socialHandles = await client.fetch(
    QUERY_SOCIAL_HANDLES,
    {},
    clientOptions,
  );

  const combined = [...categories, ...consultations];

  return (
    <div className="flex-1 overflow-x-clip">
      <SubmitForm categories={combined} socialHandles={socialHandles} />
      <FAQsComp faqs={faqs} />
      <CTA
        mode="light"
        title="Ready to Transform Your Style?"
        description="Book a consultation with our expert stylists and discover a wardrobe that truly reflects who you are."
        route={{
          txt: "Book a Consultation",
          path: "/consultations",
        }}
      />
    </div>
  );
}

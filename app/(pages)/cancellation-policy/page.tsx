import { Metadata } from "next";

import { Policy } from "./component/policy";
import { siteConfig } from "@/config/site.config";
import { HeroComp } from "@/components/shared/hero";
import { client, clientOptions } from "@/sanity/lib/client";
import { CANCELLATION_POLICY_QUERY } from "@/sanity/queries/cancellation-policy.query";

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
        url: "/og.png",
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
    images: ["/twitter-image.png"],
  },
};

export default async function CancellationPolicy() {
  const policies = await client.fetch(
    CANCELLATION_POLICY_QUERY,
    {},
    clientOptions,
  );

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Cancellation Policy"
        description="Transparent terms to ensure a seamless experience from your first
              consultation to the final fitting of your custom gown."
      />

      <Policy policies={policies} />
    </div>
  );
}

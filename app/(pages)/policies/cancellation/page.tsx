import { HeroComp } from "@/components/shared/hero";
import { siteConfig } from "@/config/site.config";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_CANCELLATION_POLICY } from "@/sanity/queries/cancellationPolicy.query";
import { Metadata } from "next";
import { Policy } from "./component/policy";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "Get in touch with us for any inquiries, support, or feedback. We're here to help and would love to hear from you!",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Cancellation Policy",
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
    title: "Cancellation Policy",
    description:
      "Get in touch with us for any inquiries, support, or feedback. We're here to help and would love to hear from you!",
    images: ["/opengraph.png"],
  },
};

export default async function CancellationPolicy() {
  const policies = await client.fetch(
    QUERY_CANCELLATION_POLICY,
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

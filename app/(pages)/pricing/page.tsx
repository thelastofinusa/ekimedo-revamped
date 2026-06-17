import { Container } from "@/components/shared/container";
import { HeroComp } from "@/components/shared/hero";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/format";
import { client, clientOptions } from "@/sanity/lib/client";
import { PRICING_TIERS_QUERY } from "@/sanity/queries/pricing.query";
import {
  CheckCheckIcon,
  RulerIcon,
  ScissorsIcon,
  SparklesIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Because every gown is custom-designed, final pricing depends on your selected style, fabric, detailing and production timeline. Below are starting ranges to help you plan.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Pricing",
    siteName: siteConfig.title,
    description:
      "Because every gown is custom-designed, final pricing depends on your selected style, fabric, detailing and production timeline. Below are starting ranges to help you plan.",
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
    title: "Pricing",
    description:
      "Because every gown is custom-designed, final pricing depends on your selected style, fabric, detailing and production timeline. Below are starting ranges to help you plan.",
    images: ["/twitter-image.png"],
  },
};

export default async function Pricing() {
  const pricingTiers = await client.fetch(
    PRICING_TIERS_QUERY,
    {},
    clientOptions,
  );

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Couture Pricing"
        description="Because every gown is custom-designed, final pricing depends on your
            selected style, fabric, detailing and production timeline. Below are
            starting ranges to help you plan."
        imagePath="pricing.jpg"
      />

      {/* Main Pricing Section */}
      <section className="bg-secondary/30 py-24">
        <Container>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Left Column: Process Highlights */}
            <div className="space-y-12 lg:sticky lg:top-28 lg:col-span-4">
              <Card className="p-8">
                <h3 className="mb-4 font-serif text-2xl">
                  The Atelier Experience
                </h3>
                <ul className="space-y-6">
                  {[
                    {
                      icon: SparklesIcon,
                      title: "Bespoke Design",
                      desc: "Crafted from scratch to your proportions.",
                    },
                    {
                      icon: ScissorsIcon,
                      title: "Luxury Fabrics",
                      desc: "The finest silks, laces, and hand-beading.",
                    },
                    {
                      icon: RulerIcon,
                      title: "Perfect Fit",
                      desc: "Multiple fittings ensure flawless silhouette.",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="bg-primary-foreground text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <item.icon size={18} />
                      </div>
                      <div className="mt-0.5">
                        <p className="text-xs font-medium tracking-widest uppercase">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Right Column: Pricing Tiers */}
            <div className="space-y-6 lg:col-span-8">
              {pricingTiers?.map((tier, idx: number) => (
                <Card
                  key={idx}
                  className="p-8 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
                    {/* Tier Info */}
                    <div className="flex-1">
                      <h2 className="group-hover:text-primary mb-3 font-serif text-3xl font-normal transition-colors">
                        {tier.name}
                      </h2>
                      <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed font-normal">
                        {tier.description}
                      </p>

                      {/* Features Grid */}
                      <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                        {tier.features?.map((feature, fIdx: number) => (
                          <div
                            key={fIdx}
                            className="text-muted-foreground flex items-center gap-2 text-[13px]"
                          >
                            <CheckCheckIcon
                              size={14}
                              className="text-primary shrink-0"
                            />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="border-border/50 flex shrink-0 flex-col items-center justify-center border-t pt-6 md:items-end md:border-t-0 md:pt-0">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="bg-primary-foreground text-primary rounded px-2 py-1 text-[9px] font-medium tracking-[0.2em] uppercase">
                          Starts At
                        </span>
                      </div>
                      <div className="text-primary mb-6 text-4xl">
                        {formatPrice(tier.price)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-card py-24">
        <Container size="xs" className="text-center">
          <div className="mb-10 flex flex-col items-center">
            <p className="mb-2 font-serif text-xl italic">
              Ready to start your journey?
            </p>
            <pre className="text-muted-foreground mx-auto mb-10 max-w-xl font-sans text-sm whitespace-pre-wrap sm:text-base">
              Book a consultation and let&apos;s bring your vision to life.
            </pre>
            <Link
              href="/book-consultation"
              className={buttonVariants({ size: "lg" })}
            >
              Schedule Consultation
            </Link>
          </div>

          <div className="border-border/50 border-t pt-16 text-sm leading-relaxed font-light sm:text-base">
            <p>
              <strong>Note:</strong> Our pre-made dresses begin at{" "}
              <strong>$1,500</strong>. <br />
              Custom designs fall within the mid-luxury to high-luxury range.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}

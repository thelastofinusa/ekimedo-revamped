import { Container } from "@/components/shared/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/config/site.config";
import {
  BanknoteArrowUpIcon,
  CalendarRangeIcon,
  BanknoteArrowDownIcon,
  PuzzleIcon,
  RulerDimensionLine,
  ShirtIcon,
} from "lucide-react";
import { Metadata } from "next";
import { ContactForm } from "./components/contact-form";
import { client, clientOptions } from "@/sanity/lib/client";
import { CATEGORIES_QUERY } from "@/sanity/queries/category.query";
import { SOCIAL_QUERY } from "@/sanity/queries/socials.query";
import { FAQ_QUERY } from "@/sanity/queries/faq.query";

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

const bookingProcess = [
  {
    id: "consultation",
    title: "Consultation",
    description:
      "A personalized 1-on-1 session to discuss your vision, preferences, and design goals.",
    icon: CalendarRangeIcon,
  },
  {
    id: "deposit",
    title: "Pay Deposit",
    description:
      "Confirm your order and secure your production slot after the consultation.",
    icon: BanknoteArrowDownIcon,
  },
  {
    id: "consultation-fee",
    title: "Consultation Fee",
    description:
      "A non-refundable fee required to book and confirm your consultation session.",
    icon: BanknoteArrowUpIcon,
  },
  {
    id: "measurements",
    title: "Measurements",
    description:
      "Detailed body measurements taken to ensure a precise, tailored fit.",
    icon: RulerDimensionLine,
  },
  {
    id: "fabric-selection",
    title: "Fabric Selection",
    description:
      "Choose from curated premium textiles that match your desired look and feel.",
    icon: ShirtIcon,
  },
  {
    id: "production",
    title: "Dress Production",
    description:
      "Your dress is meticulously handcrafted by our master tailors.",
    icon: PuzzleIcon,
  },
];

export default async function ContactUs() {
  const faqs = await client.fetch(FAQ_QUERY, {}, clientOptions);
  const categories = await client.fetch(CATEGORIES_QUERY, {}, clientOptions);
  const socialHandles = await client.fetch(SOCIAL_QUERY, {}, clientOptions);

  return (
    <div className="flex-1 overflow-x-clip">
      <ContactForm categories={categories} socialHandles={socialHandles} />

      {faqs.length > 0 && (
        <div className="bg-foreground text-background py-24 lg:py-32">
          <Container size="sm">
            <div className="flex flex-col gap-10 md:flex-row md:gap-16">
              <div className="md:w-1/3">
                <h2 className="font-serif text-4xl capitalize md:sticky md:top-28 md:text-5xl">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="md:w-2/3">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="faq-1"
                  className="w-full space-y-4"
                >
                  {faqs.map((item, idx) => (
                    <AccordionItem
                      key={item._id}
                      value={`faq-${idx + 1}`}
                      className="border-border/50 border px-4 shadow-xs last:border-b"
                    >
                      <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                        <p className="font-sans text-base">{item.question}</p>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5">
                        <div className="bg-card text-foreground p-4">
                          <pre className="font-sans text-sm whitespace-pre-wrap">
                            {item.answer}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </Container>
        </div>
      )}

      <div className="py-24 lg:py-32" id="productionProcess">
        <Container size="sm">
          <div className="flex flex-col gap-10 md:gap-16">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-serif text-4xl capitalize md:text-5xl">
                The Design Process
              </h2>
            </div>

            <div className="mx-auto">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {bookingProcess.map((process) => (
                  <div
                    key={process.id}
                    className="bg-card border-border border p-6 shadow-xs xl:p-8"
                  >
                    <div className="relative flex aspect-square size-12 rounded-full border">
                      <process.icon className="m-auto size-5" />
                    </div>

                    <div className="mt-6 flex flex-1 flex-col gap-2">
                      <h2 className="font-serif text-xl leading-none md:text-lg">
                        {process.title}
                      </h2>
                      <p className="text-muted-foreground text-sm font-normal">
                        {process.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

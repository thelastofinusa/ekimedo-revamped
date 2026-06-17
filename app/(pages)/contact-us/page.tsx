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

export const faqs = [
  {
    _id: "faq-1",
    question: "How far in advance should I book my custom gown?",
    answer:
      "We recommend booking your consultation at least 4–8 months before your event. This allows sufficient time for design development, fabric sourcing, fittings, and final adjustments. Rush orders may be accepted depending on availability.",
  },
  {
    _id: "faq-2",
    question: "Do you only create bridal gowns?",
    answer:
      "No. In addition to bridal gowns, we design reception dresses, evening gowns, prom dresses, engagement outfits, special occasion wear, and other custom luxury garments.",
  },
  {
    _id: "faq-3",
    question: "How much does a custom gown cost?",
    answer:
      "Pricing varies depending on the complexity of the design, fabric selection, embellishments, and production timeline. Custom gowns typically begin in the mid-luxury range, while highly detailed couture pieces are priced individually after consultation.",
  },
  {
    _id: "faq-4",
    question: "Do you offer virtual consultations?",
    answer:
      "Yes. We work with clients worldwide through virtual consultations. Measurements, fittings, and design discussions can be coordinated remotely when necessary.",
  },
  {
    _id: "faq-5",
    question: "What happens during the consultation?",
    answer:
      "During your consultation, we discuss your vision, event details, preferred silhouettes, fabrics, inspiration references, timeline, and budget. We then provide guidance on the best approach for your custom design.",
  },
  {
    _id: "faq-6",
    question: "Can you recreate a dress from a photo?",
    answer:
      "We can use inspiration photos as a reference, but every gown is designed uniquely for each client. Rather than producing exact copies, we create original pieces tailored to your preferences and measurements.",
  },
  {
    _id: "faq-7",
    question: "How many fittings are included?",
    answer:
      "The number of fittings depends on the garment and design complexity. Most custom gowns require between 2 and 4 fittings to ensure a flawless fit and finish.",
  },
  {
    _id: "faq-8",
    question: "Do you provide alterations?",
    answer:
      "Yes. We offer alterations for both garments created in our atelier and select external garments, subject to assessment and availability.",
  },
  {
    _id: "faq-9",
    question: "What fabrics do you work with?",
    answer:
      "We work with a wide range of premium fabrics including silk, satin, crepe, organza, tulle, lace, mikado, and custom embellishments. Fabric recommendations are provided based on your design goals.",
  },
  {
    _id: "faq-10",
    question: "Is a deposit required?",
    answer:
      "Yes. A non-refundable deposit is required to secure your booking, begin the design process, and source materials. The remaining balance is paid according to the agreed payment schedule.",
  },
  {
    _id: "faq-11",
    question: "Can I make changes after production begins?",
    answer:
      "Minor adjustments may be possible depending on the stage of production. Significant design changes after materials have been ordered or construction has begun may incur additional costs.",
  },
  {
    _id: "faq-12",
    question: "Do you ship internationally?",
    answer:
      "Yes. Finished garments can be shipped internationally. Shipping costs, customs duties, and delivery timelines vary depending on the destination country.",
  },
];

export default async function ContactUs() {
  const categories = await client.fetch(CATEGORIES_QUERY, {}, clientOptions);

  return (
    <div className="flex-1 overflow-x-clip">
      <ContactForm categories={categories} />

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

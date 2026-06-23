import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";
import { Container } from "@/components/shared/container";
import { QUERY_FAQ_RESULT } from "@/sanity.types";
import React from "react";

export const FAQsComp: React.FC<{ faqs: QUERY_FAQ_RESULT }> = (props) => {
  return (
    <div className="bg-foreground text-background py-24 lg:py-32">
      <Container size="sm">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3 md:sticky md:top-28">
            <h2 className="font-serif text-4xl capitalize">
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
              {props.faqs.map((item, idx) => (
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
  );
};

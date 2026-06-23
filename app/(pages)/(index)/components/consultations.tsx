import { buttonVariants } from "@/components/shadcn/button";
import { Container } from "@/components/shared/container";
import { formatDuration, formatPrice } from "@/lib/format";
import { QUERY_CONSULTATIONS_RESULT } from "@/sanity.types";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const ConsultationsComp: React.FC<{
  consultations: QUERY_CONSULTATIONS_RESULT;
}> = (props) => {
  return (
    <section className="from-secondary via-secondary/50 overflow-x-clip bg-linear-to-b to-transparent py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          {props.consultations.slice(0, 2).map((consultation) => (
            <Link
              key={consultation.slug}
              href={`/consultations/${consultation.slug}`}
              className="group hover-lift relative aspect-square overflow-hidden md:aspect-auto md:h-[550px]"
            >
              <Image
                fill
                priority
                quality={100}
                alt={consultation.title!}
                src={consultation.image || "/placeholder.svg"}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="from-foreground/80 via-foreground/50 absolute inset-0 bg-linear-to-t to-transparent" />
              <div className="text-primary-foreground absolute right-0 bottom-0 left-0 p-5 md:p-8">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
                  <span>{formatDuration(consultation.duration)}</span>
                  <span>•</span>
                  <span>{formatPrice(consultation.price)}</span>
                  {"dresses" in consultation && consultation.dresses && (
                    <>
                      <span>•</span>
                      <span>For {consultation.dresses} Dresses</span>
                    </>
                  )}
                </p>
                <h3 className="mb-3 font-serif text-2xl md:text-3xl">
                  {consultation.title}
                </h3>
                <p className="text-primary-foreground mb-4 line-clamp-2 text-sm sm:text-base">
                  {consultation.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3">
                  Check It Out <ChevronRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/consultations"
            className={buttonVariants({
              size: "xl",
            })}
          >
            <span>Explore Consultations</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
};

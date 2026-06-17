import { ConsultationDataType } from "@/constants/consultation";
import { formatDuration, formatPrice } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { ChevronRightIcon, CheckCheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const ConsultationCard: React.FC<{
  data: ConsultationDataType[number];
}> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-start gap-4 md:gap-6 lg:flex-row lg:gap-8 lg:even:flex-row-reverse xl:gap-10">
      <div className="bg-secondary relative aspect-[1.3] w-full flex-1 shadow-xs">
        <Image
          src={data.image ? `/assets/hero/${data.image}` : "/placeholder.svg"}
          alt={data.title || "Service title"}
          fill
          priority
          quality={100}
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 md:gap-6">
        <p className="text-primary flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
          <span>{formatDuration(data.duration)}</span>
          <span>•</span>
          <span>{formatPrice(data.price)}</span>
          {"dresses" in data && data.dresses && (
            <>
              <span>•</span>
              <span>For {data.dresses} Dresses</span>
            </>
          )}
        </p>

        <div className="flex flex-col gap-2 md:gap-3">
          <h3 className="font-serif text-2xl leading-tight font-medium md:text-3xl">
            {data.title}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed opacity-70 md:text-base">
            {data.description}
          </p>
        </div>

        {data?.includes && data.includes.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-primary text-sm font-medium tracking-wider uppercase">
              What&apos;s Included:
            </p>

            <ul className="flex flex-col gap-2">
              {data.includes.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm opacity-80 sm:text-base"
                >
                  <CheckCheckIcon className="mt-1 size-4" />

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href={`/book-consultation/${data.slug}`}
          className={buttonVariants({
            variant: "primary",
            size: "lg",
            className: "mt-4 w-max",
          })}
        >
          <span>Book Consultation</span>
          <ChevronRightIcon
            size={16}
            className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
          />
        </Link>
      </div>
    </div>
  );
};

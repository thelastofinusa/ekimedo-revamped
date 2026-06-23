import Link from "next/link";

import { StarIcon } from "lucide-react";
import { Container } from "@/components/shared/container";
import { formatDate, formatInitials } from "@/lib/format";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { QUERY_REVIEWS_RESULT } from "@/sanity.types";

export const ReviewsComp: React.FC<{ reviews: QUERY_REVIEWS_RESULT }> = (
  props,
) => {
  return (
    <div className="bg-foreground text-background py-24 lg:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="text-primary-foreground/60 mb-3 text-[11px] tracking-[0.3em] uppercase">
            Client Reviews
          </p>
          <h2 className="font-serif text-4xl capitalize md:text-5xl">
            What our clients say
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {props.reviews.slice(0, 3).map((review) => {
            return (
              <Link
                href="/reviews"
                key={review._id}
                className="bg-primary-foreground/5 border-primary-foreground/10 flex h-max flex-col gap-6 border p-6 shadow-xs md:last-of-type:col-span-2 lg:last-of-type:col-span-1"
              >
                <blockquote>
                  <p className="text-charcoal/90 text-base leading-[1.7] font-light italic">
                    &quot;{review.review}&quot;
                  </p>
                </blockquote>

                {/* Author Profile */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage
                      src=""
                      alt={review.name as string}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {formatInitials(review.name!)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 gap-4">
                    <div className="flex flex-col">
                      <p className="flex items-center gap-2 text-sm font-medium md:text-base">
                        <span>{review.name}</span>{" "}
                        <span className="flex gap-px">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              fill={
                                i < review.rating! ? "currentColor" : "none"
                              }
                              className="text-primary size-4"
                            />
                          ))}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs font-medium">
                        {review.service}{" "}
                        {review.date && `- ${formatDate(review.date)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

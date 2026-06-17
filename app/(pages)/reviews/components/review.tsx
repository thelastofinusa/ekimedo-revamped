"use client";

import React from "react";
import Image from "next/image";
import { StarIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Lightbox } from "@/components/shared/lightbox";
import { formatDate, formatInitials } from "@/lib/format";
import { Container } from "@/components/shared/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { REVIEW_QUERY_RESULT } from "@/sanity.types";

export const ReviewsComp: React.FC<{
  reviews: REVIEW_QUERY_RESULT;
}> = ({ reviews }) => {
  const [lightbox, setLightbox] = React.useState<{
    images: string[];
    title: string;
    initialIndex: number;
  } | null>(null);

  return (
    <div className="py-24 lg:py-32">
      <Container className="columns-1 gap-6 md:columns-2 md:gap-8">
        <AnimatePresence mode="popLayout">
          {reviews.map((review, index) => {
            return (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="bg-card mb-6 flex break-inside-avoid-column flex-col gap-6 border p-6 shadow-xs md:mb-8 md:p-8"
              >
                {/* Testimonial Quote */}
                <blockquote>
                  <p className="text-charcoal/90 text-base leading-[1.7] font-light italic md:text-lg">
                    &quot;{review.review}&quot;
                  </p>
                </blockquote>

                {/* Author Profile */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src={"" as string}
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
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {review.service}{" "}
                        {review.date && `- ${formatDate(review.date)}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Work Assets Grid */}
                {review.workAssets && review.workAssets?.length > 0 && (
                  <div className="border-border/50 grid grid-cols-4 gap-2 border-t pt-6">
                    {review.workAssets?.slice(0, 4).map((asset, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="group relative aspect-[0.8] w-full cursor-pointer overflow-hidden border shadow-xs"
                        onClick={() =>
                          setLightbox({
                            images: review.workAssets as string[],
                            title: review.name as string,
                            initialIndex: imageIndex,
                          })
                        }
                      >
                        <Image
                          src={asset || "/placeholder.svg"}
                          alt=""
                          fill
                          className="origin-center object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Container>

      <Lightbox
        open={!!lightbox}
        images={lightbox?.images ?? []}
        title={lightbox?.title}
        initialIndex={lightbox?.initialIndex ?? 0}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
};

"use client";

import React from "react";
import Image from "next/image";
import { GALLERY_QUERY_RESULT } from "@/sanity.types";
import { Lightbox } from "@/components/shared/lightbox";
import { Container } from "@/components/shared/container";

export const ShotsComp: React.FC<{
  shots: GALLERY_QUERY_RESULT;
}> = ({ shots }) => {
  const [lightbox, setLightbox] = React.useState<{
    images: string[];
    initialIndex: number;
  } | null>(null);

  return (
    <section className="py-16 md:py-24 lg:px-8">
      <Container size="lg">
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5 lg:columns-4">
          {shots.map((item, index) => (
            <div
              key={item._id}
              onClick={() =>
                setLightbox({
                  images: shots.map((s) => s.image!).filter(Boolean),
                  initialIndex: index,
                })
              }
              className="group bg-background/5 border-border/20 relative mb-3 w-full cursor-pointer break-inside-avoid-column overflow-hidden border shadow-xs sm:mb-4 md:mb-5"
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.category?.name || ""}
                width={item.width || 880}
                height={item.height || 200}
                loading="lazy"
                priority={false}
                className="h-auto object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-80"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-b from-transparent via-black/20 to-black/70 p-4 duration-500 sm:p-6 md:px-8">
                <span className="text-background mb-1 text-xs font-medium tracking-widest uppercase md:mb-2 md:text-sm">
                  {item.category?.name?.replace("-", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Lightbox
        open={!!lightbox}
        images={lightbox?.images ?? []}
        initialIndex={lightbox?.initialIndex ?? 0}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
};

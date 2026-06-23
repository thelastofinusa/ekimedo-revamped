"use client";
import React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Lightbox } from "@/components/shared/lightbox";
import { QUERY_CATEGORIES_RESULT, QUERY_GALLERY_RESULT } from "@/sanity.types";
import { Skeleton } from "@/components/shadcn/skeleton";

export const Galleries: React.FC<{
  galleries: QUERY_GALLERY_RESULT;
  categories: QUERY_CATEGORIES_RESULT;
}> = (props) => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("cat") ?? "";

  const paramCategory =
    props.categories.find((c) => c.slug === categoryParam)?.slug ?? "";

  const filteredGalleries = React.useMemo(() => {
    if (!paramCategory || paramCategory === "all") {
      return props.galleries;
    }

    return props.galleries.filter(
      (gallery) => gallery.category?.slug === paramCategory,
    );
  }, [props.galleries, paramCategory]);

  const [lightbox, setLightbox] = React.useState<{
    images: string[];
    initialIndex: number;
  } | null>(null);

  return (
    <section className="py-16 md:py-24 lg:px-8">
      <Container size="lg">
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5 lg:columns-4">
          {filteredGalleries.map((item, index) => (
            <div
              key={item._id}
              onClick={() =>
                setLightbox({
                  images: filteredGalleries
                    .map((s) => s.image!)
                    .filter(Boolean),
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

export function GallerySkeleton() {
  const skeletons = [
    280, 420, 340, 520, 360, 300, 460, 380, 540, 320, 410, 290, 300,
  ];

  return (
    <section className="py-16 md:py-24 lg:px-8">
      <Container size="lg">
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5 lg:columns-4">
          {skeletons.map((height, index) => (
            <Skeleton
              key={index}
              className="shadow-xs mb-3 w-full break-inside-avoid-column sm:mb-4 md:mb-5"
              style={{
                width: "100%",
                height: height,
              }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

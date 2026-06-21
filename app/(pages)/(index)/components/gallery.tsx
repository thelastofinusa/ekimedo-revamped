import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { client, clientOptions } from "@/sanity/lib/client";
import { FEATURED_GALLERY_QUERY } from "@/sanity/queries/gallery";

export const GalleryComp = async () => {
  const gallery = await client.fetch(
    FEATURED_GALLERY_QUERY,
    {
      category: null,
      start: 0,
      end: 5,
    },
    clientOptions,
  );

  return (
    <div className="bg-background">
      <div className="from-secondary via-secondary/50 overflow-x-clip bg-linear-to-b to-transparent py-24 lg:py-32">
        <Container size="sm">
          <div className="mb-10 flex items-end justify-between md:mb-20">
            <h2 className="font-serif text-4xl leading-tight capitalize md:text-5xl">
              discover our <br className="hidden md:block" /> signature style
            </h2>

            <Link
              href="/our-gallery"
              className={buttonVariants({
                className: "hidden! md:inline-flex!",
              })}
            >
              View Full Gallery
            </Link>
          </div>
        </Container>

        <Container>
          <div className="flex gap-4">
            {gallery.map((item, idx) => (
              <div
                key={item._id}
                className={cn(
                  "group bg-background/5 border-border/20 relative shrink-0 overflow-hidden border shadow-xs",
                  {
                    "aspect-3/4 w-[50vw] md:w-[25vw]": idx % 2 === 0,
                    "mt-12 aspect-3/4 w-[40vw] md:mt-20 md:w-[20vw]":
                      idx % 2 !== 0,
                  },
                )}
              >
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt=""
                  fill
                  loading="lazy"
                  className="origin-top object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-80"
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
};

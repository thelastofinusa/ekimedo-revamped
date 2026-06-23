import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_CATEGORIES } from "@/sanity/queries/category.query";
import { QUERY_GALLERY } from "@/sanity/queries/gallery.query";
import { Galleries, GallerySkeleton } from "./components/galleries";
import { HeroComp } from "@/components/shared/hero";
import { FilterGallery } from "./components/filter";
import { Suspense } from "react";

export default async function Gallery() {
  const categories = await client.fetch(QUERY_CATEGORIES, {}, clientOptions);
  const galleries = await client.fetch(QUERY_GALLERY, {}, clientOptions);

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp
        title="Our Gallery"
        comp={
          <Suspense fallback="...">
            <FilterGallery categories={categories} />
          </Suspense>
        }
      />
      <Suspense fallback={<GallerySkeleton />}>
        <Galleries galleries={galleries} categories={categories} />
      </Suspense>
    </div>
  );
}

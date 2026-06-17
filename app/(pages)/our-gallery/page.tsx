import * as React from "react";
import { SplashScreen } from "@/components/shared/splash-screen";
import { client, clientOptions } from "@/sanity/lib/client";
import { CATEGORIES_QUERY } from "@/sanity/queries/category.query";
import { GALLERY_QUERY } from "@/sanity/queries/gallery.query";
import { GallerySection } from "./components/gallery.sec";

export default async function OurGallery() {
  const category = await client.fetch(CATEGORIES_QUERY, {}, clientOptions);
  const galleries = await client.fetch(GALLERY_QUERY, {}, clientOptions);

  return (
    <div className="flex-1 overflow-x-clip">
      <React.Suspense fallback={<SplashScreen />}>
        <GallerySection category={category} galleries={galleries} />
      </React.Suspense>
    </div>
  );
}

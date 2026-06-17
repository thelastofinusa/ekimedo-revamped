import { HeroSlides } from "./slides";
import { HERO_QUERY } from "@/sanity/queries/hero.query";
import { client, clientOptions } from "@/sanity/lib/client";

export const HeroComp = async () => {
  const images = await client.fetch(HERO_QUERY, {}, clientOptions);

  // Fallback if no images are found
  const heroImages =
    images && images.length > 0
      ? images.map((img) => img.image).filter(Boolean)
      : ["/og.png", "/twitter-image.png"];

  return <HeroSlides images={heroImages as string[]} />;
};

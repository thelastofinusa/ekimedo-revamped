import { QUERY_HERO_IMAGES } from "@/sanity/queries/hero.query";
import { HeroSlides } from "./components/slides";
import { DiscoverComp } from "./components/discover";
import { CTA } from "@/components/shared/cta";
import { ReviewsComp } from "./components/reviews";
import { client, clientOptions } from "@/sanity/lib/client";
import { QUERY_REVIEWS } from "@/sanity/queries/review.query";
import { QUERY_FEATURED_GALLERY } from "@/sanity/queries/gallery.query";
import { GalleryComp } from "./components/gallery";
import { ConsultationsComp } from "./components/consultations";
import { QUERY_CONSULTATIONS } from "@/sanity/queries/consultation.query";

export default async function Home() {
  const images = await client.fetch(QUERY_HERO_IMAGES, {}, clientOptions);
  const reviews = await client.fetch(QUERY_REVIEWS, {}, clientOptions);
  const galleries = await client.fetch(
    QUERY_FEATURED_GALLERY,
    {
      category: null,
      start: 0,
      end: 5,
    },
    clientOptions,
  );
  const consultations = await client.fetch(
    QUERY_CONSULTATIONS,
    { onPMPage: null },
    clientOptions,
  );

  const heroImages = images.map((img) => img.image);

  return (
    <div className="flex-1 overflow-x-clip">
      <HeroSlides images={heroImages as string[]} />
      <DiscoverComp />
      <ConsultationsComp consultations={consultations} />
      <GalleryComp galleries={galleries} />
      <ReviewsComp reviews={reviews} />
      <CTA
        mode="light"
        title="Ready to Transform Your Style?"
        description="Book a consultation with our expert stylists and discover a wardrobe that truly reflects who you are."
        route={{
          txt: "Book a Consultation",
          path: "/consultations",
        }}
      />
    </div>
  );
}

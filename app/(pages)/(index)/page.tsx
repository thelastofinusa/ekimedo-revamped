import { HeroComp } from "./components/hero";
import { DiscoverComp } from "./components/discover";

import { GalleryComp } from "./components/gallery";
import { ReviewsComp } from "./components/reviews";
import { CTA } from "@/components/shared/cta";
import { ConsultationsComp } from "./components/services";

export default function Home() {
  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp />
      <DiscoverComp />
      <ConsultationsComp />
      <GalleryComp />
      <ReviewsComp />
      <CTA
        mode="light"
        title="Ready to Transform Your Style?"
        description="Book a consultation with our expert stylists and discover a wardrobe that truly reflects who you are."
        route={{
          txt: "Book a Consultation",
          path: "/book-consultation",
        }}
      />
    </div>
  );
}

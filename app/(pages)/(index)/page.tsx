"use client";

import { HeroComp } from "./components/hero";
import { DiscoverComp } from "./components/discover";
import { ServicesComp } from "./components/services";

export default function Home() {
  return (
    <div className="flex-1 overflow-x-clip">
      <HeroComp />
      <DiscoverComp />
      <ServicesComp />
    </div>
  );
}

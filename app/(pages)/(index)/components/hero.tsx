import React from "react";
import { HeroSlides } from "./slides";

const sliderData = [
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2670&auto=format&fit=crop",
];

export const HeroComp = () => {
  return <HeroSlides images={sliderData} />;
};

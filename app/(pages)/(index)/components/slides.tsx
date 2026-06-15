"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";

import { siteConfig } from "@/config/site.config";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

export const HeroSlides: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  //   const prevSlide = () => {
  //     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  //   };

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Auto-play interval
  React.useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [images.length, nextSlide]);

  return (
    <section className="bg-charcoal relative flex min-h-dvh items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="flex h-full w-full"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {images.map((src, i) => (
            <div key={i} className="relative h-full w-full shrink-0">
              <Image
                src={src}
                alt="Hero background"
                fill
                priority={i === 0}
                quality={100}
                className="object-cover"
              />
            </div>
          ))}
        </motion.div>

        <div className="bg-foreground/70 absolute inset-0 backdrop-blur-xs" />
      </div>

      <Container className="text-background relative z-10">
        <div className="flex flex-col items-center gap-4 text-center md:gap-6">
          {/* Tagline */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-[11px] tracking-[0.3em] uppercase"
          >
            Luxury Fashion & Styling
          </motion.span>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl font-serif text-5xl leading-none sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {siteConfig.tagline}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-2 max-w-md font-mono text-[11px] leading-relaxed tracking-wider uppercase sm:text-xs md:mt-0"
          >
            Bridal · Reception · Prom · Special Events
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-6 flex w-full flex-col items-center gap-4 sm:gap-6"
          >
            <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row">
              <Link
                href="/pre-made-dresses"
                className={buttonVariants({
                  variant: "secondary",
                  size: "xl",
                  className: "w-full md:w-max md:flex-1",
                })}
              >
                Shop Pre-made Designs
              </Link>
              <Link
                href="/book-consultation"
                className={buttonVariants({
                  variant: "primary",
                  size: "xl",
                  className: "hover:text-card w-full md:w-max md:flex-1",
                })}
              >
                Start your custom dress
              </Link>
            </div>
            <Link
              href="/make-an-inquiry"
              className={buttonVariants({
                variant: "outline",
                size: "xl",
                className: "hover:text-card w-full md:w-max",
              })}
            >
              Fill Out Inquiry form
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ChevronRightIcon className="size-4" />
              </span>
            </Link>
          </motion.div>
        </div>
      </Container>

      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 gap-1 md:flex">
        {Array.from({ length: Math.min(images.length, 5) }).map((_, i) => {
          const active = i === currentIndex % 5;

          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 transition-all ${
                active ? "bg-background w-7" : "bg-background/40 w-4"
              }`}
            />
          );
        })}
      </div>
      {/* 
           <div className="absolute bottom-8 left-1/2 w-40 -translate-x-1/2">
        <div className="h-px bg-white/20">
          <motion.div
            className="h-px bg-white"
            animate={{
              width: `${((currentIndex + 1) / images.length) * 100}%`,
            }}
          />
        </div>
      </div> */}
    </section>
  );
};

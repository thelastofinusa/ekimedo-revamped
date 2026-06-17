"use client";

import Image from "next/image";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LightboxProps {
  images: string[];
  title?: string;
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({
  images,
  title,
  initialIndex = 0,
  open,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const previous = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="bg-foreground/95 fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm md:p-12"
        >
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={onClose}
            className="absolute top-6 right-5 z-50 md:top-8 md:right-8"
          >
            <XIcon className="size-4.5" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                onClick={previous}
                className="absolute left-4 z-50 md:left-8"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={next}
                className="absolute right-4 z-50 md:right-8"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </>
          )}

          <motion.div
            key={currentIndex}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[80vh] w-full max-w-6xl items-center justify-center"
          >
            <div className="relative h-full w-full">
              <Image
                fill
                priority
                quality={100}
                src={images[currentIndex]}
                alt={title ?? ""}
                className="object-contain"
              />
            </div>

            <div className="absolute right-0 -bottom-20 left-0 text-center">
              {title && (
                <h2 className="text-background font-serif text-xl md:text-3xl">
                  {title}
                </h2>
              )}

              <p className="text-background/70 mt-2 text-sm">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

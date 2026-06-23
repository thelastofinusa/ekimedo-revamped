"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

import { Container } from "./container";

export const HeroComp: React.FC<{
  title: string | React.ReactElement;
  description?: string | React.ReactElement;
  imagePath?: string;
  comp?: React.ReactElement;
  isDynamic?: boolean;
}> = ({ title, description, imagePath, comp, isDynamic = false }) => {
  const imageSrc = isDynamic
    ? imagePath
    : imagePath?.startsWith("/")
      ? imagePath
      : imagePath
        ? `/hero/${imagePath}`
        : undefined;

  return (
    <div className="bg-foreground relative overflow-hidden py-24">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={typeof title === "string" ? title : "Hero background image"}
          fill
          priority
          quality={100}
          className="pointer-events-none absolute inset-0 bg-cover object-cover opacity-20"
        />
      )}
      <Container className="pt-8 md:pt-16" size="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-background mb-4 max-w-2xl font-serif text-4xl sm:text-5xl md:mb-6 md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="text-background/60 max-w-[600px]">{description}</p>
          )}

          {comp && <div className="mt-6">{comp}</div>}
        </motion.div>
      </Container>
    </div>
  );
};

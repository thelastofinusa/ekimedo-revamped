"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_QUERY_RESULT } from "@/sanity.types";

export const ProductCard: React.FC<{
  product: PRODUCT_QUERY_RESULT[number];
}> = ({ product }) => {
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  // Get the first image snapshot URL
  const firstImageUrl =
    product.snapshots
      ?.filter((s) => s !== null && s._type === "image")
      .map((s) => s.url)[0] ?? "";

  return (
    <Link
      href={`/pre-made-dresses/${product.slug}`}
      className="group hover:border-foreground/40 bg-background flex flex-col gap-3 border p-3 shadow-xs transition-colors"
    >
      {/* Image Container Frame */}
      <div className="bg-secondary relative aspect-3/4 w-full overflow-hidden rounded-none border">
        {isOutOfStock && (
          <Badge
            variant="destructive"
            className="absolute top-3 left-3 z-10 rounded-none text-[10px] tracking-wider uppercase"
          >
            Out of Stock
          </Badge>
        )}

        {firstImageUrl ? (
          <Image
            src={firstImageUrl}
            alt={product.name ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center font-mono text-xs">
            [ No Image Available ]
          </div>
        )}

        {/* Minimal Hover Quick-View Strip */}
        <div className="bg-primary/80 absolute inset-x-0 bottom-0 py-2.5 text-center backdrop-blur-xs transition-transform duration-300 group-hover:translate-y-0 md:translate-y-full">
          <span className="text-background font-sans text-xs font-medium tracking-widest uppercase">
            View Details
          </span>
        </div>
      </div>

      {/* Info Stack */}
      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-sans text-sm leading-tight font-medium decoration-1 underline-offset-4 group-hover:underline">
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Subtle Swatches Indicator */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-1 flex gap-1">
            {product.colors.slice(0, 4).map((color, idx) => (
              <span
                key={idx}
                className="border-foreground/10 group-hover:ring-foreground/20 size-3 rounded-none border ring-1 ring-transparent ring-offset-1 transition-all"
                style={{ backgroundColor: color.value as string }}
                title={color.name ?? ""}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-muted-foreground ml-0.5 self-center font-mono text-[9px]">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

import Link from "next/link";
import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { StockBadge } from "./stock-badge";
import { PRODUCT_QUERY_RESULT } from "@/sanity.types";

export const ProductCard: React.FC<{
  product: PRODUCT_QUERY_RESULT[number];
}> = ({ product }) => {
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  return (
    <Link
      href={`/pre-made-dresses/${product.slug}`}
      className="group block cursor-pointer"
    >
      <div className="relative mb-4 aspect-3/4 overflow-hidden border shadow-sm">
        <Image
          src={product?.images?.[0] ?? ""}
          alt={product.name ?? ""}
          fill
          priority
          quality={100}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle Hover Reveal */}
        <div className="bg-foreground/5 absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {isOutOfStock ? (
          <Badge
            variant="destructive"
            className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-medium shadow-lg"
          >
            Out of Stock
          </Badge>
        ) : (
          <StockBadge
            productId={product._id.toString()}
            stock={stock}
            className="absolute top-3 right-3"
          />
        )}

        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 z-30 flex w-full translate-y-4 items-end justify-center p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <Button variant="primary">View Product</Button>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {product?.category?.name}
          </p>
          <span className="text-muted-foreground font-mono text-sm font-medium">
            {formatPrice(product.price)}
          </span>
        </div>
        <h3 className="group-hover:text-primary transition-color mb-1 font-serif text-base font-medium sm:text-lg">
          {product.name}
        </h3>
      </div>
    </Link>
  );
};

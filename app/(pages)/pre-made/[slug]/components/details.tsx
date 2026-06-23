/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon, MinusIcon, PlayIcon, PlusIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { QUERY_PRODUCT_BY_SLUG_RESULT } from "@/sanity.types";
import {
  useCartActions,
  useProductTotalQuantity,
} from "@/components/providers/cart.provider";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/shadcn/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/shadcn/button";
import { SizeChart } from "@/components/shared/sizeChart";
import { toast } from "sonner";
import { StockBadge } from "@/components/shared/stockBadge";

type Snapshot = {
  _type: "image" | "file";
  url: string;
};

export const ProductDetails: React.FC<{
  product: QUERY_PRODUCT_BY_SLUG_RESULT;
}> = ({ product }) => {
  const { addItem } = useCartActions();
  const quantityInCart = useProductTotalQuantity(product?._id as string);

  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [selectedColor, setSelectedColor] = React.useState<string>("");

  const stock = product?.stock ?? 0;
  const isOutOfStock = stock <= 0;

  const maxAvailable = stock - quantityInCart;
  const [quantity, setQuantity] = React.useState<number>(isOutOfStock ? 0 : 1);

  React.useEffect(() => {
    if (maxAvailable <= 0) {
      setQuantity(0);
    } else if (quantity > maxAvailable) {
      setQuantity(maxAvailable);
    } else if (quantity === 0 && maxAvailable > 0) {
      setQuantity(1);
    }
  }, [maxAvailable, quantity]);

  const handleIncrement = () => {
    if (quantity < maxAvailable) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const snapshots = (product?.snapshots ?? []).filter(
    (s): s is Snapshot => s !== null && s.url !== null,
  );

  const [selectedSnapshot, setSelectedSnapshot] =
    React.useState<Snapshot | null>(null);

  React.useEffect(() => {
    if (snapshots.length > 0 && !selectedSnapshot) {
      setSelectedSnapshot(snapshots[0]);
    }
  }, [snapshots, selectedSnapshot]);

  const displaySnapshot = selectedSnapshot || snapshots[0] || null;

  function handleAddToCart() {
    if (quantityInCart + quantity <= stock && quantity > 0) {
      const cartImage = snapshots.find((s) => s._type === "image")?.url ?? "";

      addItem(
        {
          productId: product?._id as string,
          name: product?.name as string,
          price: product?.price as number,
          image: cartImage,
          selectedSize,
          selectedColor,
        },
        quantity,
      );
      toast.success(`${product?.name} added to cart`, {
        description: `Quantity: ${quantity}${selectedSize ? `, Size: ${selectedSize}` : ""} ${selectedColor ? `, Color: ${selectedColor}` : ""}`,
      });
    }
  }

  return (
    <div className="py-28 md:py-36">
      <Container size="sm" className="flex flex-col gap-8">
        <nav className="text-muted-foreground hidden items-center text-sm md:flex">
          <Link
            href="/pre-made"
            className="hover:text-foreground transition-colors"
          >
            Pre-Made Dresses
          </Link>
          <ChevronRightIcon className="mx-1 size-4" />
          <span className="text-foreground truncate font-medium">
            {product?.name}
          </span>
        </nav>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Gallery with vertical thumbnails */}
          <div className="flex h-max flex-1 flex-col gap-4 md:w-1/2 lg:w-max lg:flex-row-reverse">
            {/* Main media display */}
            <div className="bg-secondary relative flex-1 overflow-hidden rounded-none border shadow-xs">
              {displaySnapshot ? (
                displaySnapshot._type === "image" ? (
                  <Image
                    src={displaySnapshot.url}
                    alt={product?.name ?? "Product image"}
                    width={600}
                    height={800}
                    quality={100}
                    priority={false}
                    className="h-auto w-full object-contain transition-transform duration-700 hover:scale-[1.02]"
                  />
                ) : (
                  <video
                    src={displaySnapshot.url}
                    controls
                    className="h-full w-full object-contain"
                  />
                )
              ) : (
                <Image
                  src="/placeholder-image.jpg"
                  alt="Placeholder"
                  width={600}
                  height={800}
                  className="h-auto w-full object-contain"
                />
              )}
            </div>

            {snapshots.length > 1 && (
              <div className="grid shrink-0 grid-cols-3 gap-3 lg:flex lg:w-20 lg:flex-col">
                {snapshots.map((snap, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSnapshot(snap)}
                    className={cn(
                      "bg-secondary group relative aspect-3/4 cursor-pointer overflow-hidden rounded-none border transition",
                      selectedSnapshot?.url === snap.url
                        ? "ring-primary ring-2"
                        : "hover:ring-primary-foreground hover:ring-1",
                    )}
                  >
                    {snap._type === "image" ? (
                      <Image
                        src={snap.url}
                        alt={`${product?.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-background relative size-full">
                        {/* Video Element acting as the thumbnail preview frame */}
                        <video
                          src={snap.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        />
                        {/* Architectural Play Button overlay matching your rounded-none aesthetics */}
                        <div className="bg-foreground/5 group-hover:bg-foreground/10 absolute inset-0 flex items-center justify-center transition-colors">
                          <span className="border-border bg-background/90 text-foreground flex size-7 items-center justify-center border shadow-xs backdrop-blur-xs transition-transform group-hover:scale-105">
                            <PlayIcon className="ml-0.5 size-3 fill-current" />
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="top-28 h-max w-full space-y-8 md:sticky md:w-1/2 lg:max-w-lg">
            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-2xl font-medium">
                {product?.name}
              </h2>
              <p className="flex items-center gap-3 text-base font-medium md:text-lg">
                <span>{formatPrice(product?.price)}</span>
                {isOutOfStock ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : (
                  <StockBadge
                    productId={product?._id as string}
                    stock={stock}
                    showRemainingStocks
                  />
                )}
              </p>

              <pre className="mt-1 font-sans text-base leading-relaxed whitespace-pre-wrap">
                {product?.description}
              </pre>
            </div>

            <div className="flex flex-col gap-6">
              {/* Colors */}
              {product?.colors && product?.colors?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs tracking-wider uppercase">
                    {selectedColor
                      ? `Color: ${selectedColor}`
                      : "Select a color"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product?.colors.map((color) => {
                      if (!color || !color.name || !color.value) return null;
                      return (
                        <Tooltip key={color.name}>
                          <TooltipTrigger asChild>
                            <button
                              key={color.name}
                              onClick={() => setSelectedColor(color.name || "")}
                              className={cn(
                                "ring-ring size-7 cursor-pointer rounded-none ring transition-all focus:outline-none",
                                {
                                  "ring-ring ring-2 ring-offset-2":
                                    selectedColor === color.name,
                                },
                              )}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                              type="button"
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            align="start"
                            side="bottom"
                            className="rounded-none"
                          >
                            <p>{color.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product?.sizes && product?.sizes?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-xs tracking-wider uppercase">
                      {selectedSize ? `Size: ${selectedSize}` : "Select a size"}
                    </span>

                    <SizeChart />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product?.sizes?.map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        variant={selectedSize === size ? "default" : "outline"}
                        className={cn(
                          "rounded-none font-mono text-xs! font-normal tracking-normal",
                          selectedSize === size ? "pointer-events-none" : "",
                        )}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs tracking-wider uppercase">
                    Quantity
                  </span>
                  <div className="border-input bg-background flex h-10 w-max items-center border">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="text-muted-foreground hover:text-foreground flex h-full items-center justify-center px-3 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <MinusIcon className="size-4" />
                    </button>
                    <span className="w-12 text-center font-mono text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= maxAvailable}
                      className="text-muted-foreground hover:text-foreground flex h-full items-center justify-center px-3 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <PlusIcon className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              <Button
                size="xl"
                className="w-full rounded-none"
                onClick={handleAddToCart}
                disabled={
                  isOutOfStock ||
                  quantity === 0 ||
                  quantityInCart + quantity > stock ||
                  ((product?.sizes?.length ?? 0) > 0 && !selectedSize) ||
                  ((product?.colors?.length ?? 0) > 0 && !selectedColor)
                }
              >
                <span>
                  {isOutOfStock
                    ? "Out of stock"
                    : quantityInCart >= stock
                      ? "Max stock in cart"
                      : "Add to Cart"}
                </span>
              </Button>
            </div>

            <div className="mt-6 mb-6">
              <p className="text-sm font-semibold">
                {product?.delivery ||
                  "Estimated delivery: 4-6 weeks. Complementary alteration is included."}
              </p>
            </div>

            <div className="mt-6 border-t pt-6">
              <p className="text-muted-foreground text-sm">
                Want to go custom? Book a consultation with our designer to
                refine this design to your desired taste.
              </p>

              <Link
                href="/consultations"
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-4 rounded-none",
                })}
              >
                Start Consultation
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

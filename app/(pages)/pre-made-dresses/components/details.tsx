"use client";
import React from "react";
import { PRODUCT_BY_SLUG_QUERY_RESULT } from "@/sanity.types";
import {
  useCartActions,
  useProductTotalQuantity,
} from "@/components/providers/cart.provider";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/shared/stock-badge";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { SizeChart } from "@/components/shared/size-chart";

export const ProductDetails: React.FC<{
  product: PRODUCT_BY_SLUG_QUERY_RESULT;
}> = ({ product }) => {
  const { addItem } = useCartActions();
  const quantityInCart = useProductTotalQuantity(product?._id as string);

  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [selectedColor, setSelectedColor] = React.useState<string>("");

  const stock = product?.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const isAtMax = quantityInCart >= stock;

  const images = (product?.images ?? []).filter(Boolean) as string[];

  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedImage(images[0]);
    }
  }, [images, selectedImage]);

  // Fallback image in case no images are available
  const displayImage = selectedImage || images[0] || "/placeholder-image.jpg";

  function handleAddToCart() {
    if (quantityInCart < stock) {
      addItem(
        {
          productId: product?._id as string,
          name: product?.name as string,
          price: product?.price as number,
          image: selectedImage ?? images[0] ?? "",
          selectedSize,
          selectedColor,
        },
        1,
      );
      toast.success(`${product?.name} added to cart`, {
        description: `${selectedSize ? `Size: ${selectedSize}` : ""} ${selectedColor ? `, Color: ${selectedColor}` : ""}`,
      });
    }
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row lg:gap-12">
      <div className="flex h-max flex-1 gap-4 md:w-1/2 lg:w-max">
        <div className="flex flex-1 flex-col gap-5">
          <div className="bg-secondary relative overflow-hidden border shadow-xs">
            <Image
              src={displayImage}
              alt={product?.name ?? "Product image"}
              width={600}
              height={800}
              quality={100}
              priority={false}
              className="h-auto w-full object-contain transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={cn(
                    "bg-secondary relative aspect-3/4 cursor-pointer overflow-hidden rounded-md border transition",
                    selectedImage === img
                      ? "ring-primary ring-2"
                      : "hover:ring-primary-foreground hover:ring-1",
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product?.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="top-28 h-max w-full space-y-8 md:sticky md:w-1/2 lg:max-w-lg">
        <nav className="mb-8 hidden items-center text-sm text-neutral-500 md:flex">
          <Link
            href="/pre-made-dresses"
            className="transition-colors hover:text-neutral-900"
          >
            Pre-Made Dresses
          </Link>
          <ChevronRightIcon className="mx-1 size-4" />
          <span className="truncate font-medium text-neutral-900">
            {product?.name}
          </span>
        </nav>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-medium md:text-3xl">
            {product?.name}
          </h2>
          <p className="flex items-center gap-3 text-base font-normal md:text-2xl">
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

          <pre className="mt-1 font-sans text-base leading-relaxed font-light whitespace-pre-wrap">
            {product?.description}
          </pre>
        </div>

        <div className="flex flex-col gap-6">
          {/* Colors */}
          {product?.colors && product?.colors?.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs tracking-wider uppercase">
                {selectedColor ? `Color: ${selectedColor}` : "Select a color"}
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
                            "ring-ring size-7 cursor-pointer rounded-full ring transition-all focus:outline-none",
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
                      <TooltipContent align="start" side="bottom">
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
                      "font-mono text-xs! font-normal tracking-normal",
                      selectedSize === size ? "pointer-events-none" : "",
                    )}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            size="xl"
            className="w-full"
            onClick={handleAddToCart}
            disabled={
              isAtMax ||
              ((product?.sizes?.length ?? 0) > 0 && !selectedSize) ||
              ((product?.colors?.length ?? 0) > 0 && !selectedColor)
            }
          >
            <span>{isOutOfStock ? "Out of stock" : "Add to Cart"}</span>
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
            Want to go custom? Book a consultation with our designer to refine
            this design to your desired taste.
          </p>

          <Link
            href="/book-consultation"
            className={buttonVariants({
              variant: "outline",
              className: "mt-4",
            })}
          >
            Start Consultation
          </Link>
        </div>
      </div>
    </div>
  );
};

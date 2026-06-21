/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { Route } from "next";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/mobile";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Slider } from "@/components/ui/slider";
import { sizeFilters } from "@/constants/consultation";
import {
  CATEGORIES_QUERY_RESULT,
  PRODUCT_COLOR_QUERY_RESULT,
  PRODUCT_QUERY_RESULT,
} from "@/sanity.types";
import { CheckIcon, Loader2 } from "lucide-react";

export const Filters: React.FC<{
  categories: CATEGORIES_QUERY_RESULT;
  colors: PRODUCT_COLOR_QUERY_RESULT;
  products: PRODUCT_QUERY_RESULT;
}> = ({ categories, colors, products }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile } = useIsMobile();
  const [isPending, startTransition] = React.useTransition();
  const [localParams, setLocalParams] = React.useState(searchParams.toString());

  React.useEffect(() => {
    setLocalParams(searchParams.toString());
  }, [searchParams]);

  const {
    categoriesValue,
    colorsValue,
    sizesValue,
    priceValue,
    hasActiveFilters,
    minPrice,
    maxPrice,
  } = React.useMemo(() => {
    const categoriesValue = searchParams.getAll("category");
    const colorsValue = searchParams.getAll("color");
    const sizesValue = searchParams.getAll("size");
    const priceValue = searchParams.get("price");

    const allPrices = products?.map((p) => p.price || 0) || [];
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 500;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 5000;

    return {
      categoriesValue,
      colorsValue,
      sizesValue,
      priceValue,
      minPrice,
      maxPrice: Math.ceil(maxPrice / 5000) * 5000,
      hasActiveFilters:
        !!priceValue ||
        categoriesValue.length > 0 ||
        colorsValue.length > 0 ||
        sizesValue.length > 0,
    };
  }, [searchParams, products]);

  const [sliderValue, setSliderValue] = React.useState<number[]>([
    minPrice,
    maxPrice,
  ]);

  React.useEffect(() => {
    if (priceValue) {
      const [min, max] = priceValue.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setSliderValue([min, max]);
      }
    } else {
      setSliderValue([minPrice, maxPrice]);
    }
  }, [priceValue, minPrice, maxPrice]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
  };

  const handleSliderCommit = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("price", `${value[0]}-${value[1]}`);
    pushParams(params);
  };

  const pushParams = React.useCallback(
    (params: URLSearchParams) => {
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}` as Route, {
          scroll: false,
        });
      });
    },
    [router, pathname],
  );

  const clearFilters = React.useCallback(() => {
    startTransition(() => {
      router.push(pathname as Route, { scroll: false });
    });
  }, [router, pathname]);

  const toggleParam = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(localParams);

      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const newParams = params.toString();
      setLocalParams(newParams);
      pushParams(params);
    },
    [localParams, pushParams],
  );

  const productCounts = React.useMemo(() => {
    const map = {
      category: new Map<string, number>(),
      color: new Map<string, number>(),
      size: new Map<string, number>(),
    };

    products.forEach((product) => {
      if (product.category?.slug) {
        map.category.set(
          product.category.slug,
          (map.category.get(product.category.slug) || 0) + 1,
        );
      }

      product.colors?.forEach((c) => {
        if (c.name) {
          map.color.set(c.name, (map.color.get(c.name) || 0) + 1);
        }
      });

      product.sizes?.forEach((s) => {
        map.size.set(s, (map.size.get(s) || 0) + 1);
      });
    });

    return map;
  }, [products]);

  const content = (
    <div className="z-20 flex h-max w-full flex-col pb-12 md:sticky md:top-26 md:w-64 lg:top-32">
      {/* Action Header Panel */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-foreground font-sans text-xs font-normal tracking-widest uppercase">
          Filter Options
        </h2>
        {isPending ? (
          <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
        ) : (
          hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground h-3.5 font-mono text-[11px] underline underline-offset-4 transition-colors"
            >
              Reset All
            </button>
          )
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Budget Range Slider */}
        <FilterSection title="Budget Range">
          <div className="mt-1 flex flex-col gap-2">
            <span className="text-foreground font-mono text-xs font-medium">
              {formatPrice(sliderValue[0])} — {formatPrice(sliderValue[1])}
            </span>
            <Slider
              value={sliderValue}
              min={minPrice}
              max={maxPrice}
              step={100}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              className="mt-2 w-full **:[[role=slider]]:rounded-none [&>span:first-child]:rounded-none"
            />
          </div>
        </FilterSection>

        {/* Categories Facet Block */}
        {categories.length > 0 && (
          <FilterSection title="Categories">
            <div className="flex flex-col gap-1.5">
              {categories.map((category) => {
                const isSelected = categoriesValue.includes(category.slug!);
                const count = productCounts.category.get(category.slug!) || 0;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    disabled={count === 0 && !isSelected}
                    className={cn(
                      "group text-foreground flex items-center justify-between py-0.5 text-left font-sans text-sm font-medium transition-colors",
                      count === 0 &&
                        !isSelected &&
                        "cursor-not-allowed line-through opacity-50",
                    )}
                    onClick={() => toggleParam("category", category.slug!)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-3.5 shrink-0 items-center justify-center rounded-none border transition-colors",
                          isSelected
                            ? "bg-foreground border-foreground text-background"
                            : "border-border group-hover:border-foreground",
                          count === 0 &&
                            !isSelected &&
                            "border-border opacity-50",
                        )}
                      >
                        {isSelected && (
                          <CheckIcon className="size-2.5 stroke-3" />
                        )}
                      </span>
                      <span className="font-mono text-[11px] tracking-wider uppercase">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground font-mono text-xs font-medium">
                      [{count}]
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Color Palette Swatches */}
        {colors.length > 0 && (
          <FilterSection title="Colors">
            <div className="mt-1 grid grid-cols-6 gap-2">
              {[...colors]
                .sort((a, b) =>
                  (a.name as string).localeCompare(b.name as string),
                )
                .map((color) => {
                  const name = color.name as string;
                  const isSelected = colorsValue.includes(name);
                  const count = productCounts.color.get(name) || 0;

                  return (
                    <button
                      key={color.hex}
                      type="button"
                      disabled={count === 0 && !isSelected}
                      onClick={() => toggleParam("color", name)}
                      className={cn(
                        "group bg-background relative flex aspect-square w-full items-center justify-center rounded-none border p-0.5 transition-all",
                        isSelected
                          ? "border-foreground ring-foreground ring-1"
                          : "border-border hover:border-muted-foreground",
                        count === 0 &&
                          !isSelected &&
                          "cursor-not-allowed opacity-25",
                      )}
                      title={`${name} (${count})`}
                    >
                      <span
                        className="border-foreground/5 size-full rounded-none border"
                        style={{ backgroundColor: color.hex as string }}
                      />
                      {isSelected && (
                        <span className="bg-background/90 text-foreground absolute inset-0 m-auto flex size-3.5 items-center justify-center rounded-none mix-blend-difference">
                          <CheckIcon className="size-2.5 stroke-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </FilterSection>
        )}

        {/* Size Selection List */}
        <FilterSection title="Sizes">
          <div className="flex flex-col gap-1.5">
            {sizeFilters.map((size) => {
              const isSelected = sizesValue.includes(size.value);
              const count = productCounts.size.get(size.value) || 0;

              return (
                <button
                  key={size.value}
                  type="button"
                  disabled={count === 0 && !isSelected}
                  className={cn(
                    "group text-foreground flex items-center justify-between py-0.5 text-left font-sans text-sm font-medium transition-colors",
                    count === 0 &&
                      !isSelected &&
                      "cursor-not-allowed line-through opacity-50",
                  )}
                  onClick={() => toggleParam("size", size.value)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-3.5 shrink-0 items-center justify-center rounded-none border transition-colors",
                        isSelected
                          ? "bg-foreground border-foreground text-background"
                          : "border-border group-hover:border-foreground",
                        count === 0 &&
                          !isSelected &&
                          "border-border opacity-50",
                      )}
                    >
                      {isSelected && (
                        <CheckIcon className="size-2.5 stroke-3" />
                      )}
                    </span>
                    <span className="font-mono text-[11px] tracking-wider uppercase">
                      {size.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs font-medium">
                    [{count}]
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="border-border sticky top-24 z-50 w-full rounded-none text-xs font-medium tracking-wider uppercase"
          >
            Filters {hasActiveFilters && "•"}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="bg-background flex w-full flex-col gap-0 rounded-none p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-border border-b p-4">
            <SheetTitle className="text-foreground text-left font-sans text-base font-medium tracking-wider uppercase">
              Filter Catalog
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return content;
};

const FilterSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-3", className)}>
    <p className="text-foreground font-sans text-[11px] font-bold tracking-widest uppercase">
      {title}
    </p>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

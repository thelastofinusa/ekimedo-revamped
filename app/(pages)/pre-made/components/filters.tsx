/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { Button } from "@/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { Slider } from "@/components/shadcn/slider";
import { SIZE_FILTERS } from "@/constants/order";
import { useIsMobile } from "@/hooks/mobile";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  QUERY_CATEGORIES_RESULT,
  QUERY_PRODUCT_COLOR_RESULT,
  QUERY_PRODUCT_RESULT,
} from "@/sanity.types";
import { CheckIcon, Loader2, XIcon } from "lucide-react";
import { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export const Filters: React.FC<{
  categories: QUERY_CATEGORIES_RESULT;
  colors: QUERY_PRODUCT_COLOR_RESULT;
  products: QUERY_PRODUCT_RESULT;
}> = ({ categories, colors, products }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile } = useIsMobile();
  const [isPending, startTransition] = React.useTransition();

  // 1. Isolate global product collection price constraints (No searchParams dependency)
  const { minPrice, maxPrice } = React.useMemo(() => {
    const allPrices = products?.map((p) => p.price || 0) || [];
    const min = allPrices.length > 0 ? Math.min(...allPrices) : 500;
    const max = allPrices.length > 0 ? Math.max(...allPrices) : 5000;
    return {
      minPrice: min,
      maxPrice: Math.ceil(max / 5000) * 5000,
    };
  }, [products]);

  // 2. Extract active filter parameter states cleanly from URL context
  const {
    categoriesValue,
    colorsValue,
    sizesValue,
    priceValue,
    availabilityValue,
    hasActiveFilters,
  } = React.useMemo(() => {
    const categoriesValue = searchParams.getAll("category");
    const colorsValue = searchParams.getAll("color");
    const sizesValue = searchParams.getAll("size");
    const priceValue = searchParams.get("price");
    const availabilityValue = searchParams.get("availability") || "";

    return {
      categoriesValue,
      colorsValue,
      sizesValue,
      priceValue,
      availabilityValue,
      hasActiveFilters:
        !!priceValue ||
        !!availabilityValue ||
        categoriesValue.length > 0 ||
        colorsValue.length > 0 ||
        sizesValue.length > 0,
    };
  }, [searchParams]);

  // 3. Local slider state synchronization
  const [sliderValue, setSliderValue] = React.useState<number[]>([
    minPrice,
    maxPrice,
  ]);

  React.useEffect(() => {
    if (priceValue) {
      const [min, max] = priceValue.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setSliderValue([min, max]);
        return;
      }
    }
    setSliderValue([minPrice, maxPrice]);
  }, [priceValue, minPrice, maxPrice]);

  // 4. Memoize sorted color metrics once
  const sortedColors = React.useMemo(() => {
    return [...colors].sort((a, b) =>
      (a.name as string).localeCompare(b.name as string),
    );
  }, [colors]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
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

  const handleSliderCommit = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("price", `${value[0]}-${value[1]}`);
    pushParams(params);
  };

  const clearFilters = React.useCallback(() => {
    startTransition(() => {
      router.push(pathname as Route, { scroll: false });
    });
  }, [router, pathname]);

  // 5. Optimized atomic multi-value query parameter manipulator
  const toggleParam = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (key === "availability") {
        if (params.get(key) === value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      } else {
        // Multi-value support for categories, colors, and sizes
        const currentValues = params.getAll(key);
        if (currentValues.includes(value)) {
          const updated = currentValues.filter((v) => v !== value);
          params.delete(key);
          updated.forEach((v) => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }

      pushParams(params);
    },
    [searchParams, pushParams],
  );

  // 6. Multi-facet indexing metrics
  const productCounts = React.useMemo(() => {
    const map = {
      category: new Map<string, number>(),
      color: new Map<string, number>(),
      size: new Map<string, number>(),
      inStock: 0,
      outOfStock: 0,
    };

    products.forEach((product) => {
      const isAvailable = (product.stock ?? 0) > 0;
      if (isAvailable) {
        map.inStock++;
      } else {
        map.outOfStock++;
      }

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
      <div className="mb-8 flex items-center justify-between gap-2 font-mono text-xs font-semibold tracking-wide uppercase">
        <h2 className="text-foreground font-sans text-xs font-medium tracking-widest uppercase">
          Filter Options
        </h2>

        {isPending ? (
          <Loader2 className="animate-spin size-3 opacity-50 pointer-events-none" />
        ) : (
          hasActiveFilters && (
            <XIcon
              onClick={clearFilters}
              className="cursor-pointer size-3 text-foreground"
            />
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

        {/* Availability Block */}
        <FilterSection title="Availability">
          <div className="flex flex-col gap-1.5">
            {[
              {
                id: "in-stock",
                label: "In Stock",
                count: productCounts.inStock,
              },
              {
                id: "out-of-stock",
                label: "Out of Stock",
                count: productCounts.outOfStock,
              },
            ].map((status) => {
              const isSelected = availabilityValue === status.id;

              return (
                <button
                  key={status.id}
                  type="button"
                  disabled={status.count === 0 && !isSelected}
                  className={cn(
                    "group text-foreground flex items-center justify-between py-0.5 text-left font-sans text-sm font-medium transition-colors",
                    status.count === 0 &&
                      !isSelected &&
                      "cursor-not-allowed line-through opacity-50",
                  )}
                  onClick={() => toggleParam("availability", status.id)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-3.5 shrink-0 items-center justify-center rounded-none border transition-colors",
                        isSelected
                          ? "bg-foreground border-foreground text-background"
                          : "border-border group-hover:border-foreground",
                        status.count === 0 &&
                          !isSelected &&
                          "border-border opacity-50",
                      )}
                    >
                      {isSelected && (
                        <CheckIcon className="size-2.5 stroke-3" />
                      )}
                    </span>
                    <span className="font-mono text-[11px] tracking-wider uppercase">
                      {status.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs font-medium">
                    [{status.count}]
                  </span>
                </button>
              );
            })}
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
        {sortedColors.length > 0 && (
          <FilterSection title="Colors">
            <div className="mt-1 grid grid-cols-6 gap-2">
              {sortedColors.map((color) => {
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
            {SIZE_FILTERS.map((size) => {
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
            className="border-border sticky top-24 z-50 w-max"
          >
            Filters {hasActiveFilters && "•"}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col gap-0 rounded-none">
          <SheetHeader>
            <SheetTitle>Filter Catalog</SheetTitle>
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

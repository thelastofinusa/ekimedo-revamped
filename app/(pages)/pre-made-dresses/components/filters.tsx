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
import { CheckCheckIcon, XIcon } from "lucide-react";

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

  // Memoized params
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
      maxPrice: Math.ceil(maxPrice / 5000) * 5000, // Round up to nearest 100
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

      setLocalParams(newParams); // instant UI
      pushParams(params); // sync URL
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
        return map.color.set(
          c.name as string,
          (map.color.get(c.name as string) || 0) + 1,
        );
      });

      product.sizes?.forEach((s) => {
        map.size.set(s, (map.size.get(s) || 0) + 1);
      });
    });

    return map;
  }, [products]);

  const content = (
    <div className="z-20 flex h-max w-full flex-col gap-8 md:sticky md:top-26 md:w-64 lg:top-32">
      <div className="flex flex-col gap-8">
        <FilterSection title="Price Range" className="relative gap-2">
          <span className="text-muted-foreground text-xs">
            Budget range <strong>{formatPrice(sliderValue[0])}</strong> -{" "}
            <strong>{formatPrice(sliderValue[1])}</strong>.
          </span>
          <Slider
            value={sliderValue}
            min={minPrice}
            max={maxPrice}
            step={100}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            className="mt-2 w-full"
          />

          {isPending ? (
            <Button size="icon-xs" isLoading className="absolute top-0 right-0">
              <span className="sr-only">Rendering</span>
            </Button>
          ) : (
            hasActiveFilters && (
              <Button
                size="icon-xs"
                onClick={clearFilters}
                className="absolute top-0 right-0"
              >
                <XIcon />
                <span className="sr-only">Clear</span>
              </Button>
            )
          )}
        </FilterSection>

        {categories.length > 0 && (
          <FilterSection title="Categories">
            {categories.map((category) => {
              const isSelected = categoriesValue.includes(category.slug!);
              const count = productCounts.category.get(category.slug!) || 0;

              return (
                <div
                  key={category.slug}
                  className={cn(
                    "hover:text-primary flex cursor-pointer items-center justify-between text-sm transition-colors",
                    isSelected
                      ? "text-primary font-medium"
                      : "text-muted-foreground",
                  )}
                  onClick={() => toggleParam("category", category.slug!)}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <CheckCheckIcon
                        className="mt-px size-4"
                        strokeWidth={2}
                      />
                    )}
                    <span>{category.name}</span>
                    <span>-</span>
                    <span>({count})</span>
                  </div>
                </div>
              );
            })}
          </FilterSection>
        )}

        {colors.length > 0 && (
          <FilterSection title="Colors">
            {[...colors]
              .sort((a, b) =>
                (a.name as string).localeCompare(b.name as string),
              )
              .map((color) => {
                const name = color.name as string;
                const isSelected = colorsValue.includes(name);
                const count = productCounts.category.get(name) || 0;

                return (
                  <div
                    key={color.hex}
                    className={cn(
                      "hover:text-primary flex cursor-pointer items-center justify-between gap-2 text-sm transition-colors",
                      isSelected
                        ? "text-primary font-medium"
                        : "text-muted-foreground",
                    )}
                    onClick={() => toggleParam("color", name)}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <CheckCheckIcon
                          className="mt-px size-4"
                          strokeWidth={2}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <span
                          className="mt-px size-3 rounded-full border"
                          style={{ backgroundColor: color.hex as string }}
                        />
                        <span className={cn(isSelected && "font-medium")}>
                          {name}
                        </span>
                      </div>
                      <span>-</span>
                      <span>({count})</span>
                    </div>
                  </div>
                );
              })}
          </FilterSection>
        )}

        <FilterSection title="Sizes">
          {sizeFilters.map((size) => {
            const isSelected = sizesValue.includes(size.value);
            const count = productCounts.category.get(size.value) || 0;

            return (
              <div
                key={size.value}
                className={cn(
                  "hover:text-primary flex cursor-pointer items-center justify-between text-sm transition-colors",
                  isSelected
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
                onClick={() => toggleParam("size", size.value)}
              >
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <CheckCheckIcon className="mt-px size-4" strokeWidth={2} />
                  )}
                  <span>{size.name}</span>
                  <span>-</span>
                  <span>({count})</span>
                </div>
              </div>
            );
          })}
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
            className="bg-background sticky top-24 z-50 w-max"
          >
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="mb-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-6 md:px-8">
            {content}
          </div>
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
  <div className={cn("flex flex-col gap-4", className)}>
    <p className="text-foreground flex items-center gap-2 text-sm font-normal">
      <span>{title}</span>
    </p>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

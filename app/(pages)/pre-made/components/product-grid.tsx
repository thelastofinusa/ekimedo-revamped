"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn/empty";
import { ProductCard } from "@/components/shared/productCard";
import { BsInbox } from "react-icons/bs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/pagination";
import { QUERY_PRODUCT_RESULT } from "@/sanity.types";
import { Skeleton } from "@/components/shadcn/skeleton";
import { EmptyState } from "@/components/shared/empty";

export const ProductGrid: React.FC<{
  products: QUERY_PRODUCT_RESULT;
}> = ({ products }) => {
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 9;

  // Filter products based on URL parameters
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Filter by categories
    const category = searchParams.get("category");
    if (category) {
      filtered = filtered.filter((product) => {
        // category is a single object with slug property
        return product.category?.slug === category;
      });
    }

    // Filter by colors (SINGLE SELECT)
    const color = searchParams.get("color");
    if (color) {
      filtered = filtered.filter((product) => {
        const productColors = product.colors;

        if (!productColors || productColors.length === 0) return false;

        return productColors.some((c) => c.name === color);
      });
    }

    // Filter by price range
    const priceRange = searchParams.get("price");
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((product) => {
        const price = product.price || 0;
        return price >= min && price <= max;
      });
    }

    return filtered;
  }, [products, searchParams]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  const isEmptyProducts = products.length === 0;
  const isEmptyFiltered = filteredProducts.length === 0;

  return (
    <div className="flex-1">
      <div className="mb-8 flex items-center">
        <h2 className="text-foreground font-sans text-xs font-normal tracking-widest uppercase">
          Showing{" "}
          <strong className="font-mono">{paginatedProducts.length}</strong> of{" "}
          <strong className="font-mono">{filteredProducts.length}</strong>{" "}
          results
        </h2>
      </div>
      {isEmptyProducts ? (
        <EmptyState
          type="empty"
          title="No Dresses Available"
          description="There are no dresses in the store yet."
        />
      ) : isEmptyFiltered ? (
        <EmptyState
          type="search"
          title="No Dresses Found"
          description="No pre-made dresses match your selected filters."
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
            {paginatedProducts.map((product, idx) => (
              <ProductCard key={`${product._id}-${idx}`} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      className="mr-2 h-8 tracking-[0.2em]!"
                      href={createPageURL(currentPage - 1)}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={createPageURL(page)}
                        isActive={currentPage === page}
                        size="icon-sm"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      className="ml-2 h-8 tracking-[0.2em]!"
                      href={createPageURL(currentPage + 1)}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export function ProductGridSkeleton() {
  const skeletons = [280, 420, 340, 520, 360, 300];

  return (
    <div className="flex-1">
      <div className="mb-8 flex items-center">
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
        {skeletons.map((height, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-3 border border-input"
          >
            <Skeleton className="aspect-3/4 w-full shadow-xs" />

            <div className="flex flex-col gap-2.5 px-0.5">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>

              <div className="mt-1 flex gap-1">
                <Skeleton className="size-3" />
                <Skeleton className="size-3" />
                <Skeleton className="size-3" />
                <Skeleton className="size-3" />
                <Skeleton className="size-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

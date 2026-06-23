"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { QUERY_CATEGORIES_RESULT } from "@/sanity.types";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export const FilterGallery: React.FC<{
  categories: QUERY_CATEGORIES_RESULT;
}> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("cat") ?? "";

  const paramCategory =
    categories.find((c) => c.slug === categoryParam)?.slug ?? "";

  const allCategories: QUERY_CATEGORIES_RESULT = React.useMemo(
    () => [
      { _id: "all", name: "All", slug: "all" },
      ...categories.filter((c) => c.name && c.slug),
    ],
    [categories],
  );

  const setActiveCategory = React.useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams);

      if (slug === "all") {
        params.delete("cat");
      } else {
        params.set("cat", slug.toLowerCase().replace(" ", "-"));
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="grid w-full max-w-sm grid-cols-1 gap-6">
      <div className="flex flex-col gap-2">
        <Select
          value={paramCategory}
          onValueChange={(e) => setActiveCategory(e)}
        >
          <SelectTrigger className="text-background w-full border-input bg-transparent">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allCategories.map((year) => (
                <SelectItem key={year._id} value={year.slug!}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

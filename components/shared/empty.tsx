import { Route } from "next";
import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../shadcn/empty";
import Link from "next/link";
import { buttonVariants } from "../shadcn/button";

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  type?: "search" | "empty";
  action?: {
    label: string;
    path: Route;
  };
}> = ({ title, description, action, type = "search" }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia>
            {type == "search" ? (
              <SearchCardsIllustration />
            ) : (
              <StackedCardsIllustration />
            )}
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
          {action && (
            <EmptyContent className="mt-6">
              <Link href={action.path} className={buttonVariants()}>
                {action.label}
              </Link>
            </EmptyContent>
          )}
        </EmptyHeader>
      </Empty>
    </div>
  );
};

function SearchCardsIllustration() {
  return (
    <div className="relative h-24 w-72" aria-hidden="true">
      {/* Bottom card */}
      <div className="bg-muted/50 dark:bg-muted/25 border-border/40 absolute right-6 bottom-6 left-6 flex h-12 items-center gap-2.5 border px-3">
        <div className="bg-muted-foreground/10 size-5 shrink-0" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="bg-muted-foreground/10 h-2 w-full" />
          <div className="bg-muted-foreground/8 h-2 w-2/3" />
        </div>
      </div>
      {/* Middle card */}
      <div className="bg-muted/70 dark:bg-muted/40 border-border/50 absolute right-3 bottom-9 left-3 flex h-12 items-center gap-2.5 border px-3">
        <div className="bg-muted-foreground/12 size-5 shrink-0" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="bg-muted-foreground/12 h-2 w-full" />
          <div className="bg-muted-foreground/10 h-2 w-3/4" />
        </div>
      </div>
      {/* Front card */}
      <div className="bg-background border-border absolute inset-x-0 bottom-12 flex h-14 items-center gap-3 border px-3.5 shadow-xs">
        <div className="bg-muted size-7 shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="bg-muted h-2.5 w-full" />
          <div className="bg-muted/70 h-2 w-3/5" />
        </div>
      </div>
      {/* Fade */}
      <div className="from-background/0 to-background pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b" />
    </div>
  );
}

function StackedCardsIllustration() {
  return (
    <div className="relative h-24 w-72" aria-hidden="true">
      {/* Back card */}
      <div className="bg-muted/60 dark:bg-muted/30 border-border/50 absolute inset-x-6 top-0 h-6 border" />
      {/* Middle card */}
      <div className="bg-muted/80 dark:bg-muted/50 border-border/60 absolute inset-x-3 top-3 h-6 border" />
      {/* Front card */}
      <div className="bg-background border-border absolute inset-x-0 top-6 flex h-16 items-center gap-3 border px-4 shadow-xs">
        <div className="bg-muted size-8 shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="bg-muted h-2.5 w-3/4" />
          <div className="bg-muted/60 h-2 w-1/2" />
        </div>
      </div>
      {/* Fade overlay */}
      <div className="from-background/0 via-background/60 to-background pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b" />
    </div>
  );
}

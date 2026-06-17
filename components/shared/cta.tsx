"use client";
import Link from "next/link";
import { Route } from "next";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Container } from "./container";
import { buttonVariants } from "@/components/ui/button";

export const CTA: React.FC<{
  mode: "dark" | "light";
  title: string;
  description?: string;
  route: {
    txt: string;
    path: Route;
  };
}> = ({ mode, title, description, route }) => {
  return (
    <div
      className={cn(
        "py-24 lg:py-32",
        mode === "dark" ? "bg-foreground text-background" : "bg-card",
      )}
    >
      <Container className="flex flex-col items-center justify-center text-center">
        <h3 className="mb-6 text-4xl md:text-5xl">{title}</h3>
        {description && (
          <pre className="text-muted-foreground mx-auto mb-10 max-w-xl font-sans text-sm whitespace-pre-wrap sm:text-base">
            {description}
          </pre>
        )}
        <Link
          href={route.path}
          className={buttonVariants({
            variant: mode === "dark" ? "outline" : "default",
            size: "lg",
            className: cn(mode === "dark" && "hover:text-background"),
          })}
        >
          {route.txt}
        </Link>
      </Container>
    </div>
  );
};

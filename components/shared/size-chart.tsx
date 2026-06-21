import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { sizeChart } from "@/constants/consultation";
import { RulerDimensionLineIcon } from "lucide-react";

export const SizeChart: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          role="button"
          className={cn(
            "text-primary flex cursor-pointer items-center gap-2",
            className,
          )}
        >
          <RulerDimensionLineIcon className="size-5" />
          <span className="text-xs font-medium tracking-wider uppercase">
            Size Chart
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-card top-0 mt-6 max-w-5xl translate-y-0 p-6 md:p-8 lg:p-12">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle />
            <DialogDescription />
          </DialogHeader>
        </VisuallyHidden>

        <div className="scroll h-full max-h-[80dvh] overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100">
          <div className="mb-4 w-full border shadow-xs">
            {/* Header (Desktop Only) */}
            <div className="size-table-header bg-foreground text-background hidden grid-cols-5 lg:grid">
              {[
                "Size",
                "Numeric Size",
                "Bust (in/cm)",
                "Waist (in/cm)",
                "Hip (in/cm)",
              ].map((label) => (
                <div key={label} className="p-4 text-sm font-semibold">
                  {label}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div>
              {sizeChart.map((row) => (
                <div
                  key={row.size}
                  className="size-row even:bg-secondary/50 grid border-b transition-colors last-of-type:border-0 lg:grid-cols-5"
                >
                  <div
                    className="size-cell p-3 text-sm font-medium lg:p-4"
                    data-label="Size"
                  >
                    {row.size}
                  </div>
                  <div
                    className="size-cell text-foreground p-3 text-sm lg:p-4"
                    data-label="Numeric Size"
                  >
                    {row.numeric}
                  </div>
                  <div
                    className="size-cell text-foreground p-3 text-sm lg:p-4"
                    data-label="Bust"
                  >
                    {row.bust}
                  </div>
                  <div
                    className="size-cell text-foreground p-3 text-sm lg:p-4"
                    data-label="Waist"
                  >
                    {row.waist}
                  </div>
                  <div
                    className="size-cell text-foreground p-3 text-sm lg:p-4"
                    data-label="Hip"
                  >
                    {row.hip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Image
            src="/measurements-guide.webp"
            alt="measurements-guide"
            width={546}
            height={0}
            className="mx-auto h-auto object-contain"
            priority
            quality={100}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 focus-visible:border-primary flex field-sizing-content min-h-36 w-full rounded-md border bg-transparent p-3 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

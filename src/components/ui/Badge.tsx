import * as React from "react";

import { cn } from "@/lib/cn";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-scouthub-tint px-2.5 py-1 text-xs font-medium text-scouthub-green ring-1 ring-scouthub-green/10",
        className,
      )}
      {...props}
    />
  );
}

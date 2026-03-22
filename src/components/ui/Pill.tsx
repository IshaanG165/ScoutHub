import * as React from "react";

import { cn } from "@/lib/cn";

export function Pill({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-scouthub-green/30",
        active
          ? "bg-white/80 text-scouthub-text shadow-soft ring-1 ring-black/5"
          : "text-scouthub-muted hover:bg-white/70 hover:text-scouthub-text",
        className,
      )}
      {...props}
    />
  );
}

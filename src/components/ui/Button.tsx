import * as React from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-scouthub-green/30",
        "active:translate-y-[1px]",
        size === "md" ? "h-10 px-4 text-sm" : "h-9 px-3 text-sm",
        variant === "primary" &&
          "bg-scouthub-green text-white shadow-soft hover:shadow-lift",
        variant === "gold" &&
          "bg-scouthub-gold text-scouthub-text shadow-soft hover:shadow-lift",
        variant === "secondary" &&
          "bg-white/80 text-scouthub-text ring-1 ring-black/5 hover:bg-white",
        variant === "ghost" && "text-scouthub-muted hover:bg-white/70",
        className,
      )}
      {...props}
    />
  );
}

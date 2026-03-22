"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/cn";

export function Avatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const hasImage = src && src.length > 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full ring-2 ring-white shadow-soft",
        className,
      )}
      style={{ width: size, height: size, minWidth: size }}
    >
      {hasImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) parent.classList.add("avatar-fallback-active");
          }}
        />
      ) : null}
      {/* Fallback */}
      <div className={cn(
        "absolute inset-0 grid place-items-center bg-scouthub-tint text-scouthub-muted",
        hasImage && "opacity-0",
        "[.avatar-fallback-active>&]:opacity-100"
      )}>
        <User style={{ width: size * 0.45, height: size * 0.45 }} />
      </div>
    </div>
  );
}

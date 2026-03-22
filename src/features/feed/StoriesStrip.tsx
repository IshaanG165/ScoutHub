"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

const stories = [
  {
    label: "Your Story",
    image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=300&q=80",
    isYou: true,
  },
  {
    label: "Sydney FC",
    image:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Marcus J.",
    image:
      "https://images.unsplash.com/photo-1520975867597-0c8f26f86784?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Trials Live",
    image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Scout Elite",
    image:
      "https://images.unsplash.com/photo-1520975958225-15f85f3a2f8f?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Adelaide U.",
    image:
      "https://images.unsplash.com/photo-1520975658408-4f9d4f15d2e4?auto=format&fit=crop&w=300&q=80",
  },
];

export function StoriesStrip() {
  return (
    <Card className="p-4">
      <div
        className={cn(
          "flex gap-3 overflow-x-auto pb-1",
          "snap-x snap-mandatory scroll-px-4",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {stories.map((s) => (
          <div
            key={s.label}
            className="snap-start"
            style={{ width: 86, minWidth: 86 }}
          >
            <Link
              href="/stories"
              className="relative mx-auto block h-14 w-14 overflow-hidden rounded-full ring-2 ring-scouthub-gold/60"
              aria-label={`Open ${s.label}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${s.image})` }}
              />
              {s.isYou && (
                <div className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-scouthub-gold text-scouthub-text ring-2 ring-white">
                  <Plus className="h-3.5 w-3.5" />
                </div>
              )}
            </Link>
            <div className="mt-2 truncate text-center text-xs font-semibold text-scouthub-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

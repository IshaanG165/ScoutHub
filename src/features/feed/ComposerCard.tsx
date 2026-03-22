"use client";

import Link from "next/link";
import { ImageIcon, Newspaper, SlidersHorizontal, Video } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

const actions = [
  { icon: ImageIcon, label: "Photo" },
  { icon: Video, label: "Video" },
  { icon: SlidersHorizontal, label: "Stats" },
  { icon: Newspaper, label: "Article" },
];

export function ComposerCard() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar
          src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=256&q=80"
          alt="Alex Smith"
          size={40}
        />
        <input
          className="h-11 w-full rounded-full bg-scouthub-tint/60 px-4 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
          placeholder="Share an update, highlight, or stat..."
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={`/compose?type=${encodeURIComponent(a.label.toLowerCase())}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-scouthub-muted ring-1 ring-black/5 transition hover:bg-white hover:text-scouthub-text"
            >
              <Icon className="h-4 w-4" />
              {a.label}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

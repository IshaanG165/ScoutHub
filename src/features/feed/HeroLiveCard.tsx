"use client";

import Link from "next/link";
import { Eye, MapPin, Play } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function HeroLiveCard() {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-[200px] w-full md:h-[220px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-scouthub-live px-3 py-1 text-xs font-bold text-white shadow-soft">
            <span className="h-2 w-2 rounded-full bg-white/90 animate-pulseSoft" />
            LIVE
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white">
            <Eye className="h-3.5 w-3.5" /> 1.2k
          </span>
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-scouthub-gold/95 text-scouthub-text shadow-lift ring-4 ring-white/20">
            <Play className="h-6 w-6" fill="currentColor" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-white md:text-xl">
              U18 National Trials — Best Moments
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-white/85">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Sydney
              </span>
              <span className="opacity-70">·</span>
              <span>Sat, 22 Mar</span>
            </div>
          </div>

          <Link href="/live" className="hidden md:inline-flex">
            <Button variant="secondary">Watch</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-xs font-medium text-scouthub-muted">
          Spotlight reel curated by verified scouts.
        </div>
        <Link href="/live" className="md:hidden">
          <Button variant="primary">Watch</Button>
        </Link>
      </div>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, MapPin } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function TrialOpportunityCard() {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div
          className="h-[140px] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=1400&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge className="bg-white/85 text-scouthub-text">Invite Only</Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-extrabold tracking-tight">
              Melbourne City U18 — Winger Trials
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-scouthub-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Melbourne
              </span>
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Wed, 03 Apr
              </span>
              <span className="opacity-60">·</span>
              <span>Deadline: 28 Mar</span>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/saved"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-scouthub-muted ring-1 ring-black/5 transition hover:bg-white hover:text-scouthub-text"
              aria-label="Save"
            >
              <Bookmark className="h-4 w-4" />
            </Link>
            <Link href="/trials/apply">
              <Button>Apply</Button>
            </Link>
          </div>
        </div>

        <div className="mt-3 text-sm text-scouthub-muted">
          Focus: 1v1 creation, crossing under pressure, and defensive tracking.
        </div>

        <div className="mt-4 flex items-center justify-between md:hidden">
          <Link
            href="/saved"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-scouthub-muted ring-1 ring-black/5 transition hover:bg-white hover:text-scouthub-text"
          >
            <Bookmark className="h-4 w-4" /> Save
          </Link>
          <Link href="/trials/apply">
            <Button>Apply</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

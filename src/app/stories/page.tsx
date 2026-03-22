"use client";

import * as React from "react";
import { Camera, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const demoStories = [
  { id: "s1", user: "Marcus J.", avatar: "https://images.unsplash.com/photo-1520975867597-0c8f26f86784?auto=format&fit=crop&w=256&q=80", image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80", caption: "Training day 💪" },
  { id: "s2", user: "Kai T.", avatar: "https://images.unsplash.com/photo-1520975958225-15f85f3a2f8f?auto=format&fit=crop&w=256&q=80", image: "https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=800&q=80", caption: "Match highlights incoming 🔥" },
  { id: "s3", user: "Alex R.", avatar: "https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=256&q=80", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80", caption: "New season, new goals ⚽" },
];

export default function StoriesPage() {
  const [active, setActive] = React.useState(0);

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Camera className="h-6 w-6 text-scouthub-green" /> Stories
          </h1>
          <p className="mt-1 text-sm text-scouthub-muted">Share moments and check what others are up to</p>
        </Card>

        {demoStories.length > 0 ? (
          <div className="relative mx-auto max-w-md">
            <Card className="overflow-hidden">
              <div className="relative aspect-[9/16] w-full bg-black">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${demoStories[active].image})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

                {/* Progress bars */}
                <div className="absolute top-3 left-3 right-3 flex gap-1">
                  {demoStories.map((_, i) => (
                    <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30">
                      <div className={`h-full rounded-full bg-white transition-all duration-300 ${i <= active ? "w-full" : "w-0"}`} />
                    </div>
                  ))}
                </div>

                {/* User info */}
                <div className="absolute top-8 left-3 right-3 flex items-center gap-3">
                  <Avatar src={demoStories[active].avatar} alt={demoStories[active].user} size={36} />
                  <span className="text-sm font-bold text-white">{demoStories[active].user}</span>
                </div>

                {/* Caption */}
                <div className="absolute bottom-6 left-4 right-4">
                  <p className="text-sm font-medium text-white drop-shadow">{demoStories[active].caption}</p>
                </div>

                {/* Navigation */}
                {active > 0 && (
                  <button onClick={() => setActive(active - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {active < demoStories.length - 1 && (
                  <button onClick={() => setActive(active + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </Card>

            {/* Story thumbnails */}
            <div className="mt-4 flex justify-center gap-3">
              {demoStories.map((story, i) => (
                <button key={story.id} onClick={() => setActive(i)} className={`transition ${i === active ? "scale-110 ring-2 ring-scouthub-green rounded-full" : "opacity-60"}`}>
                  <Avatar src={story.avatar} alt={story.user} size={44} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState icon={<Camera className="h-10 w-10" />} title="No stories yet" description="Stories from players you follow will appear here" />
        )}
      </div>
    </AppShell>
  );
}

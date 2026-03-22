"use client";

import * as React from "react";
import { Radio, Play, Users, Wifi } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const liveStreams = [
  { id: "l1", title: "U18 National Combine – Day 2", viewers: 2341, streamer: "ScoutHub Official", thumbnail: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80", live: true },
  { id: "l2", title: "Top 10 Goals of the Week", viewers: 8920, streamer: "ScoutHub Highlights", thumbnail: "https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=800&q=80", live: false },
  { id: "l3", title: "Sydney FC Academy Training Session", viewers: 1456, streamer: "Sydney FC", thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80", live: true },
  { id: "l4", title: "Tactical Analysis: Modern Wing Play", viewers: 3210, streamer: "Coach Analytics", thumbnail: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80", live: false },
];

export default function LivePage() {
  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500" /> Live &amp; Videos
          </h1>
          <p className="mt-1 text-sm text-scouthub-muted">Live streams, highlights, and coaching content</p>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {liveStreams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden group cursor-pointer transition hover:shadow-lift">
              <div className="relative aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${stream.thumbnail})` }}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  {stream.live ? (
                    <Badge className="bg-red-500 text-white ring-0 flex items-center gap-1"><Wifi className="h-3 w-3" /> LIVE</Badge>
                  ) : (
                    <Badge className="bg-black/50 text-white ring-0">VOD</Badge>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-full">
                  <Users className="h-3 w-3" /> {stream.viewers.toLocaleString()}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-extrabold truncate">{stream.title}</h3>
                <div className="mt-1 text-xs text-scouthub-muted">{stream.streamer}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

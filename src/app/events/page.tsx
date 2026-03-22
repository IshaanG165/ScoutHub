"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, CalendarDays, Users, Clock, CheckCircle } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import { fetchEvents, rsvpEvent } from "@/lib/supabase/db";
import type { ScoutEvent } from "@/lib/supabase/types";

const typeFilters = ["All", "Showcase", "Camp", "Combine", "Open Session", "Tournament"];

export default function EventsPage() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = React.useState<ScoutEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeType, setActiveType] = React.useState("All");
  const [tab, setTab] = React.useState<"upcoming" | "past">("upcoming");

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchEvents({
        status: tab === "upcoming" ? "upcoming" : "completed",
        type: activeType !== "All" ? activeType.toLowerCase().replace(" ", "_") : undefined,
      }, supabase);
      setEvents(data);
      setLoading(false);
    }
    load();
  }, [supabase, activeType, tab]);

  const demoEvents: ScoutEvent[] = loading ? [] : (events.length > 0 ? events : [
    { id: "e1", organizerId: "c1", organizerName: "Sydney FC", title: "U18 National Combine", description: "Top-level combine for U18 players. Scouts from A-League clubs will attend.", location: "Sydney Olympic Park", eventDate: "2026-04-15T09:00:00Z", endDate: "2026-04-15T17:00:00Z", eventType: "combine", imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80", maxAttendees: 200, attendeeCount: 142, status: "upcoming", createdAt: "2026-03-01" },
    { id: "e2", organizerId: "c2", organizerName: "Melbourne Victory", title: "Youth Talent Showcase", description: "Annual showcase event for emerging talent across Victoria.", location: "AAMI Park, Melbourne", eventDate: "2026-04-22T10:00:00Z", endDate: undefined, eventType: "showcase", imageUrl: "https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=800&q=80", maxAttendees: 150, attendeeCount: 89, status: "upcoming", createdAt: "2026-03-05" },
    { id: "e3", organizerId: "c5", organizerName: "Coastal FC Academy", title: "Summer Skills Camp", description: "Week-long intensive training camp for serious players.", location: "Gold Coast Sports Centre", eventDate: "2026-05-01T08:00:00Z", endDate: "2026-05-05T16:00:00Z", eventType: "camp", imageUrl: undefined, maxAttendees: 60, attendeeCount: 34, status: "upcoming", createdAt: "2026-03-10" },
    { id: "e4", organizerId: "c3", organizerName: "Adelaide United", title: "Open Trial Session", description: "Drop-in assessment session. All age groups welcome.", location: "Coopers Stadium, Adelaide", eventDate: "2026-04-10T14:00:00Z", endDate: undefined, eventType: "open_session", imageUrl: undefined, maxAttendees: 80, attendeeCount: 55, status: "upcoming", createdAt: "2026-03-12" },
  ]);

  async function handleRsvp(eventId: string) {
    if (!user) { toast("error", "Sign in to RSVP"); return; }
    await rsvpEvent(eventId, user.id, "going", supabase);
    toast("success", "You're registered!");
  }

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-scouthub-muted">Showcases, camps, combine days, and open sessions</p>
          <div className="mt-4 flex gap-2">
            <Pill active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</Pill>
            <Pill active={tab === "past"} onClick={() => setTab("past")}>Past</Pill>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {typeFilters.map((t) => (
              <Pill key={t} active={activeType === t} onClick={() => setActiveType(t)}>{t}</Pill>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : demoEvents.length === 0 ? (
          <EmptyState icon={<CalendarDays className="h-10 w-10" />} title="No events found" description="Check back later for upcoming events" />
        ) : (
          <div className="space-y-4">
            {demoEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden transition hover:shadow-lift">
                {event.imageUrl && (
                  <div className="relative h-36 w-full bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <Badge className="absolute left-4 top-4 bg-white/90 text-scouthub-text capitalize">{event.eventType.replace("_", " ")}</Badge>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {!event.imageUrl && <Badge className="mb-2 capitalize">{event.eventType.replace("_", " ")}</Badge>}
                      <h3 className="text-base font-extrabold tracking-tight">{event.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-scouthub-muted">
                        {event.eventDate && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Date(event.eventDate).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                        )}
                        {event.location && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                        )}
                        {event.organizerName && <span>by {event.organizerName}</span>}
                      </div>
                      {event.description && <p className="mt-2 text-sm text-scouthub-muted line-clamp-2">{event.description}</p>}
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2">
                      <div className="text-xs text-scouthub-muted flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {event.attendeeCount}{event.maxAttendees ? `/${event.maxAttendees}` : ""}
                      </div>
                      <Button size="sm" onClick={() => handleRsvp(event.id)}>RSVP</Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between md:hidden">
                    <div className="text-xs text-scouthub-muted flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {event.attendeeCount} attending
                    </div>
                    <Button size="sm" onClick={() => handleRsvp(event.id)}>RSVP</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

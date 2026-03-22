"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, CalendarDays, Swords, Clock, Users, Filter } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { fetchTrials, createTrial } from "@/lib/supabase/db";
import type { Trial } from "@/lib/supabase/types";
import { Plus } from "lucide-react";

const levelFilters = ["All", "Academy", "Semi-Pro", "Pro"];

export default function TrialsPage() {
  const { user, profile, supabase } = useAuth();
  const [trials, setTrials] = React.useState<Trial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeLevel, setActiveLevel] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState<"open" | "closed">("open");
  
  const isClub = profile?.role === "club";
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({ title: "", description: "", location: "", positionNeeded: "", ageGroup: "", level: "academy" });

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchTrials({
        status: statusFilter,
        level: activeLevel !== "All" ? activeLevel.toLowerCase().replace("-", "_") : undefined,
        search: search || undefined,
      }, supabase);
      setTrials(data);
      setLoading(false);
    }
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, activeLevel, statusFilter, supabase, showForm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await createTrial({
      clubId: user.id,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      positionNeeded: formData.positionNeeded,
      ageGroup: formData.ageGroup,
      level: formData.level
    }, supabase);
    setShowForm(false);
    setFormData({ title: "", description: "", location: "", positionNeeded: "", ageGroup: "", level: "academy" });
  }

  const demoTrials: Trial[] = loading ? [] : (trials.length > 0 ? trials : [
    { id: "t1", clubId: "c1", clubName: "Sydney FC Academy", title: "U18 Winger Trials", description: "Seeking pace, 1v1 creativity, and crossing under pressure.", location: "Sydney", positionNeeded: "Winger", ageGroup: "U18", level: "academy", trialDate: "2026-04-10", deadline: "2026-03-28", status: "open", maxApplicants: 30, applicantCount: 18, inviteOnly: false, createdAt: "2026-03-01", clubAvatarUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=256&q=80" },
    { id: "t2", clubId: "c2", clubName: "Melbourne Victory", title: "Centre Back Assessment", description: "Strong defenders with aerial ability and composure on the ball.", location: "Melbourne", positionNeeded: "Centre Back", ageGroup: "U21", level: "semi-pro", trialDate: "2026-04-15", deadline: "2026-04-01", status: "open", maxApplicants: 20, applicantCount: 12, inviteOnly: true, createdAt: "2026-03-05", clubAvatarUrl: undefined },
    { id: "t3", clubId: "c5", clubName: "Coastal FC Academy", title: "Goalkeeper Trials", description: "Looking for shot-stopping ability and distribution quality.", location: "Gold Coast", positionNeeded: "Goalkeeper", ageGroup: "U18", level: "academy", trialDate: "2026-04-20", deadline: "2026-04-10", status: "open", maxApplicants: 10, applicantCount: 6, inviteOnly: false, createdAt: "2026-03-10", clubAvatarUrl: undefined },
    { id: "t4", clubId: "c3", clubName: "Adelaide United", title: "Striker Open Day", description: "Speed, movement, and clinical finishing required.", location: "Adelaide", positionNeeded: "Striker", ageGroup: "Senior", level: "pro", trialDate: "2026-05-01", deadline: "2026-04-15", status: "open", maxApplicants: 25, applicantCount: 22, inviteOnly: false, createdAt: "2026-03-15", clubAvatarUrl: undefined },
  ]);

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Trials</h1>
            <p className="mt-1 text-sm text-scouthub-muted">Browse trial listings, apply quickly, and track applications</p>
          </div>
          {isClub && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> Post Trial</>}
            </Button>
          )}
        </Card>

        {showForm && isClub && (
          <Card className="p-5 animate-slide-up border-scouthub-green/40 ring-1 ring-scouthub-green/10 bg-scouthub-green/5">
            <h2 className="text-lg font-extrabold mb-4">Post a New Trial</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g U18 Open Assessment" className="h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 ring-black/10 focus:ring-scouthub-green/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Location</label>
                  <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g Sydney Olympic Park" className="h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 ring-black/10 focus:ring-scouthub-green/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Position Needed</label>
                  <input required value={formData.positionNeeded} onChange={e => setFormData({ ...formData, positionNeeded: e.target.value })} placeholder="e.g Striker" className="h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 ring-black/10 focus:ring-scouthub-green/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Age Group</label>
                  <input required value={formData.ageGroup} onChange={e => setFormData({ ...formData, ageGroup: e.target.value })} placeholder="e.g U18" className="h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 ring-black/10 focus:ring-scouthub-green/20" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold block mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl bg-white p-3 text-sm ring-1 ring-black/10 focus:ring-scouthub-green/20" rows={2} />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Trial Listing</Button>
            </form>
          </Card>
        )}

        <Card className="p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trials..."
              className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill active={statusFilter === "open"} onClick={() => setStatusFilter("open")}>Open</Pill>
            <Pill active={statusFilter === "closed"} onClick={() => setStatusFilter("closed")}>Closed</Pill>
            <span className="mx-1 h-6 w-px bg-black/10" />
            {levelFilters.map((l) => (
              <Pill key={l} active={activeLevel === l} onClick={() => setActiveLevel(l)}>{l}</Pill>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : demoTrials.length === 0 ? (
          <EmptyState icon={<Swords className="h-10 w-10" />} title="No trials found" description="Try adjusting your filters or check back later" />
        ) : (
          <div className="space-y-4">
            {demoTrials.map((trial) => (
              <Card key={trial.id} className="p-5 transition hover:shadow-lift">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {trial.inviteOnly && <Badge className="bg-scouthub-gold/10 text-scouthub-gold ring-scouthub-gold/20">Invite Only</Badge>}
                      <Badge className="capitalize">{trial.level}</Badge>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold tracking-tight">{trial.title}</h3>
                    <div className="mt-1 text-xs font-medium text-scouthub-gold">{trial.clubName}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-scouthub-muted">
                      {trial.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{trial.location}</span>}
                      {trial.trialDate && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(trial.trialDate).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</span>}
                      {trial.deadline && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Deadline: {new Date(trial.deadline).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>}
                    </div>
                    {trial.description && <p className="mt-2 text-sm text-scouthub-muted line-clamp-2">{trial.description}</p>}
                    <div className="mt-3 flex items-center gap-3 text-xs text-scouthub-muted">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{trial.applicantCount}/{trial.maxApplicants} spots</span>
                      {trial.positionNeeded && <Badge>{trial.positionNeeded}</Badge>}
                      {trial.ageGroup && <Badge className="bg-scouthub-gold/10 text-scouthub-gold ring-scouthub-gold/20">{trial.ageGroup}</Badge>}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <Link href={`/trials/apply?id=${trial.id}&title=${encodeURIComponent(trial.title)}`}>
                      <Button>Apply</Button>
                    </Link>
                  </div>
                </div>
                <div className="mt-3 md:hidden">
                  <Link href={`/trials/apply?id=${trial.id}&title=${encodeURIComponent(trial.title)}`}>
                    <Button className="w-full">Apply Now</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

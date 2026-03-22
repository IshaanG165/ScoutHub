"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Filter, Star, Eye, Briefcase, Activity, Target } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { fetchPlayersForDiscovery } from "@/lib/supabase/db";

const sports = ["All", "Football", "Basketball", "Cricket", "Tennis", "Rugby"];

function ScoutsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const { supabase } = useAuth();
  const [search, setSearch] = React.useState(initialQ);
  const [activeSport, setActiveSport] = React.useState("All");
  const [players, setPlayers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPlayersForDiscovery({
        search: search || undefined,
        limit: 20,
      }, supabase);
      setPlayers(data);
      setLoading(false);
    }
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, activeSport, supabase]);

  // Demo data when no Supabase data available
  const displayPlayers = players.length > 0 ? players : (loading ? [] : [
    { profile: { id: "1", fullName: "Marcus Johnson", avatarUrl: "https://images.unsplash.com/photo-1520975867597-0c8f26f86784?auto=format&fit=crop&w=256&q=80", location: "Sydney, NSW", verified: true, role: "scout" }, player: { sport: "Basketball", availability: "available" } },
    { profile: { id: "2", fullName: "Kai Tanaka", avatarUrl: "https://images.unsplash.com/photo-1520975958225-15f85f3a2f8f?auto=format&fit=crop&w=256&q=80", location: "Melbourne, VIC", verified: false, role: "player" }, player: { sport: "Football", ageGroup: "U18", currentClub: "Melbourne Victory", availability: "available" } },
    { profile: { id: "3", fullName: "Alex Rivera", avatarUrl: "https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=256&q=80", location: "Brisbane, QLD", verified: true, role: "player" }, player: { sport: "Cricket", ageGroup: "U21", currentClub: "Brisbane Roar", availability: "limited" } },
    { profile: { id: "4", fullName: "Jordan Blake", avatarUrl: null, location: "Perth, WA", verified: false, role: "scout" }, player: { sport: "Tennis", availability: "available" } },
    { profile: { id: "5", fullName: "Sam Williams", avatarUrl: null, location: "Adelaide, SA", verified: false, role: "player" }, player: { sport: "Football", ageGroup: "Senior", currentClub: "Adelaide United", availability: "available" } },
    { profile: { id: "6", fullName: "Riley Chen", avatarUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=256&q=80", location: "Gold Coast, QLD", verified: false, role: "scout" }, player: { sport: "Rugby", availability: "available" } },
  ]).filter(p => activeSport === "All" || (p.profile as any)?.sport === activeSport || (p.player as any)?.sport === activeSport || (p.player as any)?.position === activeSport);

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Discover Profiles</h1>
              <p className="mt-1 text-sm text-scouthub-muted">Find and shortlist scouts and players across all sports and regions</p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players by name, club, or location..."
              className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sports.map((s) => (
              <Pill key={s} active={activeSport === s} onClick={() => setActiveSport(s)}>{s}</Pill>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
          </div>
        ) : displayPlayers.length === 0 ? (
          <EmptyState icon={<Search className="h-10 w-10" />} title="No players found" description="Try adjusting your search or filters" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayPlayers.map((p: any) => (
              <Link key={p.profile.id} href={`/profile?id=${p.profile.id}`}>
                <Card className="overflow-hidden transition hover:shadow-lift group">
                  <div className="h-20 bg-gradient-to-r from-scouthub-green/15 via-scouthub-gold/10 to-scouthub-green/5" />
                  <div className="relative px-4 pb-4 -mt-8">
                    <Avatar src={p.profile.avatarUrl} alt={p.profile.fullName} size={56} className="ring-4 ring-white shadow-lift" />
                    <div className="mt-2 flex items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold">{p.profile.fullName}</h3>
                      {p.profile.verified && <Star className="h-4 w-4 text-scouthub-gold fill-scouthub-gold" />}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                      <Badge className="capitalize bg-scouthub-tint text-scouthub-dark"><Briefcase className="w-3 h-3 mr-1" />{p.profile.role || "Member"}</Badge>
                      {(p.profile.sport || p.player?.sport) && <Badge className="bg-scouthub-gold/10 text-scouthub-gold ring-scouthub-gold/20"><Activity className="w-3 h-3 mr-1" />{p.profile.sport || p.player.sport}</Badge>}
                      {(p.profile.position || p.player?.position) && <Badge className="bg-scouthub-gold/10 text-scouthub-gold ring-scouthub-gold/20"><Target className="w-3 h-3 mr-1" />{p.profile.position || p.player.position}</Badge>}
                      {p.player?.ageGroup && <Badge className="bg-scouthub-green/10 text-scouthub-green ring-scouthub-green/20">{p.player.ageGroup}</Badge>}
                    </div>
                    {p.profile.location && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-scouthub-muted">
                        <MapPin className="h-3.5 w-3.5" /> {p.profile.location}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-scouthub-green hover:bg-scouthub-green/10">View Profile</Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ScoutsPage() {
  return <Suspense fallback={<AppShell><div className="space-y-5"><div className="h-20 w-full animate-pulse rounded-xl bg-scouthub-tint" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-56 animate-pulse rounded-xl bg-scouthub-tint" />)}</div></div></AppShell>}><ScoutsContent /></Suspense>;
}

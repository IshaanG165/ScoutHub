"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, Users, Trophy, Building2 } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { fetchClubsForDiscovery } from "@/lib/supabase/db";

export default function ClubsPage() {
  const { supabase } = useAuth();
  const [search, setSearch] = React.useState("");
  const [clubs, setClubs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchClubsForDiscovery({ search: search || undefined, limit: 20 }, supabase);
      setClubs(data);
      setLoading(false);
    }
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, supabase]);

  const displayClubs = clubs.length > 0 ? clubs : (loading ? [] : [
    { profile: { id: "c1", fullName: "Sydney Kings", avatarUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=256&q=80", location: "Sydney, NSW", verified: true, bio: "Professional basketball club operating in the NBL." }, club: { clubName: "Sydney Kings", league: "NBL", openTrialsCount: 3 } },
    { profile: { id: "c2", fullName: "Melbourne Victory", avatarUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=256&q=80", location: "Melbourne, VIC", verified: true, bio: "One of Australia's most successful football clubs." }, club: { clubName: "Melbourne Victory", league: "A-League", openTrialsCount: 2 } },
    { profile: { id: "c3", fullName: "Adelaide Strikers", avatarUrl: null, location: "Adelaide, SA", verified: false, bio: "South Australia's premier cricket franchise." }, club: { clubName: "Adelaide Strikers", league: "BBL", openTrialsCount: 1 } },
    { profile: { id: "c4", fullName: "Brisbane Broncos", avatarUrl: null, location: "Brisbane, QLD", verified: true, bio: "Queensland's leading rugby league team." }, club: { clubName: "Brisbane Broncos", league: "NRL", openTrialsCount: 0 } },
    { profile: { id: "c5", fullName: "Coastal FC Academy", avatarUrl: null, location: "Gold Coast, QLD", verified: false, bio: "Premium youth development program supporting young athletes." }, club: { clubName: "Coastal FC Academy", league: "Development Academy", openTrialsCount: 4 } },
    { profile: { id: "c6", fullName: "Western Sydney Wanderers", avatarUrl: null, location: "Sydney, NSW", verified: true, bio: "Building the future of Australian multi-sport athletics." }, club: { clubName: "Western Sydney Wanderers", league: "Athletics Federation", openTrialsCount: 1 } },
  ]);

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Teams and Clubs</h1>
          <p className="mt-1 text-sm text-scouthub-muted">Verified club profiles, athletic academies, and multi-sport recruitment opportunities</p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20" />
          </div>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 w-full" />)}
          </div>
        ) : displayClubs.length === 0 ? (
          <EmptyState icon={<Building2 className="h-10 w-10" />} title="No clubs found" description="Try adjusting your search" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {displayClubs.map((c: any) => (
              <Link key={c.profile.id} href={`/profile?id=${c.profile.id}`}>
                <Card className="p-5 transition hover:shadow-lift group h-full">
                <div className="flex items-start gap-4">
                  <Avatar src={c.profile.avatarUrl} alt={c.profile.fullName} size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold">{c.profile.fullName}</h3>
                      {c.profile.verified && <Badge className="bg-scouthub-green/10 text-scouthub-green">Verified</Badge>}
                    </div>
                    {c.club?.league && <div className="text-xs font-medium text-scouthub-gold mt-0.5">{c.club.league}</div>}
                    {c.profile.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-scouthub-muted">
                        <MapPin className="h-3.5 w-3.5" /> {c.profile.location}
                      </div>
                    )}
                    {c.profile.bio && <p className="mt-2 text-xs text-scouthub-muted line-clamp-2">{c.profile.bio}</p>}
                    <div className="mt-4 flex items-center gap-3">
                      {c.club?.openTrialsCount > 0 && (
                        <Badge className="bg-scouthub-gold/10 text-scouthub-gold ring-scouthub-gold/20">
                          <Trophy className="h-3 w-3" /> {c.club.openTrialsCount} open trial{c.club.openTrialsCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="hidden group-hover:block transition">View Profile</Button>
                    </div>
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

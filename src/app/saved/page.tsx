"use client";

import * as React from "react";
import { Bookmark, Users, Swords, CalendarDays, FileText } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { fetchSavedItems } from "@/lib/supabase/db";
import type { SavedItem } from "@/lib/supabase/types";

const tabs = [
  { key: "all", label: "All", icon: Bookmark },
  { key: "post", label: "Posts", icon: FileText },
  { key: "player", label: "Players", icon: Users },
  { key: "trial", label: "Trials", icon: Swords },
  { key: "event", label: "Events", icon: CalendarDays },
];

export default function SavedPage() {
  const { user, supabase } = useAuth();
  const [items, setItems] = React.useState<SavedItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      setLoading(true);
      const data = await fetchSavedItems(user!.id, activeTab !== "all" ? activeTab : undefined, supabase);
      setItems(data);
      setLoading(false);
    }
    load();
  }, [user, supabase, activeTab]);

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Saved</h1>
          <p className="mt-1 text-sm text-scouthub-muted">Your saved trials, clubs, players, and posts — organized in one place</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <Pill key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
                  <Icon className="h-4 w-4" /> {t.label}
                </Pill>
              );
            })}
          </div>
        </Card>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-10 w-10" />}
            title="No saved items"
            description="Save posts, players, trials, and events to find them here"
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-scouthub-tint text-scouthub-muted">
                  {item.itemType === "post" ? <FileText className="h-5 w-5" /> :
                   item.itemType === "player" ? <Users className="h-5 w-5" /> :
                   item.itemType === "trial" ? <Swords className="h-5 w-5" /> :
                   <CalendarDays className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold capitalize">{item.itemType}</div>
                  <div className="text-xs text-scouthub-muted">Saved {new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

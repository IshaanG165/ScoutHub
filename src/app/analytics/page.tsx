"use client";

import * as React from "react";
import { BarChart3, Eye, Users, Heart, Trophy, TrendingUp, Target } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pill } from "@/components/ui/Pill";
import { useAuth } from "@/lib/supabase/auth";
import { fetchAnalyticsSummary } from "@/lib/supabase/db";
import type { AnalyticsSummary } from "@/lib/supabase/types";

export default function AnalyticsPage() {
  const { user, profile, supabase } = useAuth();
  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("30d");

  React.useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      const data = await fetchAnalyticsSummary(user.id, supabase);
      setAnalytics(data);
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  const stats = analytics || { profileViews: 247, postEngagement: 892, scoutInterest: 18, profileCompletion: 72, trialApplications: 5, matchReadiness: 88 };

  const statCards = [
    { label: "Profile Views", value: stats.profileViews, icon: Eye, color: "text-blue-500", trend: "+12%" },
    { label: "Scout Interest", value: stats.scoutInterest, icon: Users, color: "text-purple-500", trend: "+3" },
    { label: "Post Engagement", value: stats.postEngagement, icon: Heart, color: "text-red-400", trend: "+24%" },
    { label: "Trial Applications", value: stats.trialApplications, icon: Trophy, color: "text-scouthub-gold", trend: "2 active" },
  ];

  // CSS-only bar chart
  const weeklyData = [
    { day: "Mon", views: 35 }, { day: "Tue", views: 52 }, { day: "Wed", views: 28 },
    { day: "Thu", views: 67 }, { day: "Fri", views: 41 }, { day: "Sat", views: 89 }, { day: "Sun", views: 55 },
  ];
  const maxView = Math.max(...weeklyData.map((d) => d.views));

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
              <p className="mt-1 text-sm text-scouthub-muted">Profile views, scout interest, video engagement, and suggested actions</p>
            </div>
            <div className="flex gap-2">
              <Pill active={period === "7d"} onClick={() => setPeriod("7d")}>7 days</Pill>
              <Pill active={period === "30d"} onClick={() => setPeriod("30d")}>30 days</Pill>
              <Pill active={period === "90d"} onClick={() => setPeriod("90d")}>90 days</Pill>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xs font-semibold text-scouthub-green">{s.trend}</span>
                </div>
                <div className="mt-3 text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-xs text-scouthub-muted">{s.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Weekly Activity Chart */}
          <Card className="p-5">
            <h2 className="text-sm font-extrabold mb-4">Weekly Activity</h2>
            <div className="flex items-end justify-between gap-2 h-40">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-8 rounded-t-lg bg-gradient-to-t from-scouthub-green/60 to-scouthub-green transition-all duration-700"
                      style={{ height: `${(d.views / maxView) * 120}px` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-scouthub-muted">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Profile Strength */}
          <Card className="p-5">
            <h2 className="text-sm font-extrabold mb-4">Profile Strength</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-scouthub-muted">Profile Completion</span>
                  <span className="font-bold text-scouthub-gold">{stats.profileCompletion}%</span>
                </div>
                <Progress value={stats.profileCompletion} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-scouthub-muted">Match Readiness</span>
                  <span className="font-bold text-scouthub-green">{stats.matchReadiness}%</span>
                </div>
                <Progress value={stats.matchReadiness} className="[&>div]:bg-scouthub-green" />
              </div>
              <div className="rounded-2xl bg-scouthub-tint/60 p-3 ring-1 ring-black/5">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-scouthub-green" />
                  <span className="font-semibold">Suggestion</span>
                </div>
                <p className="mt-1 text-xs text-scouthub-muted">Upload a highlight video to boost your profile visibility by 40%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Engagement Breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold mb-4">Engagement Breakdown</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-scouthub-tint/50 p-4 ring-1 ring-black/5">
              <div className="text-xs text-scouthub-muted">Video Views</div>
              <div className="mt-1 text-xl font-extrabold">1,284</div>
              <div className="text-xs text-scouthub-green font-semibold">+18% this week</div>
            </div>
            <div className="rounded-2xl bg-scouthub-tint/50 p-4 ring-1 ring-black/5">
              <div className="text-xs text-scouthub-muted">Post Saves</div>
              <div className="mt-1 text-xl font-extrabold">46</div>
              <div className="text-xs text-scouthub-green font-semibold">+5 this week</div>
            </div>
            <div className="rounded-2xl bg-scouthub-tint/50 p-4 ring-1 ring-black/5">
              <div className="text-xs text-scouthub-muted">Shortlisted By</div>
              <div className="mt-1 text-xl font-extrabold">8</div>
              <div className="text-xs text-scouthub-green font-semibold">+2 this month</div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

"use client";

import * as React from "react";
import { Bell, CheckCircle2, Eye, Trophy, Heart, Shield, Clock } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/supabase/db";
import type { Notification } from "@/lib/supabase/types";
import Link from "next/link";
import { cn } from "@/lib/cn";

const iconMap: Record<string, React.ReactNode> = {
  profile_view: <Eye className="h-5 w-5 text-blue-500" />,
  trial_update: <Trophy className="h-5 w-5 text-scouthub-gold" />,
  like: <Heart className="h-5 w-5 text-red-400" />,
  verification: <Shield className="h-5 w-5 text-scouthub-green" />,
  default: <Bell className="h-5 w-5 text-scouthub-muted" />,
};

export default function NotificationsPage() {
  const { user, supabase } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      const data = await fetchNotifications(user!.id, 30, supabase);
      setNotifications(data);
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  async function handleMarkAll() {
    if (!user) return;
    await markAllNotificationsRead(user.id, supabase);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id, supabase);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  const demoNotifs: Notification[] = notifications.length > 0 ? notifications : [
    { id: "n1", userId: "", type: "profile_view", title: "Profile viewed", body: "A scout from Sydney FC viewed your profile", link: "/analytics", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "n2", userId: "", type: "trial_update", title: "Application update", body: "Your application to U18 Winger Trials has been shortlisted!", link: "/trials", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "n3", userId: "", type: "like", title: "Post liked", body: "Marcus Johnson liked your training update", link: "/", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "n4", userId: "", type: "verification", title: "Verification approved", body: "Your identity has been verified. Badge is now active!", link: "/profile", read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  const unreadCount = demoNotifs.filter((n) => !n.read).length;

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
              <p className="mt-1 text-sm text-scouthub-muted">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
            </div>
            {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={handleMarkAll}><CheckCircle2 className="h-4 w-4" /> Mark all read</Button>}
          </div>
        </Card>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : demoNotifs.length === 0 ? (
          <EmptyState icon={<Bell className="h-10 w-10" />} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {demoNotifs.map((n) => (
              <Link key={n.id} href={n.link || "#"} onClick={() => !n.read && handleMarkOne(n.id)}>
                <Card className={cn("flex items-start gap-4 p-4 transition hover:shadow-lift", !n.read && "bg-scouthub-green/3 ring-scouthub-green/10")}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-scouthub-tint">
                    {iconMap[n.type] || iconMap.default}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-scouthub-green" />}
                    </div>
                    <p className="mt-0.5 text-xs text-scouthub-muted">{n.body}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-scouthub-muted">
                      <Clock className="h-3 w-3" />
                      {new Date(n.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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

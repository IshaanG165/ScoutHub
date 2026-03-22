"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  Cog,
  Compass,
  Home,
  MessageSquare,
  Menu,
  Shield,
  Swords,
  Users,
  X,
  LogIn,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/supabase/auth";

const nav = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/scouts", label: "Scouts", icon: Compass },
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/trials", label: "Trials", icon: Swords },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Cog },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, profile, loading } = useAuth();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Guest";
  const roleMeta = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "Member";
  const readiness = 88; // TODO: from player profile

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-xl bg-white shadow-soft md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-scouthub-text" />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-dvh border-r border-black/5 bg-scouthub-tint/90 px-4 py-5 transition-transform duration-300 ease-out",
          "w-[280px]",
          "max-md:-translate-x-full max-md:data-[open=true]:translate-x-0",
          "md:block",
        )}
        data-open={mobileOpen}
      >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-scouthub-green text-white shadow-soft">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-lg font-extrabold tracking-tight text-scouthub-text">
              Scout<span className="text-scouthub-gold">Hub</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-scouthub-muted" />
          </button>
        </div>

        {user ? (
          <Link href="/profile">
            <Card className="mt-5 p-4 transition hover:shadow-lift">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile?.avatarUrl}
                  alt={displayName}
                  size={44}
                  className="ring-white"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{displayName}</div>
                  <div className="text-xs font-semibold text-scouthub-gold">
                    {roleMeta}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs font-medium text-scouthub-muted">
                  Match Readiness
                </div>
                <div className="text-xs font-bold text-scouthub-gold">{readiness}%</div>
              </div>
              <Progress value={readiness} className="mt-2" />
              <div className="mt-2 text-[11px] text-scouthub-muted">
                Updated today
              </div>
            </Card>
          </Link>
        ) : !loading ? (
          <Card className="mt-5 p-4">
            <div className="text-sm font-extrabold">Welcome to ScoutHub</div>
            <div className="mt-1 text-xs text-scouthub-muted">
              Sign in to access all features.
            </div>
            <Link
              href="/login"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-scouthub-green px-4 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Card>
        ) : null}

        <nav className="mt-4 space-y-1 px-1">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition md:py-2.5",
                  "text-scouthub-muted hover:bg-white/70 hover:text-scouthub-text",
                  active &&
                    "bg-white/80 text-scouthub-text shadow-soft ring-1 ring-black/5",
                )}
              >
                {active && (
                  <span className="absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-scouthub-gold" />
                )}
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Card className="p-4">
            <div className="text-sm font-extrabold">Go Pro</div>
            <div className="mt-1 text-xs text-scouthub-muted">
              Unlock advanced analytics and priority scouting access.
            </div>
            <Link
              href="/upgrade"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-scouthub-gold px-4 text-sm font-semibold text-scouthub-text shadow-soft transition hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-scouthub-green/30 active:translate-y-[1px]"
            >
              Upgrade
            </Link>
          </Card>

          <div className="mt-3 px-2 text-[11px] text-scouthub-muted">
            © {new Date().getFullYear()} ScoutHub
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

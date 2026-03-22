"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, Search, Shield } from "lucide-react";

import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/supabase/auth";

const tabs = [
  { href: "/", label: "Feed" },
  { href: "/scouts", label: "Scouts" },
  { href: "/clubs", label: "Clubs" },
  { href: "/events", label: "Events" },
];

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-scouthub-tint/70 backdrop-blur supports-[backdrop-filter]:bg-scouthub-tint/60">
      <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-scouthub-green text-white shadow-soft">
            <Shield className="h-4 w-4" />
          </div>
          <div className="text-sm font-extrabold tracking-tight">Scout<span className="text-scouthub-gold">Hub</span></div>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {tabs.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname?.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href}>
                <Pill active={active}>{t.label}</Pill>
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
            <input
              placeholder="Search..."
              className={cn(
                "h-10 w-[280px] rounded-full bg-white/80 pl-9 pr-3 text-sm ring-1 ring-black/5",
                "placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20",
              )}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const v = (e.currentTarget.value ?? "").trim();
                if (!v) {
                  router.push("/scouts");
                  return;
                }
                router.push(`/scouts?q=${encodeURIComponent(v)}`);
              }}
            />
          </div>

          <Link
            href="/notifications"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/75 text-scouthub-muted ring-1 ring-black/5 transition hover:bg-white hover:text-scouthub-text"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>

          {user ? (
            <Link href="/profile">
              <Avatar
                src={profile?.avatarUrl}
                alt={profile?.fullName || "You"}
                size={36}
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-scouthub-green px-4 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

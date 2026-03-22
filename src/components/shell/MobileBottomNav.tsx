"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Home, Search, Users } from "lucide-react";

import { cn } from "@/lib/cn";

const items = [
  { href: "/", icon: Home, label: "Feed" },
  { href: "/scouts", icon: Search, label: "Scouts" },
  { href: "/clubs", icon: Users, label: "Clubs" },
  { href: "/events", icon: CalendarDays, label: "Events" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-[620px] grid-cols-5 px-2 py-3">
        {items.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname?.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-medium text-scouthub-muted transition active:scale-95",
                active && "text-scouthub-green",
              )}
            >
              <Icon className={cn("h-6 w-6", active && "text-scouthub-green")} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

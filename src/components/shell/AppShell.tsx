"use client";

import * as React from "react";

import { cn } from "@/lib/cn";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopNavbar } from "@/components/shell/TopNavbar";
import { MobileBottomNav } from "@/components/shell/MobileBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-scouthub-bg">
      <Sidebar />

      <div className="md:pl-[280px]">
        <TopNavbar />

        <main
          className={cn(
            "mx-auto w-full max-w-[1120px] px-4 pb-24 pt-5 md:px-6 md:pb-10",
          )}
        >
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

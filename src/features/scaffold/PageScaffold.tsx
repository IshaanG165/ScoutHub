import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function PageScaffold({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{title}</div>
            <div className="mt-2 max-w-[70ch] text-sm text-scouthub-muted">
              {subtitle}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Supabase-ready</Badge>
            <Link
              href="/verification"
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-scouthub-text ring-1 ring-black/5 transition hover:bg-white"
            >
              Get Verified
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-extrabold">Coming next</div>
        <div className="mt-2 text-sm text-scouthub-muted">
          This page is scaffolded with the same premium layout and will be populated
          with real modules (filters, cards, pipelines, tables, and forms).
        </div>
      </Card>
    </div>
  );
}

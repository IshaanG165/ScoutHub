import Link from "next/link";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                Post
              </div>
              <div className="mt-2 text-sm text-scouthub-muted">
                Post details will be populated from Supabase.
              </div>
            </div>
            <Badge>Post ID: {id}</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-extrabold">Actions</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/posts/${encodeURIComponent(id)}/comments`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white/80 px-4 text-sm font-semibold text-scouthub-text ring-1 ring-black/5 transition hover:bg-white"
            >
              View comments
            </Link>
            <Link
              href={`/posts/${encodeURIComponent(id)}/share`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white/80 px-4 text-sm font-semibold text-scouthub-text ring-1 ring-black/5 transition hover:bg-white"
            >
              Share
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

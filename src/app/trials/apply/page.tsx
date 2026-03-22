"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Video } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import { applyToTrial } from "@/lib/supabase/db";
import Link from "next/link";

function TrialApplyContent() {
  const { user, profile, supabase } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trialId = searchParams.get("id") || "";
  const trialTitle = searchParams.get("title") || "Trial";

  const [position, setPosition] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const inputClass = "h-11 w-full rounded-xl bg-scouthub-tint/60 px-4 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase) { toast("error", "Please sign in"); return; }
    if (!position || !message) { toast("error", "Please fill required fields"); return; }
    setSubmitting(true);
    const res = await applyToTrial({ trialId, playerId: user.id, position, message, videoUrl }, supabase);
    if (res.error) { toast("error", res.error); setSubmitting(false); return; }
    toast("success", "Application submitted!");
    router.push("/trials");
  }

  if (!user) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <p className="font-bold">Sign in to apply to trials</p>
          <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="grid h-10 w-10 place-items-center rounded-full bg-white/80 ring-1 ring-black/5 hover:bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Apply to Trial</h1>
            <p className="text-sm text-scouthub-muted">{trialTitle}</p>
          </div>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Position</label>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass}>
                <option value="">Select your position</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Centre Back">Centre Back</option>
                <option value="Full Back">Full Back</option>
                <option value="Wing Back">Wing Back</option>
                <option value="Defensive Midfielder">Defensive Midfielder</option>
                <option value="Central Midfielder">Central Midfielder</option>
                <option value="Attacking Midfielder">Attacking Midfielder</option>
                <option value="Winger">Winger</option>
                <option value="Striker">Striker</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Why should you be selected?</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the club about your strengths, experience, and what makes you stand out..."
                className="w-full rounded-xl bg-scouthub-tint/60 px-4 py-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                rows={4} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Highlight Video URL <span className="text-xs text-scouthub-muted">(optional)</span></span>
              </label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..." className={inputClass} />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : <><Send className="h-4 w-4" /> Submit Application</>}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrialApplyContent />
    </Suspense>
  );
}

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth";
import { StoriesStrip } from "@/features/feed/StoriesStrip";
import { HeroLiveCard } from "@/features/feed/HeroLiveCard";
import { ComposerCard } from "@/features/feed/ComposerCard";
import { FeedPostCard } from "@/features/feed/FeedPostCard";
import { TrialOpportunityCard } from "@/features/feed/TrialOpportunityCard";
import { RealtimeFeedPosts } from "@/features/feed/RealtimeFeedPosts";
import Link from "next/link";
import { fetchPendingRequests, sendConnectionRequest, updateConnectionStatus } from "@/lib/supabase/db";

export function FeedPage() {
  const router = useRouter();
  const { user, profile, loading, supabase } = useAuth();
  const isClub = profile?.role === "club";
  const isScout = profile?.role === "scout";

  const [recommendedUsers, setRecommendedUsers] = React.useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<any[]>([]);
  const [sentRequests, setSentRequests] = React.useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user && supabase) {
      const loadData = async () => {
        const [users, reqs] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, role, location, avatar_url")
            .neq("id", user.id)
            .order("created_at", { ascending: false })
            .limit(3),
          fetchPendingRequests(user.id, supabase)
        ]);
        if (users.data) setRecommendedUsers(users.data);
        if (reqs) setPendingRequests(reqs);
      };
      loadData();
    }
  }, [loading, user, router, supabase]);

  const handleSendRequest = async (receiverId: string) => {
    if (!user || !supabase) return;
    setSentRequests((prev) => new Set([...prev, receiverId]));
    await sendConnectionRequest(user.id, receiverId, supabase);
  };

  const handleAcceptRequest = async (id: string) => {
    if (!supabase) return;
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    await updateConnectionStatus(id, "accepted", supabase);
  };

  if (loading || !user) {
    return <div className="p-10 text-center text-sm font-medium text-scouthub-muted">Loading your personalized feed...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
      <section className="space-y-5">
        <StoriesStrip />
        <HeroLiveCard />
        <ComposerCard />

        <TrialOpportunityCard />

        {/* Supabase Realtime Feed */}
        <RealtimeFeedPosts />

        {/* Static fallback posts - shown while realtime loads or as examples */}
        <div className="border-t border-black/5 pt-5">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-scouthub-muted">
            Featured Posts
          </p>
          <div className="space-y-5">

        <FeedPostCard
          id="club-sydney-fc-u18-trials"
          author={{
            name: "Sydney FC Academy",
            meta: "Official Club",
            verified: true,
            avatar:
              "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=256&q=80",
          }}
          time="2h ago"
          title="Trials for U18 Winger/Left Back — Apply Now!"
          body="We’re inviting selected players for an invite-only assessment. Strong 1v1 ability, transition speed, and tactical discipline preferred."
          match={94}
        />

        <FeedPostCard
          id="player-kai-tanaka-training"
          author={{
            name: "Kai Tanaka",
            meta: "Right Wing · Melbourne",
            verified: false,
            avatar:
              "https://images.unsplash.com/photo-1520975958225-15f85f3a2f8f?auto=format&fit=crop&w=256&q=80",
          }}
          time="12h ago"
          title="Training Session — Speed & Agility Drills"
          body="Small improvements this week: first-step acceleration and repeat sprint consistency. Clips attached."
          media="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80"
        />

        <FeedPostCard
          id="scout-elite-u18-forwards"
          author={{
            name: "Scout Elite",
            meta: "Verified Scout",
            verified: true,
            avatar:
              "https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=256&q=80",
          }}
          time="1d ago"
          title="What we look for in U18 forwards"
          body="Movement without the ball, scanning before receiving, and repeatability under pressure. Profiles with consistent match footage stand out."
        />
          </div>
        </div>
      </section>

      <aside className="hidden space-y-5 lg:block">
        {/* Connection Requests Panel */}
        <div className="rounded-3xl bg-white/70 p-4 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center justify-between text-sm font-extrabold">
            <span>Pending Requests</span>
            <span className="bg-scouthub-green text-white text-[10px] px-2 py-0.5 rounded-full">New</span>
          </div>
          <div className="mt-4 space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(req => {
                const sender = Array.isArray(req.sender) ? req.sender[0] : req.sender;
                return (
                  <div key={req.id} className="rounded-2xl bg-scouthub-tint/70 p-3 ring-1 ring-black/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{sender?.full_name || "Unknown"}</div>
                      <div className="text-xs text-scouthub-muted">Wants to connect</div>
                    </div>
                    <button onClick={() => handleAcceptRequest(req.id)} className="bg-scouthub-green text-white px-3 py-1 text-xs rounded-xl font-semibold hover:bg-scouthub-green/90 transition">
                      Accept
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-scouthub-muted">No pending requests</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white/70 p-4 shadow-soft ring-1 ring-black/5">
          <div className="text-sm font-extrabold">Recommended</div>
          <div className="mt-1 text-xs text-scouthub-muted">
            {isClub ? "Players & Scouts aligned with your club." : isScout ? "Players & Clubs aligned with your profile." : "Scouts & Clubs aligned with your profile."}
          </div>
          <div className="mt-4 space-y-3">
            {recommendedUsers.length > 0 ? (
              recommendedUsers.map((u) => (
                <div key={u.id} className="rounded-2xl bg-scouthub-tint/70 p-3 ring-1 ring-black/5 relative pb-10">
                  <div className="flex items-center gap-2 mb-1">
                    {u.avatar_url && <img src={u.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />}
                    <div className="text-sm font-bold truncate">
                      <Link href={`/profile?id=${u.id}`} className="hover:underline">{u.full_name || "Unknown User"}</Link>
                    </div>
                  </div>
                  <div className="text-xs text-scouthub-muted capitalize">{u.role} {u.location ? `· ${u.location}` : ""}</div>
                  <button 
                    disabled={sentRequests.has(u.id)}
                    onClick={() => handleSendRequest(u.id)} 
                    className="absolute bottom-3 right-3 text-xs font-semibold text-scouthub-green hover:underline">
                    {sentRequests.has(u.id) ? "Request Sent" : "Send Request"}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-xs text-scouthub-muted">No recommendations at this time.</div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

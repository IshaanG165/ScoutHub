"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin, Calendar, Edit3, Trophy, Video, Star, Shield, CheckCircle2,
  BarChart3, Eye, Users, ChevronRight, Plus, Upload,
} from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import { FeedPostCard } from "@/features/feed/FeedPostCard";
import {
  fetchPlayerProfile, fetchPlayerStats, fetchPlayerHighlights,
  fetchPlayerAchievements, fetchAnalyticsSummary, fetchProfileById,
  sendConnectionRequest, fetchConnectionStatus
} from "@/lib/supabase/db";
import type { PlayerProfile, PlayerStat, PlayerHighlight, PlayerAchievement, AnalyticsSummary, Profile, FeedPost } from "@/lib/supabase/types";

function ProfileContent() {
  const { user, profile, supabase, loading, updateProfile } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const targetId = searchParams.get("id") || user?.id;
  const isOwnProfile = user?.id === targetId;

  const [displayProfile, setDisplayProfile] = React.useState<Profile | null>(null);
  const [playerData, setPlayerData] = React.useState<PlayerProfile | null>(null);
  const [stats, setStats] = React.useState<PlayerStat[]>([]);
  const [highlights, setHighlights] = React.useState<PlayerHighlight[]>([]);
  const [achievements, setAchievements] = React.useState<PlayerAchievement[]>([]);
  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(null);
  const [userPosts, setUserPosts] = React.useState<FeedPost[]>([]);

  const [editing, setEditing] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editBio, setEditBio] = React.useState("");
  const [editLocation, setEditLocation] = React.useState("");
  const [pageLoading, setPageLoading] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user || !supabase || !targetId) { 
      if (!loading) setPageLoading(false); 
      return; 
    }
    async function load() {
      let profToDisplay = profile;
      if (targetId !== user!.id) {
        profToDisplay = await fetchProfileById(targetId as string, supabase!);
      }
      setDisplayProfile(profToDisplay);

      const [pd, st, hl, ach, an] = await Promise.all([
        fetchPlayerProfile(targetId as string, supabase!),
        fetchPlayerStats(targetId as string, supabase!),
        fetchPlayerHighlights(targetId as string, supabase!),
        fetchPlayerAchievements(targetId as string, supabase!),
        fetchAnalyticsSummary(targetId as string, supabase!),
      ]);
      setPlayerData(pd);
      setStats(st);
      setHighlights(hl);
      setAchievements(ach);
      setAnalytics(an);

      const { data: postsData } = await supabase!
        .from("feed_posts")
        .select("*, author:profiles(id, full_name, avatar_url, role, verified)")
        .eq("author_id", targetId)
        .order("created_at", { ascending: false });

      if (targetId !== user!.id) {
        const cStat = await fetchConnectionStatus(user!.id, targetId as string, supabase!);
        if (cStat) setConnectionStatus(cStat.status);
      }

      if (postsData && postsData.length > 0) {
        const mapped = postsData.map((d: any) => {
          const author = Array.isArray(d.author) ? d.author[0] : d.author;
          return {
            id: d.id, authorId: d.author_id,
            authorName: author?.full_name || "Unknown",
            authorAvatarUrl: author?.avatar_url || undefined,
            authorRole: author?.role || undefined,
            authorVerified: author?.verified || false,
            createdAt: d.created_at, content: d.content,
            imageUrl: d.media_url || undefined, mediaType: d.media_type || undefined,
            tags: d.tags || [], likesCount: d.likes_count || 0,
            commentsCount: d.comments_count || 0, sharesCount: d.shares_count || 0,
          } as FeedPost;
        });
        setUserPosts(mapped);
      } else {
        setUserPosts([]);
      }

      setPageLoading(false);
    }
    load();
  }, [user, supabase, targetId, profile, loading]);

  React.useEffect(() => {
    if (displayProfile && isOwnProfile) {
      setEditName(displayProfile.fullName);
      setEditBio(displayProfile.bio || "");
      setEditLocation(displayProfile.location || "");
    }
  }, [displayProfile, isOwnProfile]);

  async function handleSaveProfile() {
    const res = await updateProfile({ fullName: editName, bio: editBio, location: editLocation });
    if (res.error) { toast("error", res.error); } else { toast("success", "Profile updated"); setEditing(false); }
  }

  async function handleConnect() {
    if (!user || !supabase || !targetId) return;
    setConnectionStatus("pending");
    await sendConnectionRequest(user.id, targetId, supabase);
    toast("success", "Connection request sent!");
  }

  if (loading || pageLoading) {
    return (
      <AppShell>
        <div className="space-y-5 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!user || (!displayProfile && !isOwnProfile)) {
    return (
      <AppShell>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Sign in to view profiles"
          description="Create an account to build and view football profiles"
          action={<Link href="/login"><Button>Sign In</Button></Link>}
        />
      </AppShell>
    );
  }

  if (!displayProfile) {
    return (
      <AppShell>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Profile not found"
          description="We couldn't locate this user's profile."
        />
      </AppShell>
    );
  }

  const position = playerData?.position || displayProfile.role;
  const completion = playerData?.profileCompletion || Math.min(100,
    (displayProfile.fullName ? 20 : 0) + (displayProfile.bio ? 20 : 0) + (displayProfile.location ? 15 : 0) +
    (displayProfile.avatarUrl ? 15 : 0) + (playerData?.position ? 15 : 0) + (highlights.length > 0 ? 15 : 0)
  );
  const readiness = playerData?.matchReadiness || completion;

  const statCards = [
    { label: "Profile Views", value: analytics?.profileViews || 0, icon: Eye },
    { label: "Scout Interest", value: analytics?.scoutInterest || 0, icon: Users },
    { label: "Engagement", value: analytics?.postEngagement || 0, icon: BarChart3 },
    { label: "Applications", value: analytics?.trialApplications || 0, icon: Trophy },
  ];

  const inputClass = "h-10 w-full rounded-xl bg-scouthub-tint/60 px-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20";

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in p-4 mx-auto max-w-5xl">
        {/* Banner + Profile Header */}
        <Card className="overflow-hidden">
          <div
            className="relative h-32 w-full bg-gradient-to-r from-scouthub-green/20 via-scouthub-gold/10 to-scouthub-green/5 md:h-44"
            style={displayProfile.bannerUrl ? { backgroundImage: `url(${displayProfile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="relative px-5 pb-5">
            <div className="flex flex-wrap items-end gap-4 -mt-10 md:-mt-12">
              <Avatar src={displayProfile.avatarUrl} alt={displayProfile.fullName} size={80} className="ring-4 ring-white shadow-lift bg-white" />
              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight truncate">{displayProfile.fullName || "Unknown User"}</h1>
                  {displayProfile.verified && <CheckCircle2 className="h-5 w-5 text-scouthub-green" />}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-scouthub-muted">
                  <Badge className="capitalize">{position || displayProfile.role}</Badge>
                  {displayProfile.location && (
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{displayProfile.location}</span>
                  )}
                  {playerData?.currentClub && <span>· {playerData.currentClub}</span>}
                </div>
              </div>
              
              {isOwnProfile ? (
                 <div className="flex gap-2">
                   <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
                     <Edit3 className="h-4 w-4" /> {editing ? "Cancel" : "Edit"}
                   </Button>
                   <Link href="/verification"><Button variant="ghost" size="sm"><Shield className="h-4 w-4" /> Verify</Button></Link>
                 </div>
              ) : (
                 <div className="flex gap-2">
                   {connectionStatus === "accepted" ? (
                     <Link href={`/messages?userId=${targetId}`}>
                       <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Message</Button>
                     </Link>
                   ) : (
                     <Button size="sm" onClick={handleConnect} disabled={connectionStatus === "pending"}>
                       {connectionStatus === "pending" ? "Request Sent" : <><Plus className="h-4 w-4 mr-1" /> Connect</>}
                     </Button>
                   )}
                 </div>
              )}
            </div>
            {displayProfile.bio && !editing && <p className="mt-4 text-sm text-scouthub-muted max-w-2xl">{displayProfile.bio}</p>}
          </div>
        </Card>

        {/* Edit Mode */}
        {editing && isOwnProfile && (
          <Card className="p-5 animate-slide-up space-y-4">
            <h2 className="text-sm font-extrabold">Edit Profile</h2>
            <div>
              <label className="mb-1 block text-xs font-semibold text-scouthub-muted">Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-scouthub-muted">Location</label>
              <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-scouthub-muted">Bio</label>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                className="w-full rounded-xl bg-scouthub-tint/60 px-3 py-2 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20" />
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {statCards.map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.label} className="p-4 text-center">
                    <Icon className="mx-auto h-5 w-5 text-scouthub-green mb-2" />
                    <div className="text-lg font-extrabold">{s.value}</div>
                    <div className="text-xs text-scouthub-muted">{s.label}</div>
                  </Card>
                );
              })}
            </div>

            {/* Posts */}
            <Card className="p-5">
              <h2 className="text-sm font-extrabold mb-4">Posts</h2>
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="pb-4 border-b border-black/5 last:border-0 last:pb-0">
                      <FeedPostCard 
                        id={post.id}
                        author={{ name: post.authorName, meta: post.authorRole || "Member", verified: post.authorVerified || false, avatar: post.authorAvatarUrl || "" }}
                        time={new Date(post.createdAt).toLocaleDateString()}
                        title=""
                        body={post.content}
                        media={post.imageUrl}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Eye className="h-8 w-8" />}
                  title="No posts yet"
                  description={isOwnProfile ? "You haven't created any posts. Share an update to your feed!" : "This user hasn't created any posts."}
                  action={isOwnProfile ? <Link href="/compose"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Post</Button></Link> : undefined}
                  className="py-8"
                />
              )}
            </Card>

            {/* Highlights */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold">Highlights</h2>
                {isOwnProfile && <Link href="/compose?type=video"><Button variant="ghost" size="sm"><Plus className="h-4 w-4" /> Add</Button></Link>}
              </div>
              {highlights.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {highlights.map((h) => (
                    <div key={h.id} className="group relative aspect-video overflow-hidden rounded-2xl bg-scouthub-tint ring-1 ring-black/5">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${h.thumbnailUrl || h.mediaUrl})` }} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition grid place-items-center">
                        <Video className="h-8 w-8 text-white/90" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 truncate text-xs font-bold text-white">{h.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Video className="h-8 w-8" />}
                  title="No highlights yet"
                  description="No match footage uploaded."
                  className="py-8"
                />
              )}
            </Card>

            {/* Achievements */}
            <Card className="p-5">
              <h2 className="text-sm font-extrabold mb-4">Achievements</h2>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-scouthub-tint/50 p-3 ring-1 ring-black/5">
                      <Trophy className="h-5 w-5 text-scouthub-gold" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold truncate">{a.title}</div>
                        {a.description && <div className="text-xs text-scouthub-muted">{a.description}</div>}
                      </div>
                      {a.date && <div className="text-xs text-scouthub-muted">{new Date(a.date).toLocaleDateString()}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Trophy className="h-8 w-8" />}
                  title="No achievements yet"
                  description="Awards and milestones appear here."
                  className="py-8"
                />
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="hidden space-y-5 lg:block">
            <Card className="p-5">
              <h2 className="text-sm font-extrabold mb-3">Profile Strength</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-scouthub-muted">Completion</span>
                <span className="text-xs font-bold text-scouthub-gold">{completion}%</span>
              </div>
              <Progress value={completion} />
              <div className="mt-4 flex items-center justify-between mb-2">
                <span className="text-xs text-scouthub-muted">Match Readiness</span>
                <span className="text-xs font-bold text-scouthub-green">{readiness}%</span>
              </div>
              <Progress value={readiness} className="[&>div]:bg-scouthub-green" />
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-extrabold mb-3">Quick Info</h2>
              <div className="space-y-2 text-sm">
                {playerData?.ageGroup && <div className="flex justify-between"><span className="text-scouthub-muted">Age Group</span><span className="font-semibold">{playerData.ageGroup}</span></div>}
                {playerData?.preferredFoot && <div className="flex justify-between"><span className="text-scouthub-muted">Foot</span><span className="font-semibold capitalize">{playerData.preferredFoot}</span></div>}
                {playerData?.nationality && <div className="flex justify-between"><span className="text-scouthub-muted">Nationality</span><span className="font-semibold">{playerData.nationality}</span></div>}
                {playerData?.availability && <div className="flex justify-between"><span className="text-scouthub-muted">Availability</span><Badge className="capitalize">{playerData.availability}</Badge></div>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold">Verification</h2>
                {displayProfile.verified ? <Badge className="bg-scouthub-green/10 text-scouthub-green">Verified</Badge> : <Badge>Not Verified</Badge>}
              </div>
              {isOwnProfile && !displayProfile.verified && (
                <Link href="/verification"><Button variant="secondary" size="sm" className="w-full"><Shield className="h-4 w-4" /> Get Verified</Button></Link>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

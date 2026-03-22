import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  FeedPost, Profile, PlayerProfile, ScoutProfile, ClubProfile,
  Trial, TrialApplication, ScoutEvent, Comment, SavedItem,
  Notification, VerificationRequest, AnalyticsSummary,
  PlayerStat, PlayerHighlight, PlayerAchievement, ScoutNote,
  Opportunity, UserRole, ID,
} from "@/lib/supabase/types";

function sb(client?: SupabaseClient | null) {
  return client ?? getSupabaseClient();
}

// ============================================================
// PROFILES
// ============================================================

export async function fetchMyProfile(client?: SupabaseClient | null): Promise<Profile | null> {
  const s = sb(client);
  if (!s) return null;
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;
  return fetchProfileById(user.id, client);
}

export async function fetchProfileById(id: string, client?: SupabaseClient | null): Promise<Profile | null> {
  const s = sb(client);
  if (!s) return null;
  const { data, error } = await s.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function fetchProfiles(filters: {
  role?: UserRole; search?: string; limit?: number; offset?: number;
} = {}, client?: SupabaseClient | null): Promise<Profile[]> {
  const s = sb(client);
  if (!s) return [];
  let q = s.from("profiles").select("*");
  if (filters.role) q = q.eq("role", filters.role);
  if (filters.search) q = q.ilike("full_name", `%${filters.search}%`);
  q = q.order("created_at", { ascending: false });
  if (filters.limit) q = q.limit(filters.limit);
  if (filters.offset) q = q.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  const { data } = await q;
  return (data || []).map(mapProfile);
}

function mapProfile(d: any): Profile {
  return {
    id: d.id, fullName: d.full_name || "", role: d.role, avatarUrl: d.avatar_url || undefined,
    bannerUrl: d.banner_url || undefined, bio: d.bio || "", location: d.location || "",
    verified: d.verified || false, onboarded: d.onboarded || false,
    premiumTier: d.premium_tier || "free", createdAt: d.created_at,
  };
}

export async function completeOnboarding(userId: string, data: {
  role: UserRole; fullName: string; bio?: string; location?: string; avatarUrl?: string;
  playerData?: Partial<PlayerProfile>; scoutData?: Partial<ScoutProfile>; clubData?: Partial<ClubProfile>;
}, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };

  const { error: profileErr } = await s.from("profiles").update({
    full_name: data.fullName, role: data.role, bio: data.bio || "",
    location: data.location || "", avatar_url: data.avatarUrl || "",
    onboarded: true, updated_at: new Date().toISOString(),
  }).eq("id", userId);
  if (profileErr) return { error: profileErr.message };

  if (data.role === "player" && data.playerData) {
    const pd = data.playerData;
    await s.from("player_profiles").upsert({
      id: userId, position: pd.position || "", secondary_position: pd.secondaryPosition || "",
      preferred_foot: pd.preferredFoot || "right", age_group: pd.ageGroup || "",
      current_club: pd.currentClub || "", nationality: pd.nationality || "",
      height_cm: pd.heightCm || null, weight_kg: pd.weightKg || null,
      availability: pd.availability || "available",
    });
  } else if (data.role === "scout" && data.scoutData) {
    const sd = data.scoutData;
    await s.from("scout_profiles").upsert({
      id: userId, organization: sd.organization || "", region: sd.region || "",
      specialization: sd.specialization || "", years_experience: sd.yearsExperience || 0,
    });
  } else if (data.role === "club" && data.clubData) {
    const cd = data.clubData;
    await s.from("club_profiles").upsert({
      id: userId, club_name: cd.clubName || "", league: cd.league || "",
      website: cd.website || "", official_email: cd.officialEmail || "",
    });
  }

  return {};
}

// ============================================================
// PLAYER DATA
// ============================================================

export async function fetchPlayerProfile(id: string, client?: SupabaseClient | null): Promise<PlayerProfile | null> {
  const s = sb(client);
  if (!s) return null;
  const { data } = await s.from("player_profiles").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, position: data.position || "", secondaryPosition: data.secondary_position || "",
    preferredFoot: data.preferred_foot || "right", ageGroup: data.age_group || "",
    currentClub: data.current_club || "", heightCm: data.height_cm, weightKg: data.weight_kg,
    nationality: data.nationality || "", availability: data.availability || "available",
    profileCompletion: data.profile_completion || 0, matchReadiness: data.match_readiness || 0,
  };
}

export async function fetchPlayerStats(playerId: string, client?: SupabaseClient | null): Promise<PlayerStat[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("player_stats").select("*").eq("player_id", playerId).order("sort_order");
  return (data || []).map((d: any) => ({ id: d.id, playerId: d.player_id, label: d.label, value: d.value, category: d.category }));
}

export async function fetchPlayerHighlights(playerId: string, client?: SupabaseClient | null): Promise<PlayerHighlight[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("player_highlights").select("*").eq("player_id", playerId).order("created_at", { ascending: false });
  return (data || []).map((d: any) => ({
    id: d.id, playerId: d.player_id, title: d.title, mediaUrl: d.media_url,
    mediaType: d.media_type, thumbnailUrl: d.thumbnail_url, viewsCount: d.views_count, createdAt: d.created_at,
  }));
}

export async function fetchPlayerAchievements(playerId: string, client?: SupabaseClient | null): Promise<PlayerAchievement[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("player_achievements").select("*").eq("player_id", playerId).order("date", { ascending: false });
  return (data || []).map((d: any) => ({
    id: d.id, playerId: d.player_id, title: d.title, description: d.description || "",
    date: d.date, icon: d.icon || "trophy", createdAt: d.created_at,
  }));
}

export async function fetchPlayersForDiscovery(filters: {
  search?: string; position?: string; ageGroup?: string; location?: string;
  availability?: string; limit?: number; offset?: number;
} = {}, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return [];
  let q = s.from("profiles").select("*, player_profiles(*)").eq("role", "player");
  if (filters.search) q = q.ilike("full_name", `%${filters.search}%`);
  if (filters.location) q = q.ilike("location", `%${filters.location}%`);
  q = q.order("created_at", { ascending: false }).limit(filters.limit || 20);
  if (filters.offset) q = q.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  const { data } = await q;
  return (data || []).map((d: any) => ({
    profile: mapProfile(d),
    player: d.player_profiles?.[0] ? {
      position: d.player_profiles[0].position, ageGroup: d.player_profiles[0].age_group,
      currentClub: d.player_profiles[0].current_club, availability: d.player_profiles[0].availability,
      matchReadiness: d.player_profiles[0].match_readiness,
    } : null,
  }));
}

// ============================================================
// SCOUT DATA
// ============================================================

export async function fetchScoutProfile(id: string, client?: SupabaseClient | null): Promise<ScoutProfile | null> {
  const s = sb(client);
  if (!s) return null;
  const { data } = await s.from("scout_profiles").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, organization: data.organization || "", region: data.region || "",
    specialization: data.specialization || "", yearsExperience: data.years_experience || 0,
    playersScouted: data.players_scouted || 0,
  };
}

export async function upsertScoutNote(note: { scoutId: string; playerId: string; content: string; rating?: number }, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("scout_notes").upsert({
    scout_id: note.scoutId, player_id: note.playerId, content: note.content,
    rating: note.rating, updated_at: new Date().toISOString(),
  }, { onConflict: "scout_id,player_id" });
  return error ? { error: error.message } : {};
}

export async function fetchScoutNotes(scoutId: string, client?: SupabaseClient | null): Promise<ScoutNote[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("scout_notes").select("*").eq("scout_id", scoutId).order("updated_at", { ascending: false });
  return (data || []).map((d: any) => ({
    id: d.id, scoutId: d.scout_id, playerId: d.player_id, content: d.content,
    rating: d.rating, createdAt: d.created_at,
  }));
}

// ============================================================
// CLUB DATA
// ============================================================

export async function fetchClubProfile(id: string, client?: SupabaseClient | null): Promise<ClubProfile | null> {
  const s = sb(client);
  if (!s) return null;
  const { data } = await s.from("club_profiles").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, clubName: data.club_name || "", league: data.league || "",
    foundedYear: data.founded_year, website: data.website || "", officialEmail: data.official_email || "",
    squadSize: data.squad_size || 0, openTrialsCount: data.open_trials_count || 0,
  };
}

export async function fetchClubsForDiscovery(filters: {
  search?: string; league?: string; limit?: number; offset?: number;
} = {}, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return [];
  let q = s.from("profiles").select("*, club_profiles(*)").eq("role", "club");
  if (filters.search) q = q.ilike("full_name", `%${filters.search}%`);
  q = q.order("created_at", { ascending: false }).limit(filters.limit || 20);
  const { data } = await q;
  return (data || []).map((d: any) => ({
    profile: mapProfile(d),
    club: d.club_profiles?.[0] ? {
      clubName: d.club_profiles[0].club_name, league: d.club_profiles[0].league,
      openTrialsCount: d.club_profiles[0].open_trials_count,
    } : null,
  }));
}

// ============================================================
// FEED POSTS
// ============================================================

export async function fetchFeedPosts(limit = 10, client?: SupabaseClient | null): Promise<FeedPost[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s
    .from("feed_posts")
    .select("*, author:profiles(id, full_name, avatar_url, role, verified)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []).map(mapPost);
}

export async function fetchPostById(id: string, client?: SupabaseClient | null): Promise<FeedPost | null> {
  const s = sb(client);
  if (!s) return null;
  const { data } = await s
    .from("feed_posts")
    .select("*, author:profiles(id, full_name, avatar_url, role, verified)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return mapPost(data);
}

export async function createPost(post: { authorId: string; content: string; mediaUrl?: string; mediaType?: string; tags?: string[] }, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured", data: null };
  const { data, error } = await s.from("feed_posts").insert({
    author_id: post.authorId, content: post.content,
    media_url: post.mediaUrl || null, media_type: post.mediaType || null,
    tags: post.tags || [],
  }).select().single();
  return { data, error: error?.message };
}

function mapPost(d: any): FeedPost {
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
  };
}

// ============================================================
// LIKES
// ============================================================

export async function toggleLike(postId: string, userId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { liked: false };
  const { data: existing } = await s.from("post_likes").select("id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  if (existing) {
    await s.from("post_likes").delete().eq("id", existing.id);
    return { liked: false };
  } else {
    await s.from("post_likes").insert({ post_id: postId, user_id: userId });
    return { liked: true };
  }
}

export async function checkUserLiked(postId: string, userId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return false;
  const { data } = await s.from("post_likes").select("id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  return !!data;
}

// ============================================================
// COMMENTS
// ============================================================

export async function fetchComments(postId: string, client?: SupabaseClient | null): Promise<Comment[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s
    .from("post_comments")
    .select("*, author:profiles(id, full_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data || []).map((d: any) => {
    const author = Array.isArray(d.author) ? d.author[0] : d.author;
    return {
      id: d.id, postId: d.post_id, authorId: d.author_id,
      authorName: author?.full_name || "Unknown",
      authorAvatarUrl: author?.avatar_url || undefined,
      content: d.content, createdAt: d.created_at,
    };
  });
}

export async function addComment(postId: string, authorId: string, content: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("post_comments").insert({ post_id: postId, author_id: authorId, content });
  return error ? { error: error.message } : {};
}

// ============================================================
// TRIALS
// ============================================================

export async function fetchTrials(filters: {
  status?: string; search?: string; level?: string; limit?: number;
} = {}, client?: SupabaseClient | null): Promise<Trial[]> {
  const s = sb(client);
  if (!s) return [];
  let q = s.from("trials").select("*, club:profiles(id, full_name, avatar_url)");
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.level) q = q.eq("level", filters.level);
  if (filters.search) q = q.ilike("title", `%${filters.search}%`);
  q = q.order("created_at", { ascending: false }).limit(filters.limit || 20);
  const { data } = await q;
  return (data || []).map((d: any) => {
    const club = Array.isArray(d.club) ? d.club[0] : d.club;
    return {
      id: d.id, clubId: d.club_id, clubName: club?.full_name, clubAvatarUrl: club?.avatar_url,
      title: d.title, description: d.description || "", location: d.location || "",
      positionNeeded: d.position_needed || "", ageGroup: d.age_group || "",
      level: d.level, trialDate: d.trial_date, deadline: d.deadline,
      status: d.status, maxApplicants: d.max_applicants, applicantCount: d.applicant_count,
      inviteOnly: d.invite_only, createdAt: d.created_at,
    };
  });
}

export async function createTrial(trial: {
  clubId: string; title: string; description: string; location: string;
  positionNeeded: string; ageGroup: string; level: string; trialDate?: string;
  deadline?: string; inviteOnly?: boolean;
}, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("trials").insert({
    club_id: trial.clubId, title: trial.title, description: trial.description,
    location: trial.location, position_needed: trial.positionNeeded,
    age_group: trial.ageGroup, level: trial.level,
    trial_date: trial.trialDate || null, deadline: trial.deadline || null,
    invite_only: trial.inviteOnly || false,
  });
  return error ? { error: error.message } : {};
}

export async function applyToTrial(app: {
  trialId: string; playerId: string; position: string; message: string; videoUrl?: string;
}, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("trial_applications").insert({
    trial_id: app.trialId, player_id: app.playerId, position: app.position,
    message: app.message, video_url: app.videoUrl || "",
  });
  return error ? { error: error.message } : {};
}

export async function fetchMyApplications(playerId: string, client?: SupabaseClient | null): Promise<TrialApplication[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s
    .from("trial_applications")
    .select("*, trial:trials(id, title, club:profiles(full_name))")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  return (data || []).map((d: any) => {
    const trial = Array.isArray(d.trial) ? d.trial[0] : d.trial;
    const club = trial?.club ? (Array.isArray(trial.club) ? trial.club[0] : trial.club) : null;
    return {
      id: d.id, trialId: d.trial_id, playerId: d.player_id, status: d.status,
      position: d.position, message: d.message, videoUrl: d.video_url,
      trialTitle: trial?.title, clubName: club?.full_name,
      createdAt: d.created_at,
    };
  });
}

// ============================================================
// EVENTS
// ============================================================

export async function fetchEvents(filters: {
  status?: string; type?: string; search?: string; limit?: number;
} = {}, client?: SupabaseClient | null): Promise<ScoutEvent[]> {
  const s = sb(client);
  if (!s) return [];
  let q = s.from("events").select("*, organizer:profiles(id, full_name, avatar_url)");
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.type) q = q.eq("event_type", filters.type);
  if (filters.search) q = q.ilike("title", `%${filters.search}%`);
  q = q.order("event_date", { ascending: true }).limit(filters.limit || 20);
  const { data } = await q;
  return (data || []).map((d: any) => {
    const org = Array.isArray(d.organizer) ? d.organizer[0] : d.organizer;
    return {
      id: d.id, organizerId: d.organizer_id, organizerName: org?.full_name,
      title: d.title, description: d.description || "", location: d.location || "",
      eventDate: d.event_date, endDate: d.end_date, eventType: d.event_type,
      imageUrl: d.image_url, maxAttendees: d.max_attendees,
      attendeeCount: d.attendee_count, status: d.status, createdAt: d.created_at,
    };
  });
}

export async function createEvent(event: {
  organizerId: string; title: string; description: string; location: string;
  eventDate?: string; endDate?: string; eventType: string; imageUrl?: string; maxAttendees?: number;
}, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("events").insert({
    organizer_id: event.organizerId, title: event.title, description: event.description,
    location: event.location, event_date: event.eventDate || null, end_date: event.endDate || null,
    event_type: event.eventType, image_url: event.imageUrl || null, max_attendees: event.maxAttendees || null,
  });
  return error ? { error: error.message } : {};
}

export async function rsvpEvent(eventId: string, userId: string, status: "going" | "interested" | "not_going", client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  if (status === "not_going") {
    await s.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
    return {};
  }
  const { error } = await s.from("event_rsvps").upsert(
    { event_id: eventId, user_id: userId, status },
    { onConflict: "event_id,user_id" },
  );
  return error ? { error: error.message } : {};
}

// ============================================================
// SAVED ITEMS
// ============================================================

export async function toggleSave(userId: string, itemType: string, itemId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { saved: false };
  const { data: existing } = await s
    .from("saved_items").select("id")
    .eq("user_id", userId).eq("item_type", itemType).eq("item_id", itemId)
    .maybeSingle();
  if (existing) {
    await s.from("saved_items").delete().eq("id", existing.id);
    return { saved: false };
  } else {
    await s.from("saved_items").insert({ user_id: userId, item_type: itemType, item_id: itemId });
    return { saved: true };
  }
}

export async function fetchSavedItems(userId: string, itemType?: string, client?: SupabaseClient | null): Promise<SavedItem[]> {
  const s = sb(client);
  if (!s) return [];
  let q = s.from("saved_items").select("*").eq("user_id", userId);
  if (itemType) q = q.eq("item_type", itemType);
  q = q.order("created_at", { ascending: false });
  const { data } = await q;
  return (data || []).map((d: any) => ({
    id: d.id, userId: d.user_id, itemType: d.item_type, itemId: d.item_id, createdAt: d.created_at,
  }));
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function fetchNotifications(userId: string, limit = 20, client?: SupabaseClient | null): Promise<Notification[]> {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s
    .from("notifications")
    .select("*, actor:profiles(id, full_name, avatar_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []).map((d: any) => {
    const actor = d.actor ? (Array.isArray(d.actor) ? d.actor[0] : d.actor) : null;
    return {
      id: d.id, userId: d.user_id, type: d.type, title: d.title,
      body: d.body || "", link: d.link || "", read: d.read,
      actorId: d.actor_id, actorName: actor?.full_name,
      actorAvatarUrl: actor?.avatar_url, createdAt: d.created_at,
    };
  });
}

export async function markNotificationRead(id: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return;
  await s.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead(userId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return;
  await s.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

// ============================================================
// VERIFICATION
// ============================================================

export async function fetchVerificationStatus(userId: string, client?: SupabaseClient | null): Promise<VerificationRequest | null> {
  const s = sb(client);
  if (!s) return null;
  const { data } = await s.from("verification_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, userId: data.user_id, documentUrl: data.document_url,
    documentType: data.document_type, notes: data.notes || "", status: data.status,
    reviewerNotes: data.reviewer_notes || "", createdAt: data.created_at,
  };
}

export async function submitVerification(req: { userId: string; documentUrl?: string; documentType?: string; notes?: string }, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("verification_requests").insert({
    user_id: req.userId, document_url: req.documentUrl || null,
    document_type: req.documentType || "id", notes: req.notes || "",
  });
  return error ? { error: error.message } : {};
}

// ============================================================
// ANALYTICS
// ============================================================

export async function trackProfileView(profileId: string, viewerId: string | null, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return;
  await s.from("profile_views").insert({ profile_id: profileId, viewer_id: viewerId });
}

export async function fetchAnalyticsSummary(userId: string, client?: SupabaseClient | null): Promise<AnalyticsSummary> {
  const s = sb(client);
  const defaults: AnalyticsSummary = {
    profileViews: 0, postEngagement: 0, scoutInterest: 0,
    profileCompletion: 0, trialApplications: 0, matchReadiness: 0,
  };
  if (!s) return defaults;

  const [views, posts, apps] = await Promise.all([
    s.from("profile_views").select("id", { count: "exact" }).eq("profile_id", userId),
    s.from("feed_posts").select("likes_count, comments_count").eq("author_id", userId),
    s.from("trial_applications").select("id", { count: "exact" }).eq("player_id", userId),
  ]);

  const postData = posts.data || [];
  const engagement = postData.reduce((sum: number, p: any) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);

  return {
    profileViews: views.count || 0,
    postEngagement: engagement,
    scoutInterest: Math.floor((views.count || 0) * 0.3),
    profileCompletion: 0, // calculated client-side
    trialApplications: apps.count || 0,
    matchReadiness: 0, // from player_profiles
  };
}

// ============================================================
// FILE UPLOAD
// ============================================================

export async function uploadFile(bucket: string, path: string, file: File, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { url: null, error: "Not configured" };
  const { data, error } = await s.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return { url: null, error: error.message };
  const { data: urlData } = s.storage.from(bucket).getPublicUrl(data.path);
  return { url: urlData.publicUrl, error: null };
}

// ============================================================
// OPPORTUNITIES (backward compat)
// ============================================================

export async function fetchOpportunities(limit = 5, client?: SupabaseClient | null): Promise<Opportunity[]> {
  const trials = await fetchTrials({ status: "open", limit }, client);
  return trials.map((t) => ({
    id: t.id, title: t.title, club: t.clubName || "",
    location: t.location, level: t.level, closingDate: t.deadline || "",
  }));
}

// ============================================================
// CONNECTIONS
// ============================================================

export async function sendConnectionRequest(senderId: string, receiverId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("connections").insert({
    sender_id: senderId, receiver_id: receiverId, status: "pending"
  });
  return error ? { error: error.message } : {};
}

export async function fetchPendingRequests(userId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("connections")
    .select("*, sender:profiles!connections_sender_id_fkey(id, full_name, avatar_url, role)")
    .eq("receiver_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function updateConnectionStatus(connectionId: string, status: "accepted" | "rejected", client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error } = await s.from("connections").update({ status, updated_at: new Date().toISOString() }).eq("id", connectionId);
  return error ? { error: error.message } : {};
}

export async function fetchConnectionStatus(userA: string, userB: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return null;
  const { data } = await s.from("connections")
    .select("*")
    .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
    .maybeSingle();
  return data;
}

export async function fetchConnectedUsers(userId: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("connections")
    .select(`
      id, status,
      sender:profiles!connections_sender_id_fkey(id, full_name, avatar_url, role),
      receiver:profiles!connections_receiver_id_fkey(id, full_name, avatar_url, role)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted");
    
  if (!data) return [];
  // flatten it so it just returns a list of profiles that aren't the user
  return data.map((c: any) => {
    const sender = Array.isArray(c.sender) ? c.sender[0] : c.sender;
    const receiver = Array.isArray(c.receiver) ? c.receiver[0] : c.receiver;
    return sender?.id === userId ? receiver : sender;
  }).filter((p: any) => p && p.id);
}

// ============================================================
// MESSAGES
// ============================================================

export async function sendMessage(senderId: string, receiverId: string, content: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return { error: "Not configured" };
  const { error, data } = await s.from("messages").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    content: content
  }).select().single();
  return { error: error?.message, data };
}

export async function fetchMessages(userA: string, userB: string, client?: SupabaseClient | null) {
  const s = sb(client);
  if (!s) return [];
  const { data } = await s.from("messages")
    .select("*")
    .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
    .order("created_at", { ascending: true });
  return data || [];
}

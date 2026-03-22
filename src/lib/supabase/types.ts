export type ID = string;

export type UserRole = "player" | "scout" | "club" | "admin";
export type PremiumTier = "free" | "pro" | "elite";

// ---- Profiles ----
export type Profile = {
  id: ID;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  location?: string;
  verified: boolean;
  onboarded: boolean;
  premiumTier: PremiumTier;
  createdAt: string;
};

export type PlayerProfile = {
  id: ID;
  position: string;
  secondaryPosition: string;
  preferredFoot: "left" | "right" | "both";
  ageGroup: string;
  currentClub: string;
  heightCm?: number;
  weightKg?: number;
  nationality: string;
  availability: "available" | "limited" | "unavailable";
  profileCompletion: number;
  matchReadiness: number;
};

export type ScoutProfile = {
  id: ID;
  organization: string;
  region: string;
  specialization: string;
  yearsExperience: number;
  playersScouted: number;
};

export type ClubProfile = {
  id: ID;
  clubName: string;
  league: string;
  foundedYear?: number;
  website: string;
  officialEmail: string;
  squadSize: number;
  openTrialsCount: number;
};

// ---- Feed ----
export type FeedPost = {
  id: ID;
  authorId: ID;
  authorName: string;
  authorAvatarUrl?: string;
  authorRole?: UserRole;
  authorVerified?: boolean;
  createdAt: string;
  content: string;
  imageUrl?: string;
  mediaType?: "image" | "video";
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  liked?: boolean;
  saved?: boolean;
};

export type Comment = {
  id: ID;
  postId: ID;
  authorId: ID;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
};

// ---- Trials ----
export type Trial = {
  id: ID;
  clubId: ID;
  clubName?: string;
  clubAvatarUrl?: string;
  title: string;
  description: string;
  location: string;
  positionNeeded: string;
  ageGroup: string;
  level: "academy" | "semi-pro" | "pro";
  trialDate?: string;
  deadline?: string;
  status: "open" | "closed" | "completed";
  maxApplicants: number;
  applicantCount: number;
  inviteOnly: boolean;
  createdAt: string;
};

export type TrialApplication = {
  id: ID;
  trialId: ID;
  playerId: ID;
  status: "submitted" | "under_review" | "shortlisted" | "invited" | "rejected";
  position: string;
  message: string;
  videoUrl: string;
  trialTitle?: string;
  clubName?: string;
  createdAt: string;
};

// ---- Events ----
export type ScoutEvent = {
  id: ID;
  organizerId: ID;
  organizerName?: string;
  title: string;
  description: string;
  location: string;
  eventDate?: string;
  endDate?: string;
  eventType: "showcase" | "camp" | "combine" | "open_session" | "tournament";
  imageUrl?: string;
  maxAttendees?: number;
  attendeeCount: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  createdAt: string;
  rsvpStatus?: "going" | "interested" | "not_going" | null;
};

// ---- Saved ----
export type SavedItem = {
  id: ID;
  userId: ID;
  itemType: "post" | "player" | "club" | "trial" | "event";
  itemId: ID;
  createdAt: string;
  // Populated client-side
  title?: string;
  subtitle?: string;
  imageUrl?: string;
};

// ---- Notifications ----
export type Notification = {
  id: ID;
  userId: ID;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  actorId?: ID;
  actorName?: string;
  actorAvatarUrl?: string;
  createdAt: string;
};

// ---- Verification ----
export type VerificationRequest = {
  id: ID;
  userId: ID;
  documentUrl?: string;
  documentType: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  reviewerNotes: string;
  createdAt: string;
};

// ---- Analytics ----
export type AnalyticsSummary = {
  profileViews: number;
  postEngagement: number;
  scoutInterest: number;
  profileCompletion: number;
  trialApplications: number;
  matchReadiness: number;
};

// ---- Opportunity (kept for backward compat) ----
export type Opportunity = {
  id: ID;
  title: string;
  club: string;
  location: string;
  level: "academy" | "semi-pro" | "pro";
  closingDate: string;
};

// ---- Player stat for display ----
export type PlayerStat = {
  id: ID;
  playerId: ID;
  label: string;
  value: string;
  category: string;
};

export type PlayerHighlight = {
  id: ID;
  playerId: ID;
  title: string;
  mediaUrl: string;
  mediaType: "video" | "image";
  thumbnailUrl?: string;
  viewsCount: number;
  createdAt: string;
};

export type PlayerAchievement = {
  id: ID;
  playerId: ID;
  title: string;
  description: string;
  date?: string;
  icon: string;
  createdAt: string;
};

export type ScoutNote = {
  id: ID;
  scoutId: ID;
  playerId: ID;
  content: string;
  rating?: number;
  createdAt: string;
};

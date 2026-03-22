-- ============================================================
-- ScoutHub — Complete Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'player' check (role in ('player','scout','club','admin')),
  avatar_url text,
  banner_url text,
  bio text default '',
  location text default '',
  verified boolean not null default false,
  onboarded boolean not null default false,
  premium_tier text not null default 'free' check (premium_tier in ('free','pro','elite')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'player'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PLAYER PROFILES
-- ============================================================
create table if not exists public.player_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  position text default '',
  secondary_position text default '',
  preferred_foot text default 'right' check (preferred_foot in ('left','right','both')),
  age_group text default '',
  current_club text default '',
  height_cm integer,
  weight_kg integer,
  nationality text default '',
  availability text default 'available' check (availability in ('available','limited','unavailable')),
  profile_completion integer not null default 0,
  match_readiness integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PLAYER STATS
-- ============================================================
create table if not exists public.player_stats (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  value text not null,
  category text default 'general',
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PLAYER HIGHLIGHTS
-- ============================================================
create table if not exists public.player_highlights (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  media_url text not null,
  media_type text not null default 'video' check (media_type in ('video','image')),
  thumbnail_url text,
  views_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PLAYER ACHIEVEMENTS
-- ============================================================
create table if not exists public.player_achievements (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  date date,
  icon text default 'trophy',
  created_at timestamptz not null default now()
);

-- ============================================================
-- SCOUT PROFILES
-- ============================================================
create table if not exists public.scout_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  organization text default '',
  region text default '',
  specialization text default '',
  years_experience integer default 0,
  players_scouted integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SCOUT NOTES (private notes on players)
-- ============================================================
create table if not exists public.scout_notes (
  id uuid primary key default uuid_generate_v4(),
  scout_id uuid not null references public.profiles(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(scout_id, player_id)
);

-- ============================================================
-- CLUB PROFILES
-- ============================================================
create table if not exists public.club_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  club_name text not null default '',
  league text default '',
  founded_year integer,
  website text default '',
  official_email text default '',
  squad_size integer default 0,
  open_trials_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FEED POSTS
-- ============================================================
create table if not exists public.feed_posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  media_url text,
  media_type text check (media_type in ('image','video',null)),
  tags text[] default '{}',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POST LIKES
-- ============================================================
create table if not exists public.post_likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- ============================================================
-- POST COMMENTS
-- ============================================================
create table if not exists public.post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRIALS
-- ============================================================
create table if not exists public.trials (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  location text default '',
  position_needed text default '',
  age_group text default '',
  level text default 'academy' check (level in ('academy','semi-pro','pro')),
  trial_date date,
  deadline date,
  status text not null default 'open' check (status in ('open','closed','completed')),
  max_applicants integer default 50,
  applicant_count integer not null default 0,
  invite_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRIAL APPLICATIONS
-- ============================================================
create table if not exists public.trial_applications (
  id uuid primary key default uuid_generate_v4(),
  trial_id uuid not null references public.trials(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','under_review','shortlisted','invited','rejected')),
  position text default '',
  message text default '',
  video_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(trial_id, player_id)
);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  location text default '',
  event_date timestamptz,
  end_date timestamptz,
  event_type text default 'showcase' check (event_type in ('showcase','camp','combine','open_session','tournament')),
  image_url text,
  max_attendees integer,
  attendee_count integer not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming','live','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EVENT RSVPS
-- ============================================================
create table if not exists public.event_rsvps (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going','interested','not_going')),
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- SAVED ITEMS
-- ============================================================
create table if not exists public.saved_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('post','player','club','trial','event')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_type, item_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text default '',
  link text default '',
  read boolean not null default false,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- VERIFICATION REQUESTS
-- ============================================================
create table if not exists public.verification_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_url text,
  document_type text default 'id',
  notes text default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILE VIEWS (analytics)
-- ============================================================
create table if not exists public.profile_views (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_feed_posts_created on public.feed_posts(created_at desc);
create index if not exists idx_feed_posts_author on public.feed_posts(author_id);
create index if not exists idx_post_likes_post on public.post_likes(post_id);
create index if not exists idx_post_comments_post on public.post_comments(post_id);
create index if not exists idx_trials_status on public.trials(status);
create index if not exists idx_trials_club on public.trials(club_id);
create index if not exists idx_trial_apps_trial on public.trial_applications(trial_id);
create index if not exists idx_trial_apps_player on public.trial_applications(player_id);
create index if not exists idx_events_date on public.events(event_date);
create index if not exists idx_saved_items_user on public.saved_items(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read);
create index if not exists idx_profile_views_profile on public.profile_views(profile_id);
create index if not exists idx_player_profiles_position on public.player_profiles(position);
create index if not exists idx_player_profiles_availability on public.player_profiles(availability);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: anyone can read, owners can update
alter table public.profiles enable row level security;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Player profiles
alter table public.player_profiles enable row level security;
drop policy if exists "Player profiles viewable by all" on public.player_profiles;
create policy "Player profiles viewable by all" on public.player_profiles for select using (true);
drop policy if exists "Players can manage own" on public.player_profiles;
create policy "Players can manage own" on public.player_profiles for all using (auth.uid() = id);

-- Player stats
alter table public.player_stats enable row level security;
drop policy if exists "Player stats viewable by all" on public.player_stats;
create policy "Player stats viewable by all" on public.player_stats for select using (true);
drop policy if exists "Players manage own stats" on public.player_stats;
create policy "Players manage own stats" on public.player_stats for all using (auth.uid() = player_id);

-- Player highlights
alter table public.player_highlights enable row level security;
drop policy if exists "Highlights viewable by all" on public.player_highlights;
create policy "Highlights viewable by all" on public.player_highlights for select using (true);
drop policy if exists "Players manage own highlights" on public.player_highlights;
create policy "Players manage own highlights" on public.player_highlights for all using (auth.uid() = player_id);

-- Player achievements
alter table public.player_achievements enable row level security;
drop policy if exists "Achievements viewable by all" on public.player_achievements;
create policy "Achievements viewable by all" on public.player_achievements for select using (true);
drop policy if exists "Players manage own achievements" on public.player_achievements;
create policy "Players manage own achievements" on public.player_achievements for all using (auth.uid() = player_id);

-- Scout profiles
alter table public.scout_profiles enable row level security;
drop policy if exists "Scout profiles viewable by all" on public.scout_profiles;
create policy "Scout profiles viewable by all" on public.scout_profiles for select using (true);
drop policy if exists "Scouts can manage own" on public.scout_profiles;
create policy "Scouts can manage own" on public.scout_profiles for all using (auth.uid() = id);

-- Scout notes: only the scout who wrote them
alter table public.scout_notes enable row level security;
drop policy if exists "Scouts manage own notes" on public.scout_notes;
create policy "Scouts manage own notes" on public.scout_notes for all using (auth.uid() = scout_id);

-- Club profiles
alter table public.club_profiles enable row level security;
drop policy if exists "Club profiles viewable by all" on public.club_profiles;
create policy "Club profiles viewable by all" on public.club_profiles for select using (true);
drop policy if exists "Clubs can manage own" on public.club_profiles;
create policy "Clubs can manage own" on public.club_profiles for all using (auth.uid() = id);

-- Feed posts
alter table public.feed_posts enable row level security;
drop policy if exists "Posts viewable by all" on public.feed_posts;
create policy "Posts viewable by all" on public.feed_posts for select using (true);
drop policy if exists "Users can insert own posts" on public.feed_posts;
create policy "Users can insert own posts" on public.feed_posts for insert with check (auth.uid() = author_id);
drop policy if exists "Users can update own posts" on public.feed_posts;
create policy "Users can update own posts" on public.feed_posts for update using (auth.uid() = author_id);
drop policy if exists "Users can delete own posts" on public.feed_posts;
create policy "Users can delete own posts" on public.feed_posts for delete using (auth.uid() = author_id);

-- Post likes
alter table public.post_likes enable row level security;
drop policy if exists "Likes viewable by all" on public.post_likes;
create policy "Likes viewable by all" on public.post_likes for select using (true);
drop policy if exists "Users manage own likes" on public.post_likes;
create policy "Users manage own likes" on public.post_likes for all using (auth.uid() = user_id);

-- Post comments
alter table public.post_comments enable row level security;
drop policy if exists "Comments viewable by all" on public.post_comments;
create policy "Comments viewable by all" on public.post_comments for select using (true);
drop policy if exists "Users can insert comments" on public.post_comments;
create policy "Users can insert comments" on public.post_comments for insert with check (auth.uid() = author_id);
drop policy if exists "Users can update own comments" on public.post_comments;
create policy "Users can update own comments" on public.post_comments for update using (auth.uid() = author_id);
drop policy if exists "Users can delete own comments" on public.post_comments;
create policy "Users can delete own comments" on public.post_comments for delete using (auth.uid() = author_id);

-- Trials
alter table public.trials enable row level security;
drop policy if exists "Trials viewable by all" on public.trials;
create policy "Trials viewable by all" on public.trials for select using (true);
drop policy if exists "Clubs manage own trials" on public.trials;
create policy "Clubs manage own trials" on public.trials for all using (auth.uid() = club_id);

-- Trial applications
alter table public.trial_applications enable row level security;
drop policy if exists "Players see own applications" on public.trial_applications;
create policy "Players see own applications" on public.trial_applications for select using (auth.uid() = player_id);
drop policy if exists "Clubs see applications for their trials" on public.trial_applications;
create policy "Clubs see applications for their trials" on public.trial_applications for select using (
  exists (select 1 from public.trials where trials.id = trial_applications.trial_id and trials.club_id = auth.uid())
);
drop policy if exists "Players can apply" on public.trial_applications;
create policy "Players can apply" on public.trial_applications for insert with check (auth.uid() = player_id);
drop policy if exists "Players can update own apps" on public.trial_applications;
create policy "Players can update own apps" on public.trial_applications for update using (auth.uid() = player_id);

-- Events
alter table public.events enable row level security;
drop policy if exists "Events viewable by all" on public.events;
create policy "Events viewable by all" on public.events for select using (true);
drop policy if exists "Organizers manage own events" on public.events;
create policy "Organizers manage own events" on public.events for all using (auth.uid() = organizer_id);

-- Event RSVPs
alter table public.event_rsvps enable row level security;
drop policy if exists "RSVPs viewable by all" on public.event_rsvps;
create policy "RSVPs viewable by all" on public.event_rsvps for select using (true);
drop policy if exists "Users manage own RSVPs" on public.event_rsvps;
create policy "Users manage own RSVPs" on public.event_rsvps for all using (auth.uid() = user_id);

-- Saved items
alter table public.saved_items enable row level security;
drop policy if exists "Users see own saved" on public.saved_items;
create policy "Users see own saved" on public.saved_items for select using (auth.uid() = user_id);
drop policy if exists "Users manage own saved" on public.saved_items;
create policy "Users manage own saved" on public.saved_items for all using (auth.uid() = user_id);

-- Notifications
alter table public.notifications enable row level security;
drop policy if exists "Users see own notifications" on public.notifications;
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "System can insert notifications" on public.notifications;
create policy "System can insert notifications" on public.notifications for insert with check (true);

-- Verification requests
alter table public.verification_requests enable row level security;
drop policy if exists "Users see own verification" on public.verification_requests;
create policy "Users see own verification" on public.verification_requests for select using (auth.uid() = user_id);
drop policy if exists "Users can submit verification" on public.verification_requests;
create policy "Users can submit verification" on public.verification_requests for insert with check (auth.uid() = user_id);

-- Profile views
alter table public.profile_views enable row level security;
drop policy if exists "Profile views by all" on public.profile_views;
create policy "Profile views by all" on public.profile_views for select using (true);
drop policy if exists "Anyone can log view" on public.profile_views;
create policy "Anyone can log view" on public.profile_views for insert with check (true);

-- ============================================================
-- TRIGGER: update likes_count on post_likes insert/delete
-- ============================================================
create or replace function public.update_post_likes_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.feed_posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.feed_posts set likes_count = greatest(0, likes_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_post_like_change on public.post_likes;
create trigger on_post_like_change
  after insert or delete on public.post_likes
  for each row execute function public.update_post_likes_count();

-- ============================================================
-- TRIGGER: update comments_count on post_comments insert/delete
-- ============================================================
create or replace function public.update_post_comments_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.feed_posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.feed_posts set comments_count = greatest(0, comments_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_post_comment_change on public.post_comments;
create trigger on_post_comment_change
  after insert or delete on public.post_comments
  for each row execute function public.update_post_comments_count();

-- ============================================================
-- TRIGGER: update applicant_count on trial_applications
-- ============================================================
create or replace function public.update_trial_applicant_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.trials set applicant_count = applicant_count + 1 where id = NEW.trial_id;
  elsif TG_OP = 'DELETE' then
    update public.trials set applicant_count = greatest(0, applicant_count - 1) where id = OLD.trial_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_trial_app_change on public.trial_applications;
create trigger on_trial_app_change
  after insert or delete on public.trial_applications
  for each row execute function public.update_trial_applicant_count();

-- ============================================================
-- TRIGGER: update event attendee_count
-- ============================================================
create or replace function public.update_event_attendee_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update public.events set attendee_count = attendee_count + 1 where id = NEW.event_id;
  elsif TG_OP = 'DELETE' then
    update public.events set attendee_count = greatest(0, attendee_count - 1) where id = OLD.event_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_event_rsvp_change on public.event_rsvps;
create trigger on_event_rsvp_change
  after insert or delete on public.event_rsvps
  for each row execute function public.update_event_attendee_count();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard → Storage)
-- ============================================================
-- Create buckets: avatars, media, documents
-- Set avatars and media as public, documents as private

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.feed_posts;
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- CONNECTIONS (mutual requests)
-- ============================================================
create table if not exists public.connections (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(sender_id, receiver_id)
);

create index if not exists idx_connections_users on public.connections(sender_id, receiver_id);

alter table public.connections enable row level security;
drop policy if exists "Users see connections involving them" on public.connections;
create policy "Users see connections involving them" on public.connections for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "Users can insert as sender" on public.connections;
create policy "Users can insert as sender" on public.connections for insert with check (auth.uid() = sender_id);
drop policy if exists "Users can update their connections" on public.connections;
create policy "Users can update their connections" on public.connections for update using (auth.uid() = receiver_id or auth.uid() = sender_id);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_users on public.messages(sender_id, receiver_id);

alter table public.messages enable row level security;
drop policy if exists "Users see messages involving them" on public.messages;
create policy "Users see messages involving them" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "Users can insert as sender" on public.messages;
create policy "Users can insert as sender" on public.messages for insert with check (auth.uid() = sender_id);
drop policy if exists "Receiver can update message status" on public.messages;
create policy "Receiver can update message status" on public.messages for update using (auth.uid() = receiver_id);

alter publication supabase_realtime add table public.messages;

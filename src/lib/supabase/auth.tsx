"use client";

import * as React from "react";
import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/supabase/types";

type AuthState = {
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
};

type AuthActions = {
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
    role?: string,
    sport?: string,
    position?: string
  ) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "fullName" | "bio" | "location" | "avatarUrl" | "bannerUrl" | "role">>) => Promise<{ error?: string }>;
};

const AuthContext = React.createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabaseRef = React.useRef(getSupabaseClient());
  const [state, setState] = React.useState<AuthState>(() => ({
    supabase: supabaseRef.current,
    session: null,
    user: null,
    profile: null,
    loading: Boolean(supabaseRef.current),
    configured: Boolean(supabaseRef.current),
  }));

  const fetchProfile = React.useCallback(async (userId: string) => {
    const sb = supabaseRef.current;
    if (!sb) return null;

    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;

    const profile: Profile = {
      id: data.id,
      fullName: data.full_name || "",
      role: data.role as UserRole,
      avatarUrl: data.avatar_url || undefined,
      bannerUrl: data.banner_url || undefined,
      bio: data.bio || "",
      location: data.location || "",
      verified: data.verified || false,
      onboarded: data.onboarded || false,
      premiumTier: data.premium_tier || "free",
      createdAt: data.created_at,
    };

    return profile;
  }, []);

  React.useEffect(() => {
    const sb = supabaseRef.current;
    if (!sb) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    let ignore = false;
    let unsubscribe: (() => void) | null = null;

    async function init() {
      const { data } = await sb!.auth.getSession();
      const session = data.session ?? null;
      const user = session?.user ?? null;

      let profile: Profile | null = null;
      if (user) {
        profile = await fetchProfile(user.id);
      }

      if (!ignore) {
        setState((s) => ({
          ...s,
          session,
          user,
          profile,
          loading: false,
        }));
      }

      const { data: listener } = sb!.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          if (ignore) return;
          const user = session?.user ?? null;
          let profile: Profile | null = null;
          if (user) {
            profile = await fetchProfile(user.id);
          }
          setState((s) => ({
            ...s,
            session,
            user,
            profile,
          }));
        },
      );

      unsubscribe = () => listener.subscription.unsubscribe();
    }

    void init();

    return () => {
      ignore = true;
      unsubscribe?.();
    };
  }, [fetchProfile]);

  const value = React.useMemo<AuthState & AuthActions>(() => {
    const sb = supabaseRef.current;

    return {
      ...state,

      signInWithEmail: async (email: string, password: string) => {
        if (!sb) return { error: "Supabase not configured" };
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return {};
      },

      signUpWithEmail: async (email: string, password: string, fullName: string, role: string = "player", sport: string = "", position: string = "") => {
        if (!sb) return { error: "Supabase not configured" };
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName,
              role: role,
              sport: sport,
              position: position
            },
          },
        });
        if (error) return { error: error.message };
        return {};
      },

      signInWithGoogle: async () => {
        if (!sb) return;
        await sb.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/` },
        });
      },

      signOut: async () => {
        if (!sb) return;
        await sb.auth.signOut();
        setState((s) => ({ ...s, session: null, user: null, profile: null }));
      },

      resetPassword: async (email: string) => {
        if (!sb) return { error: "Supabase not configured" };
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) return { error: error.message };
        return {};
      },

      refreshProfile: async () => {
        if (!sb || !state.user) return;
        const profile = await fetchProfile(state.user.id);
        setState((s) => ({ ...s, profile }));
      },

      updateProfile: async (updates) => {
        if (!sb || !state.user) return { error: "Not authenticated" };
        const dbUpdates: Record<string, unknown> = {};
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
        if (updates.role !== undefined) dbUpdates.role = updates.role;

        dbUpdates.updated_at = new Date().toISOString();

        const { error } = await sb.from("profiles").update(dbUpdates).eq("id", state.user.id);
        if (error) return { error: error.message };

        const profile = await fetchProfile(state.user.id);
        setState((s) => ({ ...s, profile }));
        return {};
      },
    };
  }, [state, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

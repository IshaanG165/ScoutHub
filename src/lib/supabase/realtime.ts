"use client";

import * as React from "react";
import { getSupabaseClient } from "./client";
import type { FeedPost, ID } from "./types";

type RealtimePost = FeedPost;

interface UseRealtimeFeedOptions {
  limit?: number;
}

interface UseRealtimeFeedReturn {
  posts: RealtimePost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useRealtimeFeed(options: UseRealtimeFeedOptions = {}): UseRealtimeFeedReturn {
  const { limit = 20 } = options;
  const [posts, setPosts] = React.useState<RealtimePost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(0);

  const supabase = getSupabaseClient();

  const fetchPosts = React.useCallback(
    async (currentOffset: number, append: boolean = false) => {
      if (!supabase) {
        setLoading(false);
        setError("Supabase not configured");
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("feed_posts")
          .select(
            `
            id,
            author_id,
            content,
            media_url,
            media_type,
            likes_count,
            comments_count,
            shares_count,
            tags,
            created_at,
            author:profiles(id, full_name, avatar_url, role)
          `,
          )
          .order("created_at", { ascending: false })
          .range(currentOffset, currentOffset + limit - 1);

        if (fetchError) throw fetchError;

        const formattedPosts: RealtimePost[] =
          data?.map((post: any) => ({
            id: post.id,
            authorId: post.author_id,
            authorName: post.author?.full_name || "Unknown",
            authorAvatarUrl: post.author?.avatar_url || undefined,
            content: post.content,
            imageUrl: post.media_url || undefined,
            tags: post.tags || [],
            likesCount: post.likes_count || 0,
            commentsCount: post.comments_count || 0,
            createdAt: post.created_at,
          })) || [];

        if (append) {
          setPosts((prev) => [...prev, ...formattedPosts]);
        } else {
          setPosts(formattedPosts);
        }

        setHasMore(formattedPosts.length === limit);
        setOffset(currentOffset + formattedPosts.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    },
    [supabase, limit],
  );

  // Initial fetch
  React.useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  // Realtime subscription
  React.useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("feed_posts_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feed_posts",
        },
        async (payload) => {
          // Fetch the complete post with author info
          const { data } = await supabase
            .from("feed_posts")
            .select(
              `
              id,
              author_id,
              content,
              media_url,
              media_type,
              likes_count,
              comments_count,
              shares_count,
              tags,
              created_at,
              author:profiles(id, full_name, avatar_url, role)
            `,
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const author = Array.isArray(data.author) ? data.author[0] : data.author;
            const newPost: RealtimePost = {
              id: data.id,
              authorId: data.author_id,
              authorName: author?.full_name || "Unknown",
              authorAvatarUrl: author?.avatar_url || undefined,
              content: data.content,
              imageUrl: data.media_url || undefined,
              tags: data.tags || [],
              likesCount: data.likes_count || 0,
              commentsCount: data.comments_count || 0,
              createdAt: data.created_at,
            };
            setPosts((prev) => [newPost, ...prev]);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "feed_posts",
        },
        (payload) => {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === payload.new.id
                ? {
                    ...post,
                    content: payload.new.content ?? post.content,
                    imageUrl: payload.new.media_url ?? post.imageUrl,
                    likesCount: payload.new.likes_count ?? post.likesCount,
                    commentsCount: payload.new.comments_count ?? post.commentsCount,
                  }
                : post,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "feed_posts",
        },
        (payload) => {
          setPosts((prev) => prev.filter((post) => post.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const loadMore = React.useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(offset, true);
    }
  }, [fetchPosts, offset, loading, hasMore]);

  const refresh = React.useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchPosts(0, false);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

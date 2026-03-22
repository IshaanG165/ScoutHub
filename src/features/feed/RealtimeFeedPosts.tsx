"use client";

import { useRealtimeFeed } from "@/lib/supabase/realtime";
import { FeedPostCard } from "./FeedPostCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export function RealtimeFeedPosts() {
  const { posts, loading, error, hasMore, loadMore } = useRealtimeFeed({ limit: 10 });

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl bg-white/70 p-5 shadow-soft ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="rounded-3xl bg-white/70 p-8 text-center shadow-soft ring-1 ring-black/5">
        <p className="text-scouthub-muted">Feed not available</p>
        <p className="mt-2 text-xs text-scouthub-muted">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-3xl bg-white/70 p-8 text-center shadow-soft ring-1 ring-black/5">
        <p className="font-medium text-scouthub-text">No posts yet</p>
        <p className="mt-2 text-xs text-scouthub-muted">Be the first to share your journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          id={post.id}
          author={{
            name: post.authorName,
            meta: post.authorAvatarUrl ? "Player" : "Member",
            verified: false,
            avatar:
              post.authorAvatarUrl ||
              "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=256&q=80",
          }}
          time={new Date(post.createdAt).toLocaleDateString()}
          title={post.content.slice(0, 60) + (post.content.length > 60 ? "..." : "")}
          body={post.content}
          media={post.imageUrl}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

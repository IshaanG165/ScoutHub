"use client";

import Link from "next/link";
import { CheckCircle2, Heart, MessageCircle, Share2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function FeedPostCard({
  id,
  author,
  time,
  title,
  body,
  match,
  media,
  mediaType,
}: {
  id: string;
  author: { name: string; meta: string; verified: boolean; avatar: string };
  time: string;
  title: string;
  body: string;
  match?: number;
  media?: string;
  mediaType?: "image" | "video";
}) {
  const isVideo = mediaType === "video" || media?.endsWith(".mp4") || media?.endsWith(".webm");
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 p-5">
        <Avatar src={author.avatar} alt={author.name} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-extrabold">
                  {author.name}
                </div>
                {author.verified && (
                  <CheckCircle2 className="h-4 w-4 text-scouthub-green" />
                )}
              </div>
              <div className="text-xs font-medium text-scouthub-muted">
                {author.meta} · {time}
              </div>
            </div>

            {typeof match === "number" && (
              <div className="hidden md:block">
                <Badge className="bg-scouthub-tint text-scouthub-green">
                  {match}% Match
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-3 text-base font-extrabold tracking-tight">
            {title}
          </div>
          <div className="mt-2 text-sm leading-relaxed text-scouthub-muted">
            {body}
          </div>
        </div>
      </div>

      {media && (
        <div className="relative mx-5 mb-4 overflow-hidden rounded-3xl ring-1 ring-black/5">
          {isVideo ? (
            <video
              src={media}
              className="w-full aspect-video object-cover"
              controls
              playsInline
              muted
              autoPlay
              loop
            />
          ) : (
            <>
              <div
                className="aspect-[16/9] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${media})` }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-black/35 text-white ring-4 ring-white/10">
                  <div className="h-0 w-0 border-y-8 border-l-[14px] border-y-transparent border-l-white/90" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-black/5 px-5 py-3 text-sm text-scouthub-muted">
        <div className="flex items-center gap-4">
          <Link
            href={`/posts/${encodeURIComponent(id)}?action=like`}
            className="inline-flex items-center gap-2 transition hover:text-scouthub-text"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-semibold">Like</span>
          </Link>
          <Link
            href={`/posts/${encodeURIComponent(id)}/comments`}
            className="inline-flex items-center gap-2 transition hover:text-scouthub-text"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Comment</span>
          </Link>
          <Link
            href={`/posts/${encodeURIComponent(id)}/share`}
            className="inline-flex items-center gap-2 transition hover:text-scouthub-text"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-semibold">Share</span>
          </Link>
        </div>

        {typeof match === "number" && (
          <Badge className="md:hidden">{match}% Match</Badge>
        )}
      </div>
    </Card>
  );
}

"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageIcon, Video, Send, ArrowLeft, X, Upload } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import { createPost, uploadFile } from "@/lib/supabase/db";
import Link from "next/link";

function ComposeContent() {
  const { user, profile, supabase } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postType = searchParams.get("type") || "text";

  const [content, setContent] = React.useState("");
  const [mediaFile, setMediaFile] = React.useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!content.trim() && !mediaFile) { toast("error", "Add some content"); return; }
    if (!user || !supabase) { toast("error", "Please sign in first"); return; }
    setSubmitting(true);

    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    if (mediaFile) {
      const ext = mediaFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const uploaded = await uploadFile("media", path, mediaFile, supabase);
      if (uploaded.error) { toast("error", uploaded.error); setSubmitting(false); return; }
      mediaUrl = uploaded.url || undefined;
      mediaType = mediaFile.type.startsWith("video") ? "video" : "image";
    }

    const res = await createPost({
      authorId: user.id,
      content: content.trim(),
      mediaUrl,
      mediaType,
    }, supabase);

    if (res.error) { toast("error", res.error); setSubmitting(false); return; }
    toast("success", "Post published!");
    router.push("/");
  }

  if (!user) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <p className="font-bold">Sign in to create posts</p>
          <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="grid h-10 w-10 place-items-center rounded-full bg-white/80 ring-1 ring-black/5 hover:bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Create Post</h1>
        </div>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Avatar src={profile?.avatarUrl} alt={profile?.fullName || "You"} size={44} />
            <div className="flex-1">
              <div className="text-sm font-bold">{profile?.fullName || "You"}</div>
              <div className="text-xs text-scouthub-muted capitalize">{profile?.role || "Member"}</div>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share an update, highlight, or stat..."
            className="mt-4 min-h-[120px] w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-scouthub-muted focus:outline-none"
            autoFocus
          />

          {mediaPreview && (
            <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-black/5">
              {mediaFile?.type.startsWith("video") ? (
                <video src={mediaPreview} className="max-h-64 w-full object-cover" controls />
              ) : (
                <div className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${mediaPreview})` }} />
              )}
              <button onClick={() => { setMediaFile(null); setMediaPreview(""); }}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              <button onClick={() => { if (fileRef.current) fileRef.current.accept = "image/*"; fileRef.current?.click(); }}
                className="inline-flex items-center gap-2 rounded-full bg-scouthub-tint/60 px-3 py-2 text-xs font-semibold text-scouthub-muted ring-1 ring-black/5 hover:bg-white hover:text-scouthub-text transition">
                <ImageIcon className="h-4 w-4" /> Photo
              </button>
              <button onClick={() => { if (fileRef.current) fileRef.current.accept = "video/*"; fileRef.current?.click(); }}
                className="inline-flex items-center gap-2 rounded-full bg-scouthub-tint/60 px-3 py-2 text-xs font-semibold text-scouthub-muted ring-1 ring-black/5 hover:bg-white hover:text-scouthub-text transition">
                <Video className="h-4 w-4" /> Video
              </button>
            </div>

            <Button onClick={handleSubmit} disabled={submitting || (!content.trim() && !mediaFile)}>
              {submitting ? "Publishing..." : <><Send className="h-4 w-4" /> Publish</>}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ComposePage() {
  return <Suspense fallback={<AppShell><div className="space-y-5"><div className="h-12 w-full animate-pulse rounded-xl bg-scouthub-tint" /><div className="h-64 w-full animate-pulse rounded-xl bg-scouthub-tint" /></div></AppShell>}><ComposeContent /></Suspense>;
}

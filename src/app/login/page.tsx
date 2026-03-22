"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { signInWithEmail, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setSubmitting(true);
    const res = await signInWithEmail(email, password);
    if (res.error) { setError(res.error); setSubmitting(false); return; }
    router.replace("/");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-scouthub-bg px-4 py-12 overflow-hidden">
      {/* 3D floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-scouthub-green/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-scouthub-gold/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 animate-float-slow rounded-full bg-scouthub-green/5 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-scouthub-green text-white shadow-lift">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-scouthub-text">Welcome back</h1>
          <p className="mt-2 text-sm text-scouthub-muted">Sign in to your ScoutHub account</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
                <input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-10 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-scouthub-muted hover:text-scouthub-text">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm font-medium text-scouthub-green hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-scouthub-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-scouthub-green hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

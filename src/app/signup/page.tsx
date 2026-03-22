"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const roles = [
  { value: "player", label: "Player", desc: "Build your profile, upload highlights, apply to trials" },
  { value: "scout", label: "Scout", desc: "Discover talent, build shortlists, manage notes" },
  { value: "club", label: "Club", desc: "Post trials, manage events, recruit players" },
] as const;

export default function SignupPage() {
  const { signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();
    const [role, setRole] = React.useState<"player" | "scout" | "club">("player");
    const [fullName, setFullName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [sport, setSport] = React.useState("Football");
    const [position, setPosition] = React.useState("");
    const [showPw, setShowPw] = React.useState(false);
    const [error, setError] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
  
    React.useEffect(() => {
      if (!loading && user) router.replace("/onboarding");
    }, [loading, user, router]);
  
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      if (!fullName || !email || !password) { setError("Please fill in all fields"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      setSubmitting(true);
      const res = await signUpWithEmail(email, password, fullName, role, sport, position);
      if (res.error) { setError(res.error); setSubmitting(false); return; }
      setSuccess(true);
      setSubmitting(false);
    }
  
    if (success) {
      return (
        <div className="relative flex min-h-dvh items-center justify-center bg-scouthub-bg px-4 py-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-scouthub-green/8 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-scouthub-gold/10 blur-3xl" />
          </div>
          <div className="relative z-10 w-full max-w-md text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-scouthub-green text-white shadow-lift">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-scouthub-text">Check your email</h1>
            <p className="mt-3 text-sm text-scouthub-muted">
              We&apos;ve sent a confirmation link to <strong className="text-scouthub-text">{email}</strong>.
              Click the link to activate your account.
            </p>
            <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-scouthub-green hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      );
    }
  
    return (
      <div className="relative flex min-h-dvh items-center justify-center bg-scouthub-bg px-4 py-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-scouthub-green/8 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-scouthub-gold/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 animate-float-slow rounded-full bg-scouthub-green/5 blur-2xl" />
        </div>
  
        <div className="relative z-10 w-full max-w-md mt-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-scouthub-green text-white shadow-lift">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-scouthub-text">Create your account</h1>
            <p className="mt-2 text-sm text-scouthub-muted">Join the football scouting platform</p>
          </div>
  
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="mb-4 space-y-2">
                <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">I am a...</label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((r) => (
                    <label
                      key={r.value}
                      className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        role === r.value
                          ? "border-scouthub-green bg-scouthub-green/5 ring-1 ring-scouthub-green"
                          : "border-black/10 hover:border-black/20 hover:bg-black/[0.02]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => setRole(r.value as any)}
                        className="mt-1 sr-only"
                      />
                      <div
                        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          role === r.value
                            ? "border-scouthub-green bg-scouthub-green"
                            : "border-gray-300"
                        }`}
                      >
                        {role === r.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-bold text-scouthub-text">{r.label}</span>
                        <span className="block text-xs text-scouthub-muted">{r.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
  
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">Full Name / Organization</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="E.g. John Doe or FC Zenith"
                    className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">Sport</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="h-11 w-full rounded-xl bg-scouthub-tint/60 px-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  >
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Rugby">Rugby</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">Position</label>
                  <input
                    type="text" value={position} onChange={(e) => setPosition(e.target.value)}
                    placeholder="E.g. Striker"
                    className="h-11 w-full rounded-xl bg-scouthub-tint/60 px-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  />
                </div>
              </div>
  
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
                    placeholder="At least 6 characters"
                    className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-10 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-scouthub-muted hover:text-scouthub-text">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
  
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
  
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
  
        </Card>

        <p className="mt-6 text-center text-sm text-scouthub-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-scouthub-green hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { Shield, Mail, ArrowLeft } from "lucide-react";

import { useAuth } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email"); return; }
    setSubmitting(true);
    const res = await resetPassword(email);
    if (res.error) { setError(res.error); setSubmitting(false); return; }
    setSent(true);
    setSubmitting(false);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-scouthub-bg px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-scouthub-green/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-scouthub-gold/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-scouthub-green text-white shadow-lift">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-scouthub-text">
            {sent ? "Check your email" : "Reset password"}
          </h1>
          <p className="mt-2 text-sm text-scouthub-muted">
            {sent ? `We've sent a reset link to ${email}` : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {!sent ? (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-scouthub-text">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scouthub-muted" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl bg-scouthub-tint/60 pl-10 pr-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20" />
                </div>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-scouthub-muted">Didn&apos;t receive it? Check spam or try again.</p>
            <Button variant="secondary" className="mt-4" onClick={() => { setSent(false); setEmail(""); }}>
              Try again
            </Button>
          </Card>
        )}

        <p className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-scouthub-green hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Shield, Upload, FileText, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import { fetchVerificationStatus, submitVerification, uploadFile } from "@/lib/supabase/db";
import type { VerificationRequest } from "@/lib/supabase/types";
import Link from "next/link";

export default function VerificationPage() {
  const { user, profile, supabase } = useAuth();
  const { toast } = useToast();
  const [existing, setExisting] = React.useState<VerificationRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notes, setNotes] = React.useState("");
  const [docType, setDocType] = React.useState("id");
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      const data = await fetchVerificationStatus(user!.id, supabase);
      setExisting(data);
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase) return;
    setSubmitting(true);

    let documentUrl: string | undefined;
    if (file) {
      const path = `${user.id}/verification/${Date.now()}-${file.name}`;
      const uploaded = await uploadFile("documents", path, file, supabase);
      if (uploaded.error) { toast("error", uploaded.error); setSubmitting(false); return; }
      documentUrl = uploaded.url || undefined;
    }

    const res = await submitVerification({ userId: user.id, documentUrl, documentType: docType, notes }, supabase);
    if (res.error) { toast("error", res.error); setSubmitting(false); return; }
    toast("success", "Verification request submitted!");
    setExisting({ id: "", userId: user.id, documentUrl, documentType: docType, notes, status: "pending", reviewerNotes: "", createdAt: new Date().toISOString() });
    setSubmitting(false);
  }

  const statusIcons = {
    pending: <Clock className="h-5 w-5 text-amber-500" />,
    approved: <CheckCircle2 className="h-5 w-5 text-scouthub-green" />,
    rejected: <XCircle className="h-5 w-5 text-red-500" />,
  };

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
  };

  if (loading) return <AppShell><Skeleton className="h-64 w-full" /></AppShell>;

  if (!user) {
    return (
      <AppShell>
        <Card className="p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-scouthub-muted mb-4" />
          <p className="font-bold">Sign in to get verified</p>
          <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-scouthub-green text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Verification</h1>
              <p className="text-sm text-scouthub-muted">Submit identity and role evidence for a verified badge</p>
            </div>
          </div>
        </Card>

        {existing ? (
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              {statusIcons[existing.status]}
              <div>
                <h2 className="text-sm font-extrabold capitalize">Status: {existing.status}</h2>
                <p className="text-xs text-scouthub-muted">Submitted {new Date(existing.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge className={`ml-auto ${statusColors[existing.status]}`}>{existing.status}</Badge>
            </div>
            {existing.status === "pending" && (
              <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <AlertTriangle className="h-4 w-4" /> Under review
                </div>
                <p className="mt-1 text-xs text-amber-600">Your verification is being reviewed. This usually takes 1-3 business days.</p>
              </div>
            )}
            {existing.status === "approved" && (
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                <p className="text-sm text-emerald-700">Your account is verified! A badge is now visible on your profile.</p>
              </div>
            )}
            {existing.status === "rejected" && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
                  <p className="text-sm text-red-700">Your verification was not approved.</p>
                  {existing.reviewerNotes && <p className="mt-1 text-xs text-red-600">Reason: {existing.reviewerNotes}</p>}
                </div>
                <Button onClick={() => setExisting(null)}>Submit Again</Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Document Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="h-11 w-full rounded-xl bg-scouthub-tint/60 px-4 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-scouthub-green/20">
                  <option value="id">Government ID</option>
                  <option value="club_letter">Club Reference Letter</option>
                  <option value="coaching_cert">Coaching Certificate</option>
                  <option value="organization_id">Organization ID</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Upload Document</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-black/10 p-6 hover:border-scouthub-green/30 transition">
                  <Upload className="h-6 w-6 text-scouthub-muted" />
                  <div>
                    <span className="text-sm font-medium text-scouthub-text">{file ? file.name : "Click to select a file"}</span>
                    <span className="block text-xs text-scouthub-muted">PDF, JPG, or PNG — max 10MB</span>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">Additional Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context for the review team..."
                  className="w-full rounded-xl bg-scouthub-tint/60 px-4 py-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  rows={3} />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : <><Shield className="h-4 w-4" /> Submit for Verification</>}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

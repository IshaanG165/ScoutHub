"use client";

import * as React from "react";
import { Cog, User, Bell, Shield, LogOut, Trash2, Mail, Lock, Moon } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function SettingsPage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [editName, setEditName] = React.useState(profile?.fullName || "");
  const [editBio, setEditBio] = React.useState(profile?.bio || "");
  const [editLocation, setEditLocation] = React.useState(profile?.location || "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || "");
      setEditBio(profile.bio || "");
      setEditLocation(profile.location || "");
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    const res = await updateProfile({ fullName: editName, bio: editBio, location: editLocation });
    if (res.error) toast("error", res.error);
    else toast("success", "Settings saved");
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  const inputClass = "h-11 w-full rounded-xl bg-scouthub-tint/60 px-4 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20";

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
        <Card className="p-5">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Cog className="h-6 w-6 text-scouthub-muted" /> Settings
          </h1>
          <p className="mt-1 text-sm text-scouthub-muted">Account preferences, privacy controls, and notifications</p>
        </Card>

        {/* Profile Section */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold flex items-center gap-2 mb-4"><User className="h-4 w-4" /> Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-scouthub-muted">Display Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-scouthub-muted">Location</label>
              <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, State" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-scouthub-muted">Bio</label>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} placeholder="Tell us about yourself..."
                className="w-full rounded-xl bg-scouthub-tint/60 px-4 py-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20" />
            </div>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold flex items-center gap-2 mb-4"><Mail className="h-4 w-4" /> Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-scouthub-tint/40 p-3 ring-1 ring-black/5">
              <div>
                <div className="text-sm font-semibold">Email</div>
                <div className="text-xs text-scouthub-muted">{user?.email || "Not set"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-scouthub-tint/40 p-3 ring-1 ring-black/5">
              <div>
                <div className="text-sm font-semibold">Role</div>
                <div className="text-xs text-scouthub-muted capitalize">{profile?.role || "Member"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-scouthub-tint/40 p-3 ring-1 ring-black/5">
              <div>
                <div className="text-sm font-semibold">Plan</div>
                <div className="text-xs text-scouthub-muted capitalize">{profile?.premiumTier || "Free"}</div>
              </div>
              <Link href="/upgrade"><Button variant="gold" size="sm">Upgrade</Button></Link>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold flex items-center gap-2 mb-4"><Bell className="h-4 w-4" /> Notifications</h2>
          <div className="space-y-3">
            {["Trial updates", "Profile views", "Post engagement", "Scout activity"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-scouthub-tint/40 p-3 ring-1 ring-black/5">
                <span className="text-sm font-medium">{item}</span>
                <label className="relative inline-flex cursor-pointer">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-6 w-10 rounded-full bg-gray-200 peer-checked:bg-scouthub-green after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold text-red-600 flex items-center gap-2 mb-4"><Shield className="h-4 w-4" /> Danger Zone</h2>
          <div className="space-y-3">
            <Button variant="secondary" onClick={handleSignOut} className="w-full">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
            <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50"
              onClick={() => toast("info", "Account deletion requires email confirmation. Feature coming soon.")}>
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

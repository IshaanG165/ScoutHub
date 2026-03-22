"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, MapPin, Briefcase, Trophy, ChevronRight, User, Check } from "lucide-react";

import { useAuth } from "@/lib/supabase/auth";
import { completeOnboarding } from "@/lib/supabase/db";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { UserRole } from "@/lib/supabase/types";

const roleCards = [
  { value: "player" as UserRole, icon: Trophy, label: "Player", desc: "Build your profile, upload highlights, apply to trials" },
  { value: "scout" as UserRole, icon: Briefcase, label: "Scout", desc: "Discover talent, shortlist players, manage notes" },
  { value: "club" as UserRole, icon: Shield, label: "Club", desc: "Post trials, manage events, recruit players" },
];

export default function OnboardingPage() {
  const { user, profile, supabase, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [role, setRole] = React.useState<UserRole>("player");
  const [fullName, setFullName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [bio, setBio] = React.useState("");
  // Player fields
  const [position, setPosition] = React.useState("");
  const [ageGroup, setAgeGroup] = React.useState("");
  const [currentClub, setCurrentClub] = React.useState("");
  const [preferredFoot, setPreferredFoot] = React.useState("right");
  // Scout fields
  const [organization, setOrganization] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [specialization, setSpecialization] = React.useState("");
  // Club fields
  const [clubName, setClubName] = React.useState("");
  const [league, setLeague] = React.useState("");
  const [officialEmail, setOfficialEmail] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && profile?.onboarded) router.replace("/");
    if (profile?.fullName) setFullName(profile.fullName);
  }, [loading, user, profile, router]);

  async function handleComplete() {
    if (!user || !supabase) return;
    setSubmitting(true);
    setError("");

    const res = await completeOnboarding(user.id, {
      role,
      fullName: fullName || "User",
      bio,
      location,
      playerData: role === "player" ? { position, ageGroup, currentClub, preferredFoot: preferredFoot as any } : undefined,
      scoutData: role === "scout" ? { organization, region, specialization } : undefined,
      clubData: role === "club" ? { clubName, league, officialEmail } : undefined,
    }, supabase);

    if (res.error) { setError(res.error); setSubmitting(false); return; }
    await refreshProfile();
    router.replace("/");
  }

  const inputClass = "h-11 w-full rounded-xl bg-scouthub-tint/60 px-4 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20";

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-scouthub-bg px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-scouthub-green/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-scouthub-gold/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-scouthub-text">
            {step === 0 ? "Choose your role" : step === 1 ? "Your details" : "Almost done"}
          </h1>
          <p className="mt-2 text-sm text-scouthub-muted">
            {step === 0 ? "How will you use ScoutHub?" : step === 1 ? "Tell us about yourself" : "Role-specific info"}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${i <= step ? "bg-scouthub-green" : "bg-black/10"}`} />
            ))}
          </div>
        </div>

        <Card className="p-6">
          {step === 0 && (
            <div className="space-y-3">
              {roleCards.map((r) => {
                const Icon = r.icon;
                const selected = role === r.value;
                return (
                  <button key={r.value} onClick={() => setRole(r.value)}
                    className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ring-1 ${
                      selected ? "bg-scouthub-green/5 ring-scouthub-green/30 shadow-soft" : "bg-white/50 ring-black/5 hover:bg-white/80"
                    }`}>
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? "bg-scouthub-green text-white" : "bg-scouthub-tint text-scouthub-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-scouthub-text">{r.label}</div>
                      <div className="text-xs text-scouthub-muted">{r.desc}</div>
                    </div>
                    {selected && <Check className="h-5 w-5 text-scouthub-green" />}
                  </button>
                );
              })}
              <Button className="mt-4 w-full" onClick={() => setStep(1)}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..."
                  className="w-full rounded-xl bg-scouthub-tint/60 px-4 py-3 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  rows={3} />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {role === "player" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Position</label>
                    <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass}>
                      <option value="">Select position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Centre Back">Centre Back</option>
                      <option value="Full Back">Full Back</option>
                      <option value="Wing Back">Wing Back</option>
                      <option value="Defensive Midfielder">Defensive Midfielder</option>
                      <option value="Central Midfielder">Central Midfielder</option>
                      <option value="Attacking Midfielder">Attacking Midfielder</option>
                      <option value="Winger">Winger</option>
                      <option value="Striker">Striker</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">Age Group</label>
                      <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        <option value="U14">U14</option><option value="U16">U16</option>
                        <option value="U18">U18</option><option value="U21">U21</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">Preferred Foot</label>
                      <select value={preferredFoot} onChange={(e) => setPreferredFoot(e.target.value)} className={inputClass}>
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Current Club</label>
                    <input value={currentClub} onChange={(e) => setCurrentClub(e.target.value)} placeholder="Club name (if any)" className={inputClass} />
                  </div>
                </>
              )}

              {role === "scout" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Organization</label>
                    <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or agency" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Region</label>
                    <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Area of focus" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Specialization</label>
                    <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Youth Forwards, Goalkeepers" className={inputClass} />
                  </div>
                </>
              )}

              {role === "club" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Club Name</label>
                    <input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Official club name" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">League / Competition</label>
                    <input value={league} onChange={(e) => setLeague(e.target.value)} placeholder="e.g. A-League, NPL" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Official Email</label>
                    <input type="email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} placeholder="club@example.com" className={inputClass} />
                  </div>
                </>
              )}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleComplete} disabled={submitting}>
                  {submitting ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

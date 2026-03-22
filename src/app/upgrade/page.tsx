"use client";

import * as React from "react";
import { Crown, Check, Zap, TrendingUp, Eye, Shield, Star } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/supabase/auth";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const plans = [
  {
    name: "Free", price: "$0", period: "/mo", tier: "free",
    features: ["Basic profile", "5 trial applications/month", "Feed access", "Standard analytics"],
    accent: "bg-scouthub-tint ring-black/5",
  },
  {
    name: "Pro", price: "$9", period: "/mo", tier: "pro", popular: true,
    features: ["Verified badge priority", "Unlimited applications", "Advanced analytics", "Priority scouting", "Highlight pinning", "Scout notes"],
    accent: "bg-scouthub-green/5 ring-scouthub-green/20 shadow-lift",
  },
  {
    name: "Elite", price: "$29", period: "/mo", tier: "elite",
    features: ["All Pro features", "1-on-1 scout sessions", "Profile boosting", "Custom branding", "Dedicated support", "Early access to trials"],
    accent: "bg-scouthub-gold/5 ring-scouthub-gold/20",
  },
];

export default function UpgradePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const currentTier = profile?.premiumTier || "free";

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-scouthub-gold text-scouthub-text shadow-lift">
            <Crown className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Upgrade Your Experience</h1>
          <p className="mt-2 text-sm text-scouthub-muted">Choose a plan to unlock advanced features and priority access</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            return (
              <Card key={plan.name} className={cn("relative overflow-hidden p-6 ring-1", plan.accent)}>
                {plan.popular && (
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-scouthub-green text-white ring-0"><Star className="h-3 w-3" /> Popular</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold">{plan.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-scouthub-muted">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-scouthub-green" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button
                    variant={plan.popular ? "primary" : "secondary"}
                    className={cn("w-full", plan.tier === "elite" && "bg-scouthub-gold text-scouthub-text hover:shadow-lift")}
                    onClick={() => toast("info", "Payment integration coming soon. Your interest has been noted!")}
                  >
                    {plan.tier === "free" ? "Downgrade" : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-scouthub-gold" />
            <div>
              <h3 className="text-sm font-extrabold">Premium Benefits</h3>
              <p className="text-xs text-scouthub-muted">Upgrade today and stand out to scouts and clubs across the platform</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-scouthub-tint/50 p-4 ring-1 ring-black/5">
              <TrendingUp className="h-5 w-5 text-scouthub-green mb-2" />
              <div className="text-sm font-bold">3x More Views</div>
              <div className="text-xs text-scouthub-muted">Pro profiles get significantly more visibility</div>
            </div>
            <div className="rounded-2xl bg-scouthub-tint/50 p-4 ring-1 ring-black/5">
              <Eye className="h-5 w-5 text-blue-500 mb-2" />
              <div className="text-sm font-bold">Advanced Analytics</div>
              <div className="text-xs text-scouthub-muted">See who viewed your profile and when</div>
            </div>
            <div className="rounded-2xl bg-scouthub-tint/50 p-4 ring-1 ring-black/5">
              <Shield className="h-5 w-5 text-scouthub-gold mb-2" />
              <div className="text-sm font-bold">Priority Support</div>
              <div className="text-xs text-scouthub-muted">Get dedicated help from our team</div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

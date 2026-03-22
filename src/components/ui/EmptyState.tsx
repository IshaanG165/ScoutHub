import * as React from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl bg-white/70 p-12 text-center shadow-soft ring-1 ring-black/5", className)}>
      {icon && <div className="mb-4 text-scouthub-muted">{icon}</div>}
      <h3 className="text-base font-extrabold text-scouthub-text">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-scouthub-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

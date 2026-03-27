"use client";

import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-main)]">
        <Icon className="h-8 w-8 text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-[var(--color-text-secondary)]">
        {description}
      </p>
      {action && (
        <p className="text-sm font-medium text-[var(--color-accent)]">{action}</p>
      )}
    </div>
  );
}

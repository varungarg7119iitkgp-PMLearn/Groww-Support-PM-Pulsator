"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Reporting
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Weekly Pulse, Fee Explainer, and Morning Brew workflows
        </p>
      </div>

      <EmptyState
        icon={FileText}
        title="Reporting workflows coming soon"
        description="This is where you'll generate Weekly Pulses, Fee Explainers, and Morning Brew email drafts — all with approval-gated workflows."
        action="Available in Phase 8"
      />
    </div>
  );
}

"use client";

import { FilterBar } from "@/components/shared/filter-bar";
import { ReportingWorkflow } from "@/components/reporting/reporting-workflow";

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

      <FilterBar />
      <ReportingWorkflow />
    </div>
  );
}

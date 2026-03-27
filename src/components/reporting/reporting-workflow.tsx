"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  FileText,
  Mail,
  Bug,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useFilters } from "@/context/filter-context";

type GeneratedReport = {
  metrics: {
    total: number;
    averageRating: number;
    nps: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  topThemes: { name: string; count: number }[];
  topBugs: { title: string; impactCount: number; examples: string[] }[];
  topFeatureIdeas: { title: string; votes: number; rationale: string }[];
  quotes: string[];
  weeklyPulse: string;
  topActions: string[];
  morningBrewHtml: string;
  appUrl: string;
  generatedAt: string;
};

export function ReportingWorkflow() {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  const [sending, setSending] = useState(false);
  const [jiraing, setJiraing] = useState(false);
  const [confluencing, setConfluencing] = useState(false);

  const [recipients, setRecipients] = useState("leader1@company.com,leader2@company.com");
  const [status, setStatus] = useState<string | null>(null);

  const periodLabel = useMemo(() => filters.timePeriod.replace("_", " "), [filters.timePeriod]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setApproved(false);

    try {
      const res = await fetch("/api/reporting/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: filters.platform,
          timePeriod: filters.timePeriod,
          dateFrom: filters.customDateFrom,
          dateTo: filters.customDateTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const pushTopBugsToJira = async () => {
    if (!report || !approved || report.topBugs.length === 0) return;

    setJiraing(true);
    setStatus(null);

    try {
      const created: string[] = [];
      for (const bug of report.topBugs.slice(0, 3)) {
        const description = [
          `Impact Count: ${bug.impactCount}`,
          "",
          "Example User Quotes:",
          ...bug.examples.map((q) => `- ${q}`),
          "",
          `Source: ${report.appUrl}`,
        ].join("\n");

        const res = await fetch("/api/integrations/jira/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `[Top Bug] ${bug.title}`,
            description,
            labels: ["groww-pulsator", "top-bug"],
            issueType: "Bug",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed creating Jira issue");
        created.push(data.issueKey);
      }

      setStatus(`Jira tickets created successfully: ${created.join(", ")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to push Jira tickets");
    } finally {
      setJiraing(false);
    }
  };

  const createConfluenceSpec = async () => {
    if (!report || !approved) return;

    setConfluencing(true);
    setStatus(null);

    try {
      const title = `Groww Pulsator Spec - ${new Date().toISOString().slice(0, 10)}`;
      const htmlBody = `
        <h1>Support PM Pulsator - Weekly Spec Snapshot</h1>
        <p><b>Generated:</b> ${new Date(report.generatedAt).toLocaleString()}</p>
        <h2>Executive Pulse</h2>
        <p>${report.weeklyPulse}</p>
        <h2>Top Bugs</h2>
        <ol>${report.topBugs
          .map((b) => `<li><b>${b.title}</b> (${b.impactCount} reports)</li>`)
          .join("")}</ol>
        <h2>Top Feature Ideas</h2>
        <ol>${report.topFeatureIdeas
          .map((f) => `<li><b>${f.title}</b> - ${f.rationale}</li>`)
          .join("")}</ol>
        <h2>Actions</h2>
        <ol>${report.topActions.map((a) => `<li>${a}</li>`).join("")}</ol>
        <p><a href="${report.appUrl}">Open Application</a></p>
      `;

      const res = await fetch("/api/integrations/confluence/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, htmlBody }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create Confluence page");

      setStatus(`Confluence page created: ${data.pageUrl}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Confluence page");
    } finally {
      setConfluencing(false);
    }
  };

  const sendMorningBrew = async () => {
    if (!report || !approved) return;

    setSending(true);
    setStatus(null);

    try {
      const recipientList = recipients
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const subject = `Weekly Pulse + Feature & Bug Brief - ${new Date().toISOString().slice(0, 10)}`;

      const res = await fetch("/api/reporting/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: recipientList, subject, html: report.morningBrewHtml }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send morning brew");

      setStatus(`Morning Brew sent to ${data.sentTo} recipients.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Phase 8 Reporting Orchestrator</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Generate leadership-ready pulse with top bugs, feature ideas, Jira + Confluence + SMTP actions.
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Generating..." : "Generate Weekly Pulse"}
          </button>
        </div>

        <div className="mt-3 text-xs text-[var(--color-text-secondary)]">
          Active filter: <b>{filters.platform}</b> / <b>{periodLabel}</b>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <div className="inline-flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Error</div>
          <div className="mt-1">{error}</div>
        </div>
      )}

      {status && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
          <div className="inline-flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Success</div>
          <div className="mt-1 break-all">{status}</div>
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <StatCard label="Reviews" value={String(report.metrics.total)} />
            <StatCard label="Avg Rating" value={String(report.metrics.averageRating)} />
            <StatCard label="NPS" value={String(report.metrics.nps)} />
            <StatCard label="Generated" value={new Date(report.generatedAt).toLocaleDateString()} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Weekly Pulse" icon={FileText}>
              <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">{report.weeklyPulse}</p>
              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold text-[var(--color-text-secondary)]">Top Actions</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-primary)]">
                  {report.topActions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            </Panel>

            <Panel title="Top Bugs (Top 3)" icon={Bug}>
              <ol className="space-y-2 text-sm text-[var(--color-text-primary)]">
                {report.topBugs.map((b, i) => (
                  <li key={i} className="rounded-lg bg-[var(--color-bg-main)] p-2">
                    <div className="font-semibold">{i + 1}. {b.title}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">{b.impactCount} reports</div>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel title="Top Feature Ideas (Top 3)" icon={Lightbulb}>
              <ol className="space-y-2 text-sm text-[var(--color-text-primary)]">
                {report.topFeatureIdeas.map((f, i) => (
                  <li key={i} className="rounded-lg bg-[var(--color-bg-main)] p-2">
                    <div className="font-semibold">{i + 1}. {f.title}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">{f.rationale}</div>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel title="Morning Brew Dispatch" icon={Mail}>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">Leadership Emails (comma separated)</label>
                  <textarea
                    rows={3}
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="w-full rounded-lg border bg-[var(--color-bg-main)] p-2 text-xs text-[var(--color-text-primary)]"
                  />
                </div>
                <a
                  href={report.appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open app link in mail <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </Panel>
          </div>

          <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
              <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
              Approval Gate: I approve external actions (Jira / Confluence / Mail)
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton
                onClick={pushTopBugsToJira}
                disabled={!approved || jiraing}
                loading={jiraing}
                label="Push Top Bugs to Jira"
              />
              <ActionButton
                onClick={createConfluenceSpec}
                disabled={!approved || confluencing}
                loading={confluencing}
                label="Create Confluence Spec"
              />
              <ActionButton
                onClick={sendMorningBrew}
                disabled={!approved || sending}
                loading={sending}
                label="Trigger Morning Brew"
                icon={Send}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  loading,
  label,
  icon: Icon = ExternalLink,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Working..." : label}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <div className="mb-3 inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--color-accent)]" />
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h4>
      </div>
      {children}
    </div>
  );
}

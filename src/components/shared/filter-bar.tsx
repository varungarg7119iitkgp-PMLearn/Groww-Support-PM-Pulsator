"use client";

import { useState } from "react";
import { Filter, X, Calendar } from "lucide-react";
import { useFilters } from "@/context/filter-context";
import { FILTER_PLATFORMS, FILTER_TIME_PERIODS } from "@/constants/navigation";

export function FilterBar() {
  const { filters, setPlatform, setTimePeriod, setCustomDateRange, resetFilters } =
    useFilters();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.customDateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters.customDateTo ?? "");
  const [dateError, setDateError] = useState("");

  const handleApplyCustomDate = () => {
    if (!dateFrom || !dateTo) {
      setDateError("Both dates are required");
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      setDateError("Start date must be before end date");
      return;
    }
    setDateError("");
    setCustomDateRange(dateFrom, dateTo);
    setMobileOpen(false);
  };

  const handleResetCustomDate = () => {
    setDateFrom("");
    setDateTo("");
    setDateError("");
    setTimePeriod("last_30");
  };

  const filterContent = (
    <div className="space-y-4">
      {/* Platform Filter */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Platform
        </label>
        <div className="flex items-center gap-1">
          {FILTER_PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPlatform(p.id as "all" | "android" | "ios");
                if (mobileOpen) setMobileOpen(false);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filters.platform === p.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Period */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Time Period
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TIME_PERIODS.filter((t) => t.id !== "custom").map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTimePeriod(t.id as any);
                if (mobileOpen) setMobileOpen(false);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filters.timePeriod === t.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Custom Date Range
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border bg-[var(--color-bg-main)] py-1.5 pl-8 pr-3 text-xs text-[var(--color-text-primary)]"
            />
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">to</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border bg-[var(--color-bg-main)] py-1.5 pl-8 pr-3 text-xs text-[var(--color-text-primary)]"
            />
          </div>
          <button
            onClick={handleApplyCustomDate}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleResetCustomDate}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Reset
          </button>
        </div>
        {dateError && (
          <p className="mt-1 text-xs text-[var(--color-negative)]">{dateError}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop filter bar */}
      <div className="hidden md:block rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        {filterContent}
      </div>

      {/* Mobile filter trigger */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-lg border bg-[var(--color-bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] shadow-sm w-full"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {filters.platform !== "all" || filters.timePeriod !== "last_30" ? (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] text-white">
              !
            </span>
          ) : null}
        </button>
      </div>

      {/* Mobile filter modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[var(--color-bg-card)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Filters
              </h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}

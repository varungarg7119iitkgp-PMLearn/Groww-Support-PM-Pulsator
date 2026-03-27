"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { FilterState, Platform, TimePeriod } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  platform: "all",
  timePeriod: "last_30",
  customDateFrom: null,
  customDateTo: null,
  appId: null,
};

interface FilterContextType {
  filters: FilterState;
  setPlatform: (platform: Platform) => void;
  setTimePeriod: (period: TimePeriod) => void;
  setCustomDateRange: (from: string, to: string) => void;
  setAppId: (appId: string | null) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  const [filters, setFilters] = useState<FilterState>(() => ({
    platform: (searchParams.get("platform") as Platform) || DEFAULT_FILTERS.platform,
    timePeriod: (searchParams.get("period") as TimePeriod) || DEFAULT_FILTERS.timePeriod,
    customDateFrom: searchParams.get("from") || DEFAULT_FILTERS.customDateFrom,
    customDateTo: searchParams.get("to") || DEFAULT_FILTERS.customDateTo,
    appId: searchParams.get("app") || DEFAULT_FILTERS.appId,
  }));

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (filters.platform !== "all") params.set("platform", filters.platform);
    if (filters.timePeriod !== "last_30") params.set("period", filters.timePeriod);
    if (filters.customDateFrom) params.set("from", filters.customDateFrom);
    if (filters.customDateTo) params.set("to", filters.customDateTo);
    if (filters.appId) params.set("app", filters.appId);

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [filters, pathname, router]);

  const setPlatform = useCallback(
    (platform: Platform) =>
      setFilters((prev) => ({ ...prev, platform })),
    []
  );

  const setTimePeriod = useCallback(
    (timePeriod: TimePeriod) =>
      setFilters((prev) => ({
        ...prev,
        timePeriod,
        ...(timePeriod !== "custom" ? { customDateFrom: null, customDateTo: null } : {}),
      })),
    []
  );

  const setCustomDateRange = useCallback(
    (from: string, to: string) => {
      if (new Date(from) > new Date(to)) return;
      setFilters((prev) => ({
        ...prev,
        timePeriod: "custom" as TimePeriod,
        customDateFrom: from,
        customDateTo: to,
      }));
    },
    []
  );

  const setAppId = useCallback(
    (appId: string | null) =>
      setFilters((prev) => ({ ...prev, appId })),
    []
  );

  const resetFilters = useCallback(
    () => setFilters(DEFAULT_FILTERS),
    []
  );

  return (
    <FilterContext.Provider
      value={{ filters, setPlatform, setTimePeriod, setCustomDateRange, setAppId, resetFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

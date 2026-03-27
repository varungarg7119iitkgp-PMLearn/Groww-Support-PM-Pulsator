"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MOBILE_NAV_TABS } from "@/constants/navigation";
import { X } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isGroupActive = (tab: (typeof MOBILE_NAV_TABS)[number]) => {
    if (tab.children) {
      return tab.children.some((child) => isActive(child.href));
    }
    return isActive(tab.href);
  };

  return (
    <>
      {/* Submenu overlay */}
      {expandedMenu && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setExpandedMenu(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-16 left-0 right-0 rounded-t-2xl bg-[var(--color-bg-card)] border-t p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {expandedMenu === "insights" ? "Insights" : "More"}
              </h3>
              <button
                onClick={() => setExpandedMenu(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-1">
              {MOBILE_NAV_TABS.find((t) => t.id === expandedMenu)
                ?.children?.map((child: { id: string; label: string; href: string; icon: any }) => {
                  const Icon = child.icon;
                  const active = isActive(child.href);
                  return (
                    <Link
                      key={child.id}
                      href={child.href}
                      onClick={() => setExpandedMenu(null)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {child.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-[var(--color-bg-nav)] backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-around px-2">
          {MOBILE_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isGroupActive(tab);
            const hasChildren = tab.children && tab.children.length > 0;

            if (hasChildren) {
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setExpandedMenu(expandedMenu === tab.id ? null : tab.id)
                  }
                  className={`flex min-w-[3rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-all ${
                    active || expandedMenu === tab.id
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex min-w-[3rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-all ${
                  active
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

"use client";

import { ContextBar } from "./context-bar";

function AppLogo() {
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-extrabold text-lg select-none"
      style={{
        background: "linear-gradient(135deg, #5367FF 0%, #00D09C 100%)",
      }}
    >
      G
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-[var(--color-bg-nav)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <AppLogo />
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-tight">
              Support PM Pulsator
            </h1>
            <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight">
              AI-Powered Review Intelligence
            </p>
          </div>
          <h1 className="text-sm font-bold text-[var(--color-text-primary)] sm:hidden">
            PM Pulsator
          </h1>
        </div>
        <ContextBar />
      </div>
    </header>
  );
}

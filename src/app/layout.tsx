import type { Metadata } from "next";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FilterProvider } from "@/context/filter-context";
import { Header } from "@/components/layout/header";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groww Support PM Pulsator",
  description:
    "AI-powered review intelligence platform for Support Product Managers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen pb-16 md:pb-0">
        <ThemeProvider>
          <Suspense fallback={null}>
            <FilterProvider>
              <Header />
              <DesktopNav />
              <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {children}
              </main>
              <MobileNav />
            </FilterProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

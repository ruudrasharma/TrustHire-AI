"use client";

import OrbitDock from "@/components/OrbitDock";

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
      <div
        className="fixed top-0 left-0 right-0 h-px opacity-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent-purple), transparent)" }}
      />
      <main className="max-w-canvas mx-auto px-4 sm:px-6 pt-8 pb-32">
        {children}
      </main>
      <OrbitDock role="coordinator" />
    </div>
  );
}

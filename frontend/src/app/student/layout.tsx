"use client";

import OrbitDock from "@/components/OrbitDock";
import { useState } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
      {/* Ambient top glow */}
      <div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent-cyan), transparent)", opacity: 0.4 }}
      />
      <main className="max-w-canvas mx-auto px-4 sm:px-6 pt-8 pb-32 lg:pr-[380px]">
        {children}
      </main>
      <OrbitDock role="student" />
    </div>
  );
}

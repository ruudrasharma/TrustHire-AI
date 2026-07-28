"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldCheck, GraduationCap, LayoutDashboard, ArrowRight, Link2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0891B2 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <div className="w-12 h-12 rounded-2xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.2)] flex items-center justify-center">
            <ShieldCheck size={24} className="text-[var(--accent-cyan)]" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            TrustHire{" "}
            <span className="text-[var(--accent-cyan)]">AI</span>
          </h1>
          <p className="mt-4 text-lg text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            Campus placement, built on proof. Eligibility results are{" "}
            <span className="text-[var(--text-primary)]">cryptographically signed</span>. Status
            changes are{" "}
            <span className="text-[var(--text-primary)]">hash-chained</span>. Every claim is
            independently verifiable.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {[
            { icon: ShieldCheck, label: "Signed Eligibility", color: "var(--accent-emerald)" },
            { icon: Link2, label: "Hash-Chained Audit", color: "var(--accent-cyan)" },
            { icon: ArrowRight, label: "Verifiable Receipts", color: "var(--accent-purple)" },
          ].map(({ icon: Icon, label, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-2)] border border-[var(--border)]"
              style={{ color }}
            >
              <Icon size={11} />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Role selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="grid sm:grid-cols-2 gap-4 mt-4"
        >
          <RoleCard
            icon={GraduationCap}
            title="I'm a Student"
            description="Browse drives, check eligibility, apply, track status, and get AI guidance."
            accent="var(--accent-cyan)"
            onClick={() => router.push("/student")}
            id="role-student"
          />
          <RoleCard
            icon={LayoutDashboard}
            title="I'm a Coordinator"
            description="Create companies, publish drives, review applications, and update statuses."
            accent="var(--accent-purple)"
            onClick={() => router.push("/coordinator")}
            id="role-coordinator"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-[var(--text-muted)]"
        >
          No login required — demo prototype. All data resets on server restart.
        </motion.p>
      </div>
    </main>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  accent,
  onClick,
  id,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
  onClick: () => void;
  id: string;
}) {
  return (
    <motion.button
      id={id}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="card text-left p-6 group cursor-pointer transition-all hover:border-[var(--border-strong)]"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
        style={{ background: `rgba(${accent.includes("22D3EE") ? "34,211,238" : "167,139,250"},0.1)` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <h2 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h2>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
      <div
        className="flex items-center gap-1 mt-4 text-xs font-medium transition-all group-hover:gap-2"
        style={{ color: accent }}
      >
        Enter <ArrowRight size={12} />
      </div>
    </motion.button>
  );
}

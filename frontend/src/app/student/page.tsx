"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { drivesApi, studentsApi } from "@/lib/api";
import type { DriveResponse, StudentResponse } from "@/lib/types";
import { formatDateOnly } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";

const STUDENT_ID_KEY = "th_student_id";

export default function StudentHomePage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [drives, setDrives] = useState<DriveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STUDENT_ID_KEY);
    if (!id) {
      id = `STU-${String(Date.now()).slice(-3)}`;
      localStorage.setItem(STUDENT_ID_KEY, id);
    }
    setStudentId(id);
  }, []);

  useEffect(() => {
    drivesApi.getAll().then(setDrives).catch(() => setError("Failed to load drives")).finally(() => setLoading(false));
  }, []);

  const openDrives = drives.filter(d => d.status === "OPEN");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Welcome back</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Student Home</h1>
        {studentId && (
          <p className="mono text-xs text-[var(--text-muted)] mt-1">Session ID: {studentId}</p>
        )}
      </motion.div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/student/profile", icon: ShieldCheck, label: "Profile", color: "var(--accent-cyan)" },
          { href: "/student/drives", icon: Briefcase, label: "Browse Drives", color: "var(--accent-cyan)" },
          { href: "/student/applications", icon: FileText, label: "My Applications", color: "var(--accent-amber)" },
          { href: "/student/chat", icon: Sparkles, label: "AI Assistant", color: "var(--accent-purple)" },
        ].map(({ href, icon: Icon, label, color }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
          >
            <Link
              href={href}
              className="card flex flex-col items-start gap-2 p-4 hover:border-[var(--border-strong)] transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Open drives feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Open Drives</h2>
          <Link
            href="/student/drives"
            className="text-xs text-[var(--accent-cyan)] hover:opacity-80 flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading && <SkeletonList count={3} />}

        {error && (
          <div className="card p-6 text-center">
            <p className="text-sm text-[var(--accent-rose)]">{error}</p>
          </div>
        )}

        {!loading && !error && openDrives.length === 0 && (
          <div className="card p-10 text-center">
            <Briefcase size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No open drives yet</p>
            <p className="text-xs text-[var(--text-muted)]">Check back when coordinators publish placement drives.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {openDrives.slice(0, 5).map((drive, i) => (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <DriveListItem drive={drive} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DriveListItem({ drive }: { drive: DriveResponse }) {
  return (
    <Link href={`/student/drives/${drive.id}`} className="card block p-5 hover:border-[var(--border-strong)] transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{drive.id}</p>
          <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)] transition-colors">
            {drive.role}
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            <span className="text-xs text-[var(--text-muted)]">{drive.location || "Remote"}</span>
            {drive.packageOffered && (
              <span className="text-xs text-[var(--accent-emerald)]">{drive.packageOffered}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {drive.requiredSkills.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                {s}
              </span>
            ))}
            {drive.requiredSkills.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)]">+{drive.requiredSkills.length - 3}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(52,211,153,0.1)] text-[var(--accent-emerald)]">
            OPEN
          </span>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Closes {formatDateOnly(drive.deadline)}
          </p>
        </div>
      </div>
    </Link>
  );
}

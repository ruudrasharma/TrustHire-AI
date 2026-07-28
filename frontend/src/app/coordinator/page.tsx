"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Building2, Briefcase, FileText, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { drivesApi, companiesApi, applicationsApi } from "@/lib/api";
import type { ApplicationResponse, DriveResponse } from "@/lib/types";
import { statusBg, formatDate } from "@/lib/utils";

export default function CoordinatorConsolePage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [drives, setDrives] = useState<DriveResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationsApi.getAll().catch(() => []),
      drivesApi.getAll().catch(() => []),
    ]).then(([apps, drvs]) => {
      setApplications(apps);
      setDrives(drvs);
    }).finally(() => setLoading(false));
  }, []);

  const openDrives = drives.filter(d => d.status === "OPEN");
  const pendingApps = applications.filter(a => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW");

  const stats = [
    { label: "Total Drives", value: drives.length, icon: Briefcase, color: "var(--accent-purple)" },
    { label: "Open Drives", value: openDrives.length, icon: TrendingUp, color: "var(--accent-emerald)" },
    { label: "Applications", value: applications.length, icon: FileText, color: "var(--accent-cyan)" },
    { label: "Pending Review", value: pendingApps.length, icon: LayoutDashboard, color: "var(--accent-amber)" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Coordinator</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Console</h1>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <Icon size={16} style={{ color }} />
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {loading ? "—" : value}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: "/coordinator/companies", label: "Manage Companies", icon: Building2, color: "var(--accent-purple)" },
            { href: "/coordinator/drives", label: "Manage Drives", icon: Briefcase, color: "var(--accent-cyan)" },
            { href: "/coordinator/applications", label: "Review Applications", icon: FileText, color: "var(--accent-amber)" },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="card flex items-center justify-between p-4 hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
              </div>
              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Applications</h2>
          <Link href="/coordinator/applications" className="text-xs text-[var(--accent-purple)] hover:opacity-80 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {!loading && applications.length === 0 && (
          <div className="card p-10 text-center">
            <FileText size={28} className="text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No applications yet. Students will appear here after applying.</p>
          </div>
        )}

        <div className="space-y-2">
          {applications.slice(0, 5).map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
            >
              <Link
                href={`/coordinator/applications`}
                className="card flex items-center justify-between p-4 hover:border-[var(--border-strong)] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="mono text-xs text-[var(--text-muted)]">{app.id}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">·</span>
                    <span className="mono text-xs text-[var(--text-muted)]">{app.studentId}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(app.submittedAt)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${statusBg(app.status)}`}>
                  {app.status.replace("_", " ")}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

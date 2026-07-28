"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Briefcase } from "lucide-react";
import Link from "next/link";
import { drivesApi } from "@/lib/api";
import type { DriveResponse } from "@/lib/types";
import { formatDateOnly } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";

export default function DrivesPage() {
  const [drives, setDrives] = useState<DriveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "CLOSED">("OPEN");

  useEffect(() => {
    drivesApi.getAll()
      .then(setDrives)
      .catch(() => setError("Failed to load drives"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = drives
    .filter(d => filterStatus === "ALL" || d.status === filterStatus)
    .filter(d =>
      search === "" ||
      d.role.toLowerCase().includes(search.toLowerCase()) ||
      d.location?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Browse Drives</h1>
        <p className="text-sm text-[var(--text-muted)]">Explore placement opportunities and check your eligibility.</p>
      </motion.div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id="drives-search"
            type="text"
            placeholder="Search by role or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-1">
          {(["ALL", "OPEN", "CLOSED"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-[var(--surface-2)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-xs text-[var(--text-muted)]">
          {filtered.length} drive{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* List */}
      {loading && <SkeletonList count={5} />}

      {error && (
        <div className="card p-8 text-center">
          <p className="text-[var(--accent-rose)] text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Briefcase size={36} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--text-primary)] mb-1">No drives found</p>
          <p className="text-sm text-[var(--text-muted)]">
            {search ? "Try a different search term." : "No drives have been published yet."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((drive, i) => (
          <motion.div
            key={drive.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/student/drives/${drive.id}`}
              className="card block p-5 hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{drive.id}</p>
                  <h2 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                    {drive.role}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
                    <span>{drive.location || "Remote"}</span>
                    {drive.packageOffered && <span className="text-[var(--accent-emerald)]">{drive.packageOffered}</span>}
                    <span>Min CGPA: {drive.minCgpa}</span>
                    <span>Max Backlogs: {drive.maxActiveBacklogs}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {drive.requiredSkills.slice(0, 4).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                        {s}
                      </span>
                    ))}
                    {drive.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-[var(--text-muted)]">+{drive.requiredSkills.length - 4} more</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    drive.status === "OPEN"
                      ? "bg-[rgba(52,211,153,0.1)] text-[var(--accent-emerald)]"
                      : "bg-[rgba(156,163,175,0.1)] text-[var(--text-muted)]"
                  }`}>
                    {drive.status}
                  </span>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Closes {formatDateOnly(drive.deadline)}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock } from "lucide-react";
import Link from "next/link";
import { studentsApi } from "@/lib/api";
import type { ApplicationResponse } from "@/lib/types";
import { formatDate, statusBg } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";

const STUDENT_ID_KEY = "th_student_id";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId = localStorage.getItem(STUDENT_ID_KEY) || "STU-001";
    studentsApi.getApplications(studentId)
      .then(setApplications)
      .catch(e => {
        // 404 means student has no applications yet
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">My Applications</h1>
        <p className="text-sm text-[var(--text-muted)]">Track all your placement applications and their status.</p>
      </motion.div>

      {loading && <SkeletonList count={3} />}

      {error && (
        <div className="card p-8 text-center">
          <p className="text-[var(--accent-rose)] text-sm">{error}</p>
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="card p-14 text-center">
          <FileText size={36} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--text-primary)] mb-1">No applications yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Browse drives and apply to get started.
          </p>
          <Link
            href="/student/drives"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(34,211,238,0.1)] text-[var(--accent-cyan)] border border-[rgba(34,211,238,0.2)] hover:bg-[rgba(34,211,238,0.15)] transition-colors"
          >
            Browse Drives →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {applications.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/student/applications/${app.id}`}
              className="card block p-5 hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{app.id}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                    Drive: <span className="mono">{app.driveId}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-[var(--text-muted)]">
                    <Clock size={11} />
                    Applied {formatDate(app.submittedAt)}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBg(app.status)}`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, ShieldCheck, Loader2 } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { ApiException } from "@/lib/api";
import type { ApplicationResponse, ApplicationStatus, AuditEventResponse } from "@/lib/types";
import { formatDate, statusBg, statusColor } from "@/lib/utils";
import HashChainTimeline from "@/components/HashChainTimeline";
import { SkeletonList } from "@/components/Skeleton";

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED:    ["UNDER_REVIEW", "REJECTED", "WITHDRAWN"],
  UNDER_REVIEW: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED:  ["SELECTED", "REJECTED"],
  SELECTED:     [],
  REJECTED:     [],
  WITHDRAWN:    [],
};

export default function CoordinatorApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [auditChains, setAuditChains] = useState<Record<string, AuditEventResponse[]>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "ALL">("ALL");

  useEffect(() => {
    applicationsApi.getAll()
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  async function loadAuditChain(id: string) {
    if (auditChains[id]) return;
    const chain = await applicationsApi.getAuditChain(id).catch(() => []);
    setAuditChains(prev => ({ ...prev, [id]: chain }));
  }

  async function handleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      await loadAuditChain(id);
    }
  }

  async function handleStatusUpdate(appId: string, newStatus: ApplicationStatus) {
    setUpdating(appId);
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      // Reload audit chain for this application
      const chain = await applicationsApi.getAuditChain(appId).catch(() => []);
      setAuditChains(prev => ({ ...prev, [appId]: chain }));
    } catch (e) {
      const msg = e instanceof ApiException ? e.error.message : "Failed to update status";
      alert(msg);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = applications.filter(a => filterStatus === "ALL" || a.status === filterStatus);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Applications Review</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Update application statuses. Every change is recorded in the tamper-evident hash chain.
        </p>
      </motion.div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["ALL", "SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "SELECTED", "REJECTED", "WITHDRAWN"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filterStatus === s
                ? "bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-strong)]"
                : "bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading && <SkeletonList count={5} />}

      {!loading && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <FileText size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No applications</p>
          <p className="text-xs text-[var(--text-muted)]">
            {filterStatus === "ALL" ? "No applications submitted yet." : `No applications in ${filterStatus} state.`}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((app, i) => {
          const isExpanded = expandedId === app.id;
          const transitions = VALID_TRANSITIONS[app.status] ?? [];

          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="card overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => handleExpand(app.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-[var(--surface-2)] transition-colors text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="mono text-xs font-medium text-[var(--text-primary)]">{app.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBg(app.status)}`}>
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
                        <span>Student: <span className="mono">{app.studentId}</span></span>
                        <span>Drive: <span className="mono">{app.driveId}</span></span>
                        <span>{formatDate(app.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--text-muted)] transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--border)] p-5 space-y-5">
                        {/* Status update actions */}
                        {transitions.length > 0 && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                              Update Status
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {transitions.map(t => (
                                <motion.button
                                  key={t}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleStatusUpdate(app.id, t)}
                                  disabled={updating === app.id}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all disabled:opacity-50 ${
                                    t === "SELECTED"
                                      ? "bg-[rgba(52,211,153,0.08)] text-[var(--accent-emerald)] border-[rgba(52,211,153,0.25)] hover:bg-[rgba(52,211,153,0.14)]"
                                      : t === "REJECTED"
                                      ? "bg-[rgba(251,113,133,0.08)] text-[var(--accent-rose)] border-[rgba(251,113,133,0.25)] hover:bg-[rgba(251,113,133,0.14)]"
                                      : "bg-[rgba(34,211,238,0.08)] text-[var(--accent-cyan)] border-[rgba(34,211,238,0.25)] hover:bg-[rgba(34,211,238,0.14)]"
                                  }`}
                                >
                                  {updating === app.id
                                    ? <Loader2 size={11} className="animate-spin" />
                                    : <ShieldCheck size={11} />
                                  }
                                  → {t.replace("_", " ")}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {transitions.length === 0 && (
                          <p className="text-xs text-[var(--text-muted)] italic">
                            This application is in a terminal state — no further transitions possible.
                          </p>
                        )}

                        {/* Hash chain timeline */}
                        <div>
                          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                            Audit Chain
                          </p>
                          {auditChains[app.id]
                            ? <HashChainTimeline events={auditChains[app.id]} applicationId={app.id} />
                            : <p className="text-xs text-[var(--text-muted)]">Loading chain…</p>
                          }
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldX } from "lucide-react";
import { formatDate, truncateHash } from "@/lib/utils";
import type { AuditEventResponse } from "@/lib/types";

interface HashChainTimelineProps {
  events: AuditEventResponse[];
  applicationId: string;
  chainValid?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED:    "Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED:  "Shortlisted",
  SELECTED:     "Selected",
  REJECTED:     "Rejected",
  WITHDRAWN:    "Withdrawn",
};

export default function HashChainTimeline({
  events,
  applicationId,
  chainValid = true,
}: HashChainTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[var(--text-muted)]">No status transitions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Chain integrity badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-4 ${
        chainValid
          ? "bg-[rgba(52,211,153,0.08)] text-[var(--accent-emerald)] border border-[rgba(52,211,153,0.2)]"
          : "bg-[rgba(251,113,133,0.08)] text-[var(--accent-rose)] border border-[rgba(251,113,133,0.2)]"
      }`}>
        {chainValid
          ? <ShieldCheck size={13} />
          : <ShieldX size={13} />
        }
        <span>{chainValid ? "Hash chain integrity verified" : "Chain integrity FAILED"}</span>
      </div>

      {events.map((event, idx) => (
        <div key={event.hash} className="flex gap-3">
          {/* Chain line + node */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.08, type: "spring", stiffness: 300, damping: 20 }}
              className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                chainValid
                  ? "border-[var(--accent-cyan)] bg-[rgba(34,211,238,0.2)]"
                  : "border-[var(--accent-rose)] bg-[rgba(251,113,133,0.2)]"
              }`}
            />
            {idx < events.length - 1 && (
              <div className={`w-0.5 flex-1 mt-1 mb-0 min-h-[32px] ${
                chainValid ? "bg-[var(--accent-cyan)] opacity-25" : "bg-[var(--accent-rose)] opacity-30"
              }`} />
            )}
          </div>

          {/* Event card */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="flex-1 pb-4"
          >
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3">
              {/* Status transition */}
              <div className="flex items-center gap-2 text-xs font-medium mb-2">
                <span className="text-[var(--text-muted)]">
                  {STATUS_LABELS[event.fromStatus] || event.fromStatus}
                </span>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="text-[var(--text-primary)]">
                  {STATUS_LABELS[event.toStatus] || event.toStatus}
                </span>
              </div>

              {/* Timestamp */}
              <p className="text-[10px] text-[var(--text-muted)] mb-2">
                {formatDate(event.timestamp)}
              </p>

              {/* Hash data */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider w-16">prevHash</span>
                  <span className="mono text-[9px] text-[var(--text-muted)] truncate">
                    {truncateHash(event.prevHash, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider w-16">hash</span>
                  <span className="mono text-[9px] text-[var(--accent-cyan)] truncate">
                    {truncateHash(event.hash, 8)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

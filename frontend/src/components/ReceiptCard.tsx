"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldX, Loader2, Download } from "lucide-react";
import { verifyApi } from "@/lib/api";
import type { ReceiptResponse } from "@/lib/types";
import { formatDate, truncateHash } from "@/lib/utils";

interface ReceiptCardProps {
  receipt: ReceiptResponse;
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; reason?: string | null } | null>(null);

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await verifyApi.verify(receipt);
      setVerifyResult(result);
    } catch {
      setVerifyResult({ valid: false, reason: "Verification request failed" });
    } finally {
      setVerifying(false);
    }
  }

  function handleDownload() {
    const json = JSON.stringify(receipt, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.applicationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const STATUS_COLORS: Record<string, string> = {
    SELECTED:    "text-[var(--accent-emerald)]",
    SHORTLISTED: "text-[var(--accent-cyan)]",
    SUBMITTED:   "text-[var(--accent-cyan)]",
    UNDER_REVIEW:"text-[var(--accent-amber)]",
    REJECTED:    "text-[var(--accent-rose)]",
    WITHDRAWN:   "text-[var(--text-muted)]",
  };

  return (
    <div className="relative">
      {/* Perforated receipt card */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {/* Header stripe */}
        <div className="bg-[rgba(34,211,238,0.06)] border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Application Receipt
              </p>
              <p className="mono text-xs text-[var(--accent-cyan)] font-medium">
                {receipt.applicationId}
              </p>
            </div>
            <div className={`text-right`}>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Status</p>
              <p className={`text-sm font-semibold ${STATUS_COLORS[receipt.status] ?? "text-[var(--text-muted)]"}`}>
                {receipt.status}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="border-b border-dashed border-[var(--border-strong)] mx-4" />

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <ReceiptRow label="Student" value={receipt.studentId} mono />
          <ReceiptRow label="Drive" value={receipt.driveId} mono />
          <ReceiptRow label="Issued" value={formatDate(receipt.issuedAt)} />

          {receipt.chainTipHash && (
            <div>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Chain Tip Hash</p>
              <p className="mono text-[10px] text-[var(--accent-cyan)] break-all leading-5">
                {truncateHash(receipt.chainTipHash, 16)}
              </p>
            </div>
          )}

          <div>
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Signature</p>
            <p className="mono text-[10px] text-[var(--text-muted)] break-all leading-5">
              {truncateHash(receipt.signature, 16)}
            </p>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="border-t border-dashed border-[var(--border-strong)] mx-4" />

        {/* Actions */}
        <div className="px-5 py-4 flex gap-2">
          <motion.button
            onClick={handleVerify}
            disabled={verifying}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium bg-[rgba(34,211,238,0.1)] text-[var(--accent-cyan)] border border-[rgba(34,211,238,0.2)] hover:bg-[rgba(34,211,238,0.15)] transition-colors disabled:opacity-60"
          >
            {verifying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}
            {verifying ? "Verifying…" : "Verify"}
          </motion.button>

          <motion.button
            onClick={handleDownload}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm bg-[var(--surface-1)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Download receipt JSON"
          >
            <Download size={14} />
          </motion.button>
        </div>

        {/* Verification result */}
        <AnimatePresence>
          {verifyResult && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`mx-5 mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                verifyResult.valid
                  ? "bg-[rgba(52,211,153,0.08)] text-[var(--accent-emerald)] border border-[rgba(52,211,153,0.2)]"
                  : "bg-[rgba(251,113,133,0.08)] text-[var(--accent-rose)] border border-[rgba(251,113,133,0.2)]"
              }`}>
                {verifyResult.valid
                  ? <><ShieldCheck size={14} /> Receipt is valid — signature verified</>
                  : <><ShieldX size={14} /> {verifyResult.reason || "Signature mismatch"}</>
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider flex-shrink-0 mt-0.5">
        {label}
      </span>
      <span className={`text-xs text-[var(--text-primary)] text-right ${mono ? "mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

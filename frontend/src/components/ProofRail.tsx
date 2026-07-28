"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldX, ChevronDown, ChevronUp, Link2Off } from "lucide-react";
import { useState } from "react";
import type { EligibilityResponse, AuditEventResponse, ReceiptResponse } from "@/lib/types";
import { truncateHash, formatDate } from "@/lib/utils";
import HashChainTimeline from "./HashChainTimeline";
import ReceiptCard from "./ReceiptCard";

type ProofRailMode =
  | { type: "eligibility"; data: EligibilityResponse }
  | { type: "auditChain"; data: AuditEventResponse[]; applicationId: string }
  | { type: "receipt"; data: ReceiptResponse }
  | { type: "empty" };

interface ProofRailProps {
  mode: ProofRailMode;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ProofRail({ mode, isOpen, onToggle }: ProofRailProps) {
  return (
    <>
      {/* Desktop: collapsible right panel */}
      <div className="hidden lg:block">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.aside
              key="proof-rail"
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-[360px] glass border-l border-[var(--border)] z-40 flex flex-col overflow-hidden"
              aria-label="Proof Rail — verification panel"
            >
              <ProofRailContent mode={mode} onClose={onToggle} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <motion.button
          onClick={onToggle}
          className={`fixed top-6 right-0 z-50 flex items-center gap-2 px-3 py-2 rounded-l-xl glass border border-r-0 border-[var(--border)] text-xs font-medium transition-colors ${
            isOpen
              ? "text-[var(--accent-cyan)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          aria-expanded={isOpen}
          aria-label="Toggle Proof Rail"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.96 }}
        >
          <ShieldCheck size={14} />
          {isOpen ? "Close" : "Proof Rail"}
        </motion.button>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="lg:hidden">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                onClick={onToggle}
              />
              <motion.aside
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 h-[70vh] glass border-t border-[var(--border)] z-50 rounded-t-2xl flex flex-col overflow-hidden"
              >
                <div className="w-12 h-1 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-2" />
                <ProofRailContent mode={mode} onClose={onToggle} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ProofRailContent({
  mode,
  onClose,
}: {
  mode: ProofRailMode;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--accent-cyan)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Proof Rail</span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
          aria-label="Close Proof Rail"
        >
          <ChevronUp size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {mode.type === "eligibility" && <EligibilityProof data={mode.data} />}
        {mode.type === "auditChain" && (
          <HashChainTimeline events={mode.data} applicationId={mode.applicationId} />
        )}
        {mode.type === "receipt" && <ReceiptCard receipt={mode.data} />}
        {mode.type === "empty" && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Select an eligibility result, application, or receipt to see its verification proof here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EligibilityProof({ data }: { data: EligibilityResponse }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className={`rounded-xl p-4 border ${
        data.eligible
          ? "bg-[rgba(52,211,153,0.06)] border-[rgba(52,211,153,0.2)]"
          : "bg-[rgba(251,113,133,0.06)] border-[rgba(251,113,133,0.2)]"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {data.eligible
            ? <ShieldCheck size={16} className="text-[var(--accent-emerald)]" />
            : <ShieldX size={16} className="text-[var(--accent-rose)]" />
          }
          <span className={`text-sm font-semibold ${
            data.eligible ? "text-[var(--accent-emerald)]" : "text-[var(--accent-rose)]"
          }`}>
            {data.eligible ? "Eligible ✓" : "Not Eligible"}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Result is cryptographically signed and tamper-evident
        </p>
      </div>

      {/* Reasons */}
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Reasons</p>
        <ul className="space-y-2">
          {data.reasons.map((reason, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 text-sm"
            >
              {data.eligible
                ? <span className="text-[var(--accent-emerald)] mt-0.5">✓</span>
                : <span className="text-[var(--accent-rose)] mt-0.5">✕</span>
              }
              <span className="text-[var(--text-primary)]">{reason}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Signature */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <span className="uppercase tracking-wider font-medium">HMAC Signature</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {!expanded && (
          <div className="mono text-xs bg-[var(--surface-2)] rounded-lg px-3 py-2 text-[var(--accent-cyan)] border border-[var(--border)]">
            {truncateHash(data.signature)}
          </div>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mono text-[10px] bg-[var(--surface-2)] rounded-lg px-3 py-2 text-[var(--accent-cyan)] border border-[var(--border)] break-all leading-5">
                {data.signature}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

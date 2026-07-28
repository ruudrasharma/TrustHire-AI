"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, ChevronDown } from "lucide-react";
import { useState } from "react";
import { truncateHash } from "@/lib/utils";

interface SignatureBadgeProps {
  signature: string;
  valid: boolean;
  label?: string;
}

export default function SignatureBadge({
  signature,
  valid,
  label,
}: SignatureBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          valid
            ? "bg-[rgba(52,211,153,0.08)] text-[var(--accent-emerald)] border-[rgba(52,211,153,0.2)] hover:bg-[rgba(52,211,153,0.12)]"
            : "bg-[rgba(251,113,133,0.08)] text-[var(--accent-rose)] border-[rgba(251,113,133,0.2)] hover:bg-[rgba(251,113,133,0.12)]"
        }`}
        aria-expanded={expanded}
        aria-label={`${label || "Signature"}: ${valid ? "verified" : "invalid"}. Click to ${expanded ? "collapse" : "expand"}.`}
      >
        {valid
          ? <ShieldCheck size={11} />
          : <ShieldX size={11} />
        }
        <span>{valid ? "Verified ✓" : "Signature Invalid"}</span>
        <span className="mono opacity-70">{truncateHash(signature, 6)}</span>
        <ChevronDown
          size={10}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </motion.button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 mono text-[10px] bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 break-all text-[var(--text-muted)] leading-5 max-w-sm"
        >
          {signature}
        </motion.div>
      )}
    </div>
  );
}

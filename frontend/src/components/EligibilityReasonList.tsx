"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface EligibilityReasonListProps {
  reasons: string[];
  eligible: boolean;
}

export default function EligibilityReasonList({
  reasons,
  eligible,
}: EligibilityReasonListProps) {
  return (
    <ul className="space-y-2" role="list" aria-label="Eligibility reasons">
      {reasons.map((reason, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: i * 0.06,
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="flex items-start gap-3"
        >
          <span className="flex-shrink-0 mt-0.5">
            {eligible ? (
              <CheckCircle2 size={15} className="text-[var(--accent-emerald)]" />
            ) : (
              <XCircle size={15} className="text-[var(--accent-rose)]" />
            )}
          </span>
          <span className="text-sm text-[var(--text-primary)] leading-relaxed">{reason}</span>
        </motion.li>
      ))}
    </ul>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import type { ReceiptResponse } from "@/lib/types";
import ReceiptCard from "@/components/ReceiptCard";
import ProofRail from "@/components/ProofRail";
import { SkeletonCard } from "@/components/Skeleton";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofOpen, setProofOpen] = useState(true);

  useEffect(() => {
    applicationsApi.getReceipt(id)
      .then(setReceipt)
      .catch(() => setError("Could not issue receipt"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft size={14} /> Back to Application
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Verifiable Receipt</h1>
        <p className="text-sm text-[var(--text-muted)]">
          This receipt is cryptographically signed. Share it with a recruiter — they can verify it independently without accessing the system.
        </p>
      </motion.div>

      {loading && <SkeletonCard className="h-72" />}

      {error && (
        <div className="card p-8 text-center">
          <p className="text-[var(--accent-rose)]">{error}</p>
        </div>
      )}

      {receipt && (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ReceiptCard receipt={receipt} />
          </motion.div>

          <ProofRail
            mode={{ type: "receipt", data: receipt }}
            isOpen={proofOpen}
            onToggle={() => setProofOpen(p => !p)}
          />
        </>
      )}
    </div>
  );
}

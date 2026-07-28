"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import type { ApplicationResponse, AuditEventResponse } from "@/lib/types";
import { formatDate, statusBg } from "@/lib/utils";
import HashChainTimeline from "@/components/HashChainTimeline";
import ProofRail from "@/components/ProofRail";
import { SkeletonCard } from "@/components/Skeleton";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationResponse | null>(null);
  const [auditChain, setAuditChain] = useState<AuditEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofOpen, setProofOpen] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationsApi.getById(id),
      applicationsApi.getAuditChain(id),
    ]).then(([app, chain]) => {
      setApplication(app);
      setAuditChain(chain);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-4">
      <SkeletonCard className="h-40" />
      <SkeletonCard className="h-64" />
    </div>
  );

  if (!application) return (
    <div className="card p-12 text-center">
      <p className="text-[var(--accent-rose)]">Application not found</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      {/* Application header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{application.id}</p>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Application Detail</h1>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusBg(application.status)}`}>
            {application.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Student ID", value: application.studentId, mono: true },
            { label: "Drive ID", value: application.driveId, mono: true },
            { label: "Applied At", value: formatDate(application.submittedAt) },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-[var(--surface-2)] rounded-xl p-3">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-sm font-medium text-[var(--text-primary)] ${mono ? "font-mono" : ""}`}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Inline audit chain (mobile / when Proof Rail is closed) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Status Timeline</h2>
          <button
            onClick={() => setProofOpen(p => !p)}
            className="flex items-center gap-1.5 text-xs text-[var(--accent-cyan)] hover:opacity-80"
          >
            <ShieldCheck size={12} />
            {proofOpen ? "Hide" : "Show"} chain proof
          </button>
        </div>
        {auditChain.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No status changes recorded yet.</p>
        ) : (
          <HashChainTimeline events={auditChain} applicationId={id} />
        )}
      </motion.div>

      {/* Receipt link */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-2">Verifiable Receipt</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Download a signed proof of your current application status that anyone can verify independently.
        </p>
        <Link
          href={`/student/applications/${id}/receipt`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(34,211,238,0.1)] text-[var(--accent-cyan)] border border-[rgba(34,211,238,0.2)] hover:bg-[rgba(34,211,238,0.15)] transition-colors"
        >
          <FileText size={14} /> View Receipt
        </Link>
      </motion.div>

      {/* Proof Rail showing hash chain */}
      <ProofRail
        mode={{ type: "auditChain", data: auditChain, applicationId: id }}
        isOpen={proofOpen}
        onToggle={() => setProofOpen(p => !p)}
      />
    </div>
  );
}

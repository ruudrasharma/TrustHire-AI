"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldX, Loader2, CheckCircle2,
  ArrowLeft, MapPin, Briefcase, Clock, Star
} from "lucide-react";
import { drivesApi } from "@/lib/api";
import { ApiException } from "@/lib/api";
import type { DriveResponse, EligibilityResponse } from "@/lib/types";
import { formatDateOnly } from "@/lib/utils";
import EligibilityReasonList from "@/components/EligibilityReasonList";
import SignatureBadge from "@/components/SignatureBadge";
import ProofRail from "@/components/ProofRail";
import { SkeletonCard } from "@/components/Skeleton";

const STUDENT_ID_KEY = "th_student_id";

export default function DriveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [drive, setDrive] = useState<DriveResponse | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [proofOpen, setProofOpen] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem(STUDENT_ID_KEY) || "STU-001";
    setStudentId(sid);
    drivesApi.getById(id).then(setDrive).catch(() => setError("Drive not found")).finally(() => setLoading(false));
  }, [id]);

  async function checkEligibility() {
    if (!studentId) return;
    setEligibilityLoading(true);
    try {
      const result = await drivesApi.checkEligibility(id, studentId);
      setEligibility(result);
      setProofOpen(true);
    } catch (e) {
      setError("Could not check eligibility");
    } finally {
      setEligibilityLoading(false);
    }
  }

  async function handleApply() {
    setApplying(true);
    setApplyError(null);
    try {
      await drivesApi.apply(id, studentId);
      setApplied(true);
      router.push(`/student/applications?applied=${id}`);
    } catch (e) {
      if (e instanceof ApiException) setApplyError(e.error.message);
      else setApplyError("Failed to submit application");
    } finally {
      setApplying(false);
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-32" />
    </div>
  );

  if (error || !drive) return (
    <div className="card p-12 text-center">
      <p className="text-[var(--accent-rose)]">{error || "Drive not found"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft size={14} /> Back to Drives
      </button>

      {/* Drive header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{drive.id}</p>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{drive.role}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            drive.status === "OPEN"
              ? "bg-[rgba(52,211,153,0.1)] text-[var(--accent-emerald)]"
              : "bg-[rgba(156,163,175,0.1)] text-[var(--text-muted)]"
          }`}>
            {drive.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { icon: MapPin, label: drive.location || "Remote" },
            { icon: Star, label: drive.packageOffered || "Not disclosed" },
            { icon: Clock, label: `Closes ${formatDateOnly(drive.deadline)}` },
            { icon: Briefcase, label: `Min CGPA ${drive.minCgpa}` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Icon size={13} className="flex-shrink-0" />
              {label}
            </div>
          ))}
        </div>

        {/* Required skills */}
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {drive.requiredSkills.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)]">
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Eligibility criteria */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Eligibility Criteria</h2>
        <div className="grid grid-cols-2 gap-3">
          <CriteriaRow label="Min CGPA" value={String(drive.minCgpa)} />
          <CriteriaRow label="Max Backlogs" value={String(drive.maxActiveBacklogs)} />
          <CriteriaRow label="Min Grad Year" value={String(drive.minGraduationYear || "Any")} />
          <CriteriaRow label="Programmes" value={drive.eligibleProgrammes?.join(", ") || "All"} />
        </div>
      </motion.div>

      {/* Eligibility check */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--text-primary)]">Eligibility Check</h2>
          {eligibility && <SignatureBadge signature={eligibility.signature} valid={true} label="Result" />}
        </div>

        {!eligibility && (
          <button
            id="check-eligibility-btn"
            onClick={checkEligibility}
            disabled={eligibilityLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all disabled:opacity-60"
          >
            {eligibilityLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {eligibilityLoading ? "Checking…" : "Check My Eligibility"}
          </button>
        )}

        {eligibility && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`flex items-center gap-2 p-4 rounded-xl mb-4 ${
              eligibility.eligible
                ? "bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.2)]"
                : "bg-[rgba(251,113,133,0.06)] border border-[rgba(251,113,133,0.2)]"
            }`}>
              {eligibility.eligible
                ? <ShieldCheck size={18} className="text-[var(--accent-emerald)]" />
                : <ShieldX size={18} className="text-[var(--accent-rose)]" />
              }
              <span className={`font-semibold ${eligibility.eligible ? "text-[var(--accent-emerald)]" : "text-[var(--accent-rose)]"}`}>
                {eligibility.eligible ? "You are eligible!" : "Not eligible for this drive"}
              </span>
            </div>

            <EligibilityReasonList reasons={eligibility.reasons} eligible={eligibility.eligible} />

            {!eligibility.eligible && (
              <div className="mt-4">
                <button
                  onClick={() => router.push(`/student/chat?driveId=${id}&intent=eligibility`)}
                  className="text-sm text-[var(--accent-purple)] hover:opacity-80 flex items-center gap-1"
                >
                  Ask the AI assistant how to improve eligibility →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Apply */}
      {eligibility?.eligible && !applied && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">Apply Now</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            You're eligible. Submit your application for the {drive.role} role.
          </p>
          {applyError && (
            <p className="text-sm text-[var(--accent-rose)] mb-3">{applyError}</p>
          )}
          <button
            id="apply-btn"
            onClick={handleApply}
            disabled={applying}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent-cyan)] text-[#0B0D10] hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {applying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {applying ? "Submitting…" : "Submit Application"}
          </button>
        </motion.div>
      )}

      {/* Proof Rail */}
      {eligibility && (
        <ProofRail
          mode={{ type: "eligibility", data: eligibility }}
          isOpen={proofOpen}
          onToggle={() => setProofOpen(p => !p)}
        />
      )}
    </div>
  );
}

function CriteriaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] rounded-xl p-3">
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

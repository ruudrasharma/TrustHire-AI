/**
 * lib/utils.ts — Shared utility functions
 */

import type { ApplicationStatus } from "./types";

/** Format an ISO timestamp to a human-readable short form */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

/** Format just the date portion */
export function formatDateOnly(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(iso));
}

/** Truncate a hash/signature for display */
export function truncateHash(hash: string, chars = 12): string {
  if (!hash) return "";
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}

/** Status → color class */
export function statusColor(status: ApplicationStatus): string {
  switch (status) {
    case "SUBMITTED":   return "text-[var(--accent-cyan)]";
    case "UNDER_REVIEW": return "text-[var(--accent-amber)]";
    case "SHORTLISTED": return "text-[var(--accent-cyan)]";
    case "SELECTED":    return "text-[var(--accent-emerald)]";
    case "REJECTED":    return "text-[var(--accent-rose)]";
    case "WITHDRAWN":   return "text-[var(--text-muted)]";
    default:            return "text-[var(--text-muted)]";
  }
}

/** Status → background pill class */
export function statusBg(status: ApplicationStatus): string {
  switch (status) {
    case "SUBMITTED":   return "bg-[rgba(34,211,238,0.1)] text-[var(--accent-cyan)]";
    case "UNDER_REVIEW": return "bg-[rgba(251,191,36,0.1)] text-[var(--accent-amber)]";
    case "SHORTLISTED": return "bg-[rgba(34,211,238,0.12)] text-[var(--accent-cyan)]";
    case "SELECTED":    return "bg-[rgba(52,211,153,0.1)] text-[var(--accent-emerald)]";
    case "REJECTED":    return "bg-[rgba(251,113,133,0.1)] text-[var(--accent-rose)]";
    case "WITHDRAWN":   return "bg-[rgba(156,163,175,0.1)] text-[var(--text-muted)]";
    default:            return "bg-[rgba(156,163,175,0.1)] text-[var(--text-muted)]";
  }
}

/** Generate a student/coordinator ID stored in localStorage (no real auth) */
export function getOrCreateStudentId(): string {
  const stored = localStorage.getItem("th_student_id");
  if (stored) return stored;
  const id = `STU-${String(Math.floor(Math.random() * 900) + 100)}`;
  localStorage.setItem("th_student_id", id);
  return id;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

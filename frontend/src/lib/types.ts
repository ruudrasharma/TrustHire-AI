/**
 * lib/types.ts — TypeScript types mirroring backend DTOs exactly.
 * Update whenever a backend DTO changes — don't let them drift.
 */

// ─── Student ────────────────────────────────────────────────
export interface StudentResponse {
  id: string;
  name: string;
  email: string;
  programme: string;
  graduationYear: number;
  skills: string[];
}

export interface StudentCreateRequest {
  name: string;
  email: string;
  programme: string;
  graduationYear: number;
  cgpa: number;
  activeBacklogs: number;
  skills: string[];
}

export interface StudentUpdateRequest {
  name?: string;
  programme?: string;
  graduationYear?: number;
  cgpa?: number;
  activeBacklogs?: number;
  skills?: string[];
}

// ─── Company ─────────────────────────────────────────────────
export interface CompanyResponse {
  id: string;
  name: string;
  sector: string;
  description: string;
}

export interface CompanyCreateRequest {
  name: string;
  sector?: string;
  description?: string;
}

// ─── Drive ───────────────────────────────────────────────────
export interface DriveResponse {
  id: string;
  companyId: string;
  role: string;
  location: string;
  packageOffered: string;
  deadline: string; // ISO-8601
  status: "OPEN" | "CLOSED";
  requiredSkills: string[];
  minCgpa: number;
  maxActiveBacklogs: number;
  eligibleProgrammes: string[];
  minGraduationYear: number;
}

export interface DriveCreateRequest {
  companyId: string;
  role: string;
  location?: string;
  packageOffered?: string;
  deadline: string; // ISO-8601
  requiredSkills?: string[];
  minCgpa?: number;
  maxActiveBacklogs?: number;
  eligibleProgrammes?: string[];
  minGraduationYear?: number;
}

// ─── Eligibility ─────────────────────────────────────────────
export interface EligibilityResponse {
  eligible: boolean;
  reasons: string[];
  signature: string;
}

// ─── Application ─────────────────────────────────────────────
export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationResponse {
  id: string;
  studentId: string;
  driveId: string;
  status: ApplicationStatus;
  submittedAt: string; // ISO-8601
}

export interface StatusUpdateResponse {
  applicationId: string;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
}

// ─── Audit ───────────────────────────────────────────────────
export interface AuditEventResponse {
  applicationId: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  timestamp: string; // ISO-8601
  prevHash: string;
  hash: string;
}

// ─── Receipt ─────────────────────────────────────────────────
export interface ReceiptResponse {
  applicationId: string;
  studentId: string;
  driveId: string;
  status: ApplicationStatus;
  chainTipHash: string | null;
  issuedAt: string;
  signature: string;
}

export interface VerifyResponse {
  valid: boolean;
  reason: string | null;
}

// ─── Chat ────────────────────────────────────────────────────
export type ChatIntent = "faq" | "eligibility" | "preparation" | "profile";

export interface ChatRequest {
  studentId: string;
  driveId?: string;
  message: string;
  intent?: ChatIntent;
}

export interface ChatResponse {
  answer: string;
  model: string;
  advisory: boolean;
}

// ─── Error ───────────────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

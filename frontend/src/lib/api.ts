/**
 * lib/api.ts — Typed API client. Single module wrapping every backend endpoint.
 * All components import from here — never fetch() directly in a component.
 * Base URL from NEXT_PUBLIC_API_BASE_URL env var only.
 */

import type {
  StudentResponse, StudentCreateRequest, StudentUpdateRequest,
  CompanyResponse, CompanyCreateRequest,
  DriveResponse, DriveCreateRequest,
  EligibilityResponse,
  ApplicationResponse, ApplicationStatus, StatusUpdateResponse,
  AuditEventResponse,
  ReceiptResponse, VerifyResponse,
  ChatRequest, ChatResponse,
  ApiError,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

class ApiException extends Error {
  constructor(public readonly error: ApiError) {
    super(error.message);
    this.name = "ApiException";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    let err: ApiError;
    try {
      err = await res.json();
    } catch {
      err = {
        timestamp: new Date().toISOString(),
        status: res.status,
        code: "UNKNOWN_ERROR",
        message: res.statusText || "Unknown error",
        path,
      };
    }
    throw new ApiException(err);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Students ────────────────────────────────────────────────
export const studentsApi = {
  create: (body: StudentCreateRequest) =>
    request<StudentResponse>("/api/students", { method: "POST", body: JSON.stringify(body) }),

  getById: (id: string) =>
    request<StudentResponse>(`/api/students/${id}`),

  getAll: () =>
    request<StudentResponse[]>("/api/students"),

  update: (id: string, body: StudentUpdateRequest) =>
    request<StudentResponse>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  getApplications: (studentId: string) =>
    request<ApplicationResponse[]>(`/api/students/${studentId}/applications`),
};

// ─── Companies ───────────────────────────────────────────────
export const companiesApi = {
  create: (body: CompanyCreateRequest) =>
    request<CompanyResponse>("/api/companies", { method: "POST", body: JSON.stringify(body) }),

  getById: (id: string) =>
    request<CompanyResponse>(`/api/companies/${id}`),

  getAll: () =>
    request<CompanyResponse[]>("/api/companies"),
};

// ─── Drives ──────────────────────────────────────────────────
export const drivesApi = {
  create: (body: DriveCreateRequest) =>
    request<DriveResponse>("/api/drives", { method: "POST", body: JSON.stringify(body) }),

  getById: (id: string) =>
    request<DriveResponse>(`/api/drives/${id}`),

  getAll: (params?: { company?: string; role?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as string[][]).toString()
      : "";
    return request<DriveResponse[]>(`/api/drives${qs}`);
  },

  checkEligibility: (driveId: string, studentId: string) =>
    request<EligibilityResponse>(`/api/drives/${driveId}/eligibility/${studentId}`),

  apply: (driveId: string, studentId: string) =>
    request<ApplicationResponse>(`/api/drives/${driveId}/applications`, {
      method: "POST",
      body: JSON.stringify({ studentId }),
    }),

  getApplications: (driveId: string) =>
    request<ApplicationResponse[]>(`/api/drives/${driveId}/applications`),
};

// ─── Applications ────────────────────────────────────────────
export const applicationsApi = {
  getById: (id: string) =>
    request<ApplicationResponse>(`/api/applications/${id}`),

  getAll: () =>
    request<ApplicationResponse[]>("/api/applications"),

  updateStatus: (id: string, newStatus: ApplicationStatus) =>
    request<StatusUpdateResponse>(`/api/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ newStatus }),
    }),

  getAuditChain: (id: string) =>
    request<AuditEventResponse[]>(`/api/applications/${id}/audit`),

  getReceipt: (id: string) =>
    request<ReceiptResponse>(`/api/applications/${id}/receipt`),
};

// ─── Verify (stateless) ──────────────────────────────────────
export const verifyApi = {
  verify: (receipt: ReceiptResponse) =>
    request<VerifyResponse>("/api/verify", { method: "POST", body: JSON.stringify(receipt) }),
};

// ─── Chat ────────────────────────────────────────────────────
export const chatApi = {
  send: (body: ChatRequest) =>
    request<ChatResponse>("/api/chat", { method: "POST", body: JSON.stringify(body) }),
};

export { ApiException };

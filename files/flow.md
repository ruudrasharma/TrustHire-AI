# Flow — TrustHire AI

Important context: this project now includes a **web frontend** (Next.js/TypeScript), in addition to the Java/Spring Boot backend. This document has two parts:
1. **API interaction flows** — the sequence of API calls per user journey. This is the contract the frontend consumes and what the sequence diagrams should mirror.
2. **Screen flow** — the actual screens the web app must implement, mapped 1:1 to the API flows. Full visual design system and build prompt in `ui-design.md`.

---

## Part 1 — API Interaction Flows (mandatory, this is the real "flow" for this project)

### Flow A — Student Profile Creation
```
[Student] 
  → POST /api/students {name, email, programme, graduationYear, cgpa, activeBacklogs, skills}
  ← 201 Created {studentId, ...} 
      OR 409 Conflict (email already exists)
      OR 400 Bad Request (validation failure)
  → GET /api/students/{studentId}
  ← 200 OK {full profile}
```

### Flow B — Coordinator Publishes a Drive
```
[Coordinator]
  → POST /api/companies {name, sector, description}
  ← 201 Created {companyId}
  → POST /api/drives {companyId, role, location, package, deadline, requiredSkills, eligibilityCriteria}
  ← 201 Created {driveId}
      OR 404 Not Found (unknown companyId)
      OR 400 Bad Request (deadline before creation date, etc.)
  → GET /api/drives?company=...&role=...  (list/filter)
  ← 200 OK [drive summaries]
```

### Flow C — Student Checks Eligibility → Applies
```
[Student]
  → GET /api/drives/{driveId}/eligibility/{studentId}
  ← 200 OK {eligible: bool, reasons: [...], signature: "..."}   (signed, no raw CGPA/backlog exposed)
  → POST /api/drives/{driveId}/applications {studentId}
  ← 201 Created {applicationId, status: SUBMITTED}
      OR 409 Conflict (duplicate application)
      OR 400/409 (ineligible, per documented contract)
      OR 404 Not Found (unknown student/drive)
```

### Flow D — Student Tracks Applications
```
[Student]
  → GET /api/students/{studentId}/applications
  ← 200 OK [application summaries]
  → GET /api/applications/{applicationId}
  ← 200 OK {full application detail + current status}
```

### Flow E — Coordinator Updates Application Status
```
[Coordinator]
  → PATCH /api/applications/{applicationId}/status {newStatus}
  ← 200 OK {applicationId, oldStatus, newStatus}
      OR 400/409 (invalid transition)
      OR 404 Not Found
  [internal, automatic] AuditTrailService.record(...) appends a hash-chained event —
  not a separate call the client makes; happens as a side effect of a successful transition.
```

### Flow F — Student Asks the AI Assistant
```
[Student]
  → POST /api/chat {studentId, driveId (optional), message}
  ← 200 OK {answer, model, advisory: true}
      OR 400 Bad Request (unsupported/malformed request)
      OR 404 Not Found (unknown studentId/driveId referenced)
      OR 503 Service Unavailable (Ollama down/timeout)
  [internal] if the question is an eligibility explanation, CareerAssistantService
  first calls EligibilityService.evaluate() → gets a *signed* EligibilityResult →
  verifies signature → only then builds the prompt for Ollama.
```

### Flow G — Failure / Degradation Path (demo-critical)
```
[Ollama stopped]
  → POST /api/chat {...}
  ← 503 Service Unavailable {code: "CHAT_SERVICE_UNAVAILABLE", ...}
  → GET /api/students/{studentId}    (unrelated endpoint)
  ← 200 OK   — proves core placement APIs are unaffected by chatbot outage (NFR-05)
```

### Flow H — Student Pulls a Verifiable Receipt (new, unique)
```
[Student]
  → GET /api/applications/{applicationId}/receipt
  ← 200 OK {applicationId, studentId, driveId, status, chainTipHash, issuedAt, signature}

[Anyone holding the receipt — recruiter, coordinator, the student themself later]
  → POST /api/verify  { ...receipt JSON... }
  ← 200 OK {valid: true}
      OR {valid: false, reason: "signature mismatch"}   (if any field was altered)
```

---

## Part 2 — Screen Flow (in-scope — see `ui-design.md` for the full visual/design system spec)

This maps 1:1 onto the API flows above. Every screen listed here must exist in the built web app.

```
[Landing / Role Select]
   ├──> [Student Login-less Entry] (no real auth — demo only)
   │        │
   │        ▼
   │   [Student Home]
   │        ├──> [Profile Screen] ──(edit)──> [Profile Update Form] ──> back to Profile Screen
   │        ├──> [Browse Drives] ──(filter by company/role/location)──> [Drive List]
   │        │        │
   │        │        ▼
   │        │   [Drive Detail] ──> [Eligibility Check] ──eligible──> [Apply Confirm] ──> [Application Submitted]
   │        │                                          └─ineligible──> [Reasons Shown] ──> [Ask AI: "how do I become eligible?"]
   │        │
   │        ├──> [My Applications] ──> [Application Detail] (status timeline, incl. audit trail view)
   │        │        └──> [Download/Share Receipt] ──> [Receipt Verified Badge] (calls POST /api/verify)
   │        │
   │        └──> [AI Career Assistant Chat] ── FAQ / Eligibility Explain / Prep Guidance / Profile Summary
   │
   └──> [Coordinator Entry] (no real auth — demo only)
            │
            ▼
       [Coordinator Home]
            ├──> [Manage Companies] ──> [New Company Form] ──> [Company Created]
            ├──> [Manage Drives] ──> [New Drive Form] (criteria builder) ──> [Drive Created]
            └──> [Applications Review] ──> [Application Detail] ──> [Status Update Action] ──> [Confirmation]
```

**Screen-to-endpoint mapping (for whoever builds the frontend later):**

| Screen | Endpoint(s) used |
|---|---|
| Profile Screen / Update Form | `GET/PUT /api/students/{id}` |
| Drive List | `GET /api/drives` |
| Drive Detail | `GET /api/drives/{id}` |
| Eligibility Check | `GET /api/drives/{driveId}/eligibility/{studentId}` |
| Apply Confirm | `POST /api/drives/{driveId}/applications` |
| My Applications | `GET /api/students/{studentId}/applications` |
| Application Detail | `GET /api/applications/{id}` |
| AI Chat | `POST /api/chat` |
| Coordinator: New Company | `POST /api/companies` |
| Coordinator: New Drive | `POST /api/drives` |
| Coordinator: Status Update | `PATCH /api/applications/{id}/status` |
| Download/Share Receipt | `GET /api/applications/{id}/receipt` |
| Receipt Verified Badge | `POST /api/verify` |

No screens beyond this map should be assumed or built — anything not listed here (analytics dashboards, notifications, real login) stays out of scope per `prd.md`, even though the frontend itself is now in scope.

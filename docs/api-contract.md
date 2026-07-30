# API Contract — TrustHire AI

Base URL (local): `http://localhost:8081`

## Standard Error Contract (all non-2xx responses)
```json
{
  "timestamp": "2026-07-30T11:30:00",
  "status": 409,
  "code": "DUPLICATE_APPLICATION",
  "message": "Student STU-001 has already applied to drive DRV-101.",
  "path": "/api/drives/DRV-101/applications"
}
```

---

## Students

**POST /api/students** — 201, 400, 409
```json
// Request
{ "name": "Aditi Rao", "email": "aditi@example.edu", "programme": "B.Tech CSE",
  "graduationYear": 2027, "cgpa": 8.1, "activeBacklogs": 0, "skills": ["Java", "Spring Boot"] }
// Response 201
{ "studentId": "STU-001", "name": "Aditi Rao", "email": "aditi@example.edu", ... }
```

**GET /api/students/{id}** — 200, 404
**PUT /api/students/{id}** — 200, 400, 404
**GET /api/students/{id}/applications** — 200, 404

## Companies

**POST /api/companies** — 201, 400, 409
```json
{ "name": "Acme Corp", "sector": "Fintech", "description": "..." }
```
**GET /api/companies** — 200
**GET /api/companies/{id}** — 200, 404

## Drives

**POST /api/drives** — 201, 400, 404
```json
{ "companyId": "CMP-001", "role": "Backend Engineer", "location": "Bengaluru",
  "packageOffered": "12 LPA", "deadline": "2026-08-15T23:59:59",
  "requiredSkills": ["Java", "Spring Boot"],
  "eligibilityCriteria": { "minCgpa": 7.5, "maxBacklogs": 0, "eligibleProgrammes": ["B.Tech CSE"], "minGradYear": 2026 } }
```
**GET /api/drives?company=&role=&location=** — 200
**GET /api/drives/{id}** — 200, 404

## Eligibility (signed)

**GET /api/drives/{driveId}/eligibility/{studentId}** — 200, 404
```json
{
  "studentId": "STU-001",
  "driveId": "DRV-101",
  "eligible": false,
  "reasons": ["Minimum CGPA required: 7.5; current CGPA: 7.2", "Missing required skill: Spring Boot"],
  "signature": "e3b0c44298fc1c149afbf4c8996fb924..."
}
```
Note: raw `cgpa` and `activeBacklogs` never appear in this or any response — privacy boundary, see `prd.md`.

## Applications

**POST /api/drives/{driveId}/applications** — 201, 400, 404, 409
```json
// Request: { "studentId": "STU-001" }
// Response 201
{ "applicationId": "APP-501", "studentId": "STU-001", "driveId": "DRV-101",
  "status": "SUBMITTED", "submittedAt": "2026-07-30T11:25:00" }
```
**GET /api/applications** — 200 (coordinator: all applications)
**GET /api/applications/{id}** — 200, 404
**PATCH /api/applications/{id}/status** — 200, 400, 404, 409
```json
// Request: { "newStatus": "UNDER_REVIEW" }
// Response 200: { "applicationId": "APP-501", "oldStatus": "SUBMITTED", "newStatus": "UNDER_REVIEW" }
```

## Audit Trail (unique)

**GET /api/applications/{id}/audit** — 200, 404
```json
[
  { "fromStatus": null, "toStatus": "SUBMITTED", "timestamp": "2026-07-30T11:25:00",
    "prevHash": "GENESIS", "hash": "a1c9..." },
  { "fromStatus": "SUBMITTED", "toStatus": "UNDER_REVIEW", "timestamp": "2026-07-30T14:00:00",
    "prevHash": "a1c9...", "hash": "77fe..." }
]
```

## Receipt (unique)

**GET /api/applications/{id}/receipt** — 200, 404
```json
{ "applicationId": "APP-501", "studentId": "STU-001", "driveId": "DRV-101",
  "status": "UNDER_REVIEW", "chainTipHash": "77fe...", "issuedAt": "2026-07-30T14:05:00",
  "signature": "9d2a..." }
```

**POST /api/verify** — 200 (always 200; result is in the body)
```json
// Request: the full receipt JSON above
// Response: { "valid": true }   OR   { "valid": false, "reason": "signature mismatch" }
```

## Chat

**POST /api/chat** — 200, 400, 404, 503
```json
// Request
{ "studentId": "STU-001", "driveId": "DRV-101", "message": "Why am I not eligible?" }
// Response 200
{ "answer": "You currently do not meet the CGPA requirement...", "model": "llama3.2", "advisory": true }
// Response 503 (Ollama down)
{ "timestamp": "...", "status": 503, "code": "CHAT_SERVICE_UNAVAILABLE",
  "message": "AI assistant is temporarily unavailable.", "path": "/api/chat" }
```

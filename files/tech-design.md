# Technical Design — TrustHire AI

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | Java 17+ | records allowed for DTOs |
| Framework | Spring Boot 3.x (Web, Validation) | REST + DI |
| Storage | In-memory (`ConcurrentHashMap` behind repository interfaces) | resets on restart, by design |
| LLM Runtime | Ollama, local, HTTP | instructor-approved model (e.g. a Llama variant) |
| **Frontend** | **Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion, shadcn/ui (heavily customized), Lucide Icons** | **see `ui-design.md` for full design system** |
| Build | Maven (backend) / npm or pnpm (frontend) | `pom.xml` + `package.json`, separate deployables |
| Testing | JUnit 5 + Postman/curl | unit tests for service layer, Postman for API layer |
| Diagrams | PlantUML / diagrams.net | LLD + HLD artifacts |
| Version Control | Git | one commit per checkpoint minimum |

## 2. "Database" Schema (in-memory, modeled as if relational)

Even though storage is `Map`-based, the shape is designed as if it were relational — this doubles as the conceptual schema referenced in the HLD.

**students**
| field | type | notes |
|---|---|---|
| id | String (PK) | e.g. `STU-001` |
| name | String | |
| email | String | unique |
| programme | String | |
| graduationYear | int | |
| cgpa | double | never returned raw in eligibility responses |
| activeBacklogs | int | never returned raw in eligibility responses |
| skills | List\<String\> | |

**companies**
| field | type | notes |
|---|---|---|
| id | String (PK) | |
| name | String | |
| sector | String | |
| description | String | |

**placement_drives**
| field | type | notes |
|---|---|---|
| id | String (PK) | |
| companyId | String (FK → companies.id) | |
| role | String | |
| location | String | |
| packageOffered | String/number | |
| deadline | Instant | must be ≥ creation date |
| requiredSkills | List\<String\> | |
| eligibilityCriteria | embedded object (min CGPA, max backlogs, eligible programmes, min grad year) | |
| status | enum(`OPEN`,`CLOSED`) | |

**applications**
| field | type | notes |
|---|---|---|
| id | String (PK) | |
| studentId | String (FK → students.id) | |
| driveId | String (FK → placement_drives.id) | |
| status | enum(`ApplicationStatus`) | |
| submittedAt | Instant | |
| unique constraint | (studentId, driveId) | prevents duplicate applications |

**audit_events** (unique addition — hash-chained, append-only)
| field | type | notes |
|---|---|---|
| applicationId | String (FK → applications.id) | |
| fromStatus | enum | |
| toStatus | enum | |
| timestamp | Instant | |
| prevHash | String (SHA-256 hex) | hash of previous event in this application's chain, or genesis value |
| hash | String (SHA-256 hex) | `sha256(prevHash + applicationId + fromStatus + toStatus + timestamp)` |

Conceptually, in a production version: `students`, `companies`, `placement_drives`, `applications` → relational (PostgreSQL/MySQL), `audit_events` → append-only table or dedicated event store.

## 3. Authentication & Authorization

**Explicitly out of scope for this prototype** (per problem statement). No JWT/OAuth/sessions.

- All endpoints are open/trusted-caller for demonstration purposes.
- Conceptual note for the HLD write-up only: in production, `Student` and `Coordinator` would map to distinct roles (Bearer tokens / OAuth2 resource server), and admin-only endpoints (`POST /api/companies`, `POST /api/drives`, `PATCH .../status`) would require the coordinator role.
- No passwords, tokens, or secrets are stored anywhere in this codebase.

## 4. External API Contracts

### 4.1 Internal REST API (this app exposes)
See `flow.md` and the endpoint table in the implementation plan — 13 mandatory endpoints under `/api/students`, `/api/companies`, `/api/drives`, `/api/applications`, `/api/chat`, plus one new unique endpoint:

```
GET  /api/applications/{applicationId}/receipt   → returns a portable receipt (see 4.3)
POST /api/verify                                 → body: the receipt JSON; returns {valid: true/false, reason}
```

### 4.3 Verifiable Application Receipt (new, unique)

```json
{
  "applicationId": "APP-501",
  "studentId": "STU-001",
  "driveId": "DRV-101",
  "status": "SHORTLISTED",
  "chainTipHash": "9f3a...c21",
  "issuedAt": "2026-07-27T10:00:00Z",
  "signature": "hmac-sha256-hex"
}
```
- `chainTipHash` is the most recent `AuditEvent.hash` for this application (see §2 `audit_events`).
- `signature` is `ResultSigner.sign()` applied to the canonical receipt payload — same signer used for `EligibilityResult`, reused rather than duplicated.
- `POST /api/verify` recomputes the signature over the submitted payload and compares; it does **not** require the receipt-holder to have any database access, only the receipt JSON itself.
- This turns "trust me, the status is X" into "here's proof the status is X, check it yourself" — the literal meaning behind the project name.

Standard error shape (all non-2xx):
```json
{
  "timestamp": "ISO-8601",
  "status": 409,
  "code": "DUPLICATE_APPLICATION",
  "message": "human-readable",
  "path": "/api/..."
}
```

### 4.2 Ollama API (this app calls)
```
POST {ollama.base-url}/api/chat
{
  "model": "<configured-model>",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "Verified context: ... User question: ..."}
  ],
  "stream": false
}
```
Config (externalized, `application.properties`):
```
ollama.base-url=http://localhost:11434
ollama.model=<instructor-approved-model>
ollama.connect-timeout-seconds=3
ollama.read-timeout-seconds=60
```

## 5. Security Utilities (unique addition, not "auth")

- **`ResultSigner`** — HMAC-SHA256 over the canonical form of `EligibilityResult`, keyed by a server-side secret from config (`app.signing.secret`, never committed). `sign()` at creation, `verify()` before the chatbot is allowed to explain a result.
- **`HashChain`** — SHA-256 chaining utility for `AuditEvent`. Genesis hash is a fixed constant per application ID. Chain integrity can be recomputed and verified on demand (`AuditTrailService.verifyChain()`).
- **`ReceiptService`** — builds the receipt payload in §4.3 from an application's current status + audit chain tip, and delegates signing to `ResultSigner` (no new crypto primitive introduced — deliberate reuse).
- These are cryptographic *integrity* mechanisms, not authentication — they don't identify a caller, they prove data hasn't been altered after the fact.

## 6. Hosting / Deployment Environment (conceptual, per HLD requirements)

- **Prototype:** single Spring Boot JAR, run locally (`mvn spring-boot:run` or `java -jar`), Ollama running as a local sibling process on `localhost:11434`, Next.js dev server (`npm run dev`) on a separate port (e.g. `localhost:3000`) talking to the backend on `localhost:8080` via CORS.
- Backend must expose a permissive-but-explicit CORS config (allowed origin = frontend dev/prod URL only, not `*`) for the endpoints in `flow.md`.
- Frontend reads the API base URL from a single env var (`NEXT_PUBLIC_API_BASE_URL`) — never hard-coded.
- **Conceptual production path (write-up only, not built):**
  - Modular monolith → containerized (Docker) → deployed behind a load balancer if traffic requires multiple instances.
  - In-memory repositories → PostgreSQL with the schema in §2.
  - `audit_events` → append-only table with a periodic external anchor (e.g. published hash digest) for stronger tamper evidence.
  - Drive listings / static FAQ responses → cacheable (Redis) with short TTL; application/eligibility endpoints stay uncached (consistency-sensitive).
  - Ollama → replaced or scaled with a dedicated inference service behind its own internal endpoint, same `ChatClient` abstraction, zero controller changes needed (this is *why* the Adapter pattern exists here).

## 7. Non-Functional Targets

| NFR | Target |
|---|---|
| Availability | Non-chat APIs must have 0% dependency on Ollama uptime |
| Performance | In-memory ops: negligible latency; chat calls bounded by configured timeout (default 60s read / 3s connect) |
| Observability | Log operation name + outcome; never log raw CGPA/backlog, secrets, or full prompts |
| Consistency | Application create/status-update path is strongly consistent (single in-memory store, synchronized per aggregate) |

# Requirements & Assumptions — TrustHire AI

## 1. Actors
| Actor | Responsibilities |
|---|---|
| Student | Maintain profile, browse drives, check eligibility, apply, track status, download/share receipt, ask the AI assistant |
| Placement Coordinator / Admin | Create companies and drives, define criteria, review applications, update status |
| AI Career Assistant | Answers FAQ, explains eligibility (from a signed result), gives prep guidance, summarizes profile — advisory only |
| External LLM Runtime (Ollama) | Accepts prompts, returns generated text over HTTP |

## 2. Use Cases

### UC-1: Apply to Drive
- **Actor:** Student
- **Preconditions:** Student profile exists; drive exists and is `OPEN`; deadline has not passed.
- **Normal flow:** Student checks eligibility → eligible → submits application → system checks for a duplicate → none found → application created in `SUBMITTED` state → audit event #1 appended to the hash chain.
- **Alternate flow (ineligible):** Eligibility check returns `eligible=false` with reasons → student may ask the AI assistant to explain the reasons → student is blocked from applying unless an override is explicitly enabled.
- **Alternate flow (duplicate):** Student already has an application for this drive → `409 Conflict`, no new record created.
- **Alternate flow (deadline passed):** Application rejected with a meaningful error, no record created.

### UC-2: Ask AI Assistant
- **Actor:** Student
- **Preconditions:** None (Ollama may or may not be running).
- **Normal flow:** Student sends a message (FAQ / eligibility explanation / prep guidance / profile summary) → `CareerAssistantService` gathers only the verified context needed → for eligibility explanations, the service verifies the HMAC signature on the `EligibilityResult` before using it → builds a controlled prompt → `ChatClient` (via `OllamaChatClient`) sends it to Ollama → response returned, labeled `advisory: true`.
- **Alternate flow (Ollama down/timeout):** Request fails at the adapter layer → mapped to a controlled `503 Service Unavailable` → all non-chat endpoints remain unaffected.
- **Alternate flow (unsupported request):** e.g. "approve my application" → assistant explains it cannot take write actions and redirects to supported operations.

## 3. In-Scope / Out-of-Scope
See `prd.md` for the full list. Summary: student/company/drive/application/eligibility/audit/receipt/chat management is in scope; production auth, real persistence, notifications, RAG/agents, and distributed infrastructure are explicitly out of scope.

## 4. Core Assumptions
1. All data is fictional/synthetic; no real personal data is used.
2. One Spring Boot instance is sufficient; storage is in-memory and resets on restart.
3. A placement drive has exactly one eligibility policy configuration.
4. A student may apply only once per drive.
5. The AI assistant is advisory only — it never creates, approves, rejects, or modifies applications.
6. Ollama runs locally/reachable; its base URL and model are externalized configuration, never hard-coded.
7. The HMAC signing secret is a configuration value (`TRUSTHIRE_SIGNING_SECRET`), never committed to source control.

## 5. Responsibility / CRC Table

| Class | Responsibility | Key Collaborators |
|---|---|---|
| `Student` | Own profile state, validated updates | `StudentRepository` |
| `Company` | Represent an organization | `DriveRepository` |
| `PlacementDrive` | Role, deadline, required skills, criteria | `Company`, `EligibilityPolicy` |
| `Application` | One student-drive application + status | `ApplicationStatus`, `AuditTrailService` |
| `EligibilityResult` | Signed eligibility outcome + reasons | `ResultSigner` |
| `AuditEvent` | One hash-chained status-transition record | `HashChain` |
| `EligibilityPolicy` (interface) | Contract for eligibility evaluation | `CompositeEligibilityPolicy` |
| `CompositeEligibilityPolicy` | Aggregates all `Criterion` checks | `CgpaCriterion`, `BacklogCriterion`, `SkillCriterion`, `ProgrammeYearCriterion` |
| `ChatClient` (interface) | Model-independent chatbot contract | `OllamaChatClient` |
| `OllamaChatClient` | Adapts requests/responses to Ollama's HTTP API | `OllamaProperties` |
| `ResultSigner` | HMAC-SHA256 sign/verify | `EligibilityService`, `ReceiptService` |
| `HashChain` | SHA-256 chaining utility | `AuditTrailService` |
| `ApplicationService` | Coordinates eligibility, duplicate checks, creation | `ApplicationRepository`, `EligibilityService` |
| `AuditTrailService` | Appends and verifies the hash chain per application | `HashChain`, `ApplicationRepository` |
| `ReceiptService` | Issues + verifies signed receipts | `ResultSigner`, `AuditTrailService` |
| `CareerAssistantService` | Builds safe prompts, verified context | `ChatClient`, `EligibilityService` |
| `StudentRepository` / `DriveRepository` / `ApplicationRepository` / `CompanyRepository` | Abstract in-memory storage | `InMemory*` implementations |

## 6. State Model — Application Lifecycle

```
SUBMITTED --> UNDER_REVIEW --> SHORTLISTED --> SELECTED
                    |
                    +--> REJECTED
SUBMITTED / UNDER_REVIEW --> WITHDRAWN (optional)
```

| From | To | Allowed? |
|---|---|---|
| SUBMITTED | UNDER_REVIEW | ✅ |
| SUBMITTED | WITHDRAWN | ✅ |
| UNDER_REVIEW | SHORTLISTED | ✅ |
| UNDER_REVIEW | REJECTED | ✅ |
| UNDER_REVIEW | WITHDRAWN | ✅ |
| SHORTLISTED | SELECTED | ✅ |
| SHORTLISTED | REJECTED | ✅ |
| SELECTED | anything | ❌ (terminal) |
| REJECTED | anything | ❌ (terminal) |
| WITHDRAWN | anything | ❌ (terminal) |

Every transition, valid or not, is checked by `ApplicationStatus.canTransitionTo()`; every valid transition also produces one `AuditEvent` appended to that application's hash chain.

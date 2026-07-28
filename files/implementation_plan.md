# Implementation Plan — TrustHire AI

Step-by-step build sequence. Each step should compile/run before moving to the next — do not skip ahead to REST or Ollama before the domain layer is solid.

## Step 0 — Project Skeleton
1. Initialize Spring Boot project (Web, Validation) via start.spring.io, Java 17.
2. Create base package `com.trusthire.ai` with empty subpackages: `domain`, `policy`, `chat`, `repository`, `service`, `security`, `web`, `web.dto`, `exception`.
3. Confirm `mvn spring-boot:run` starts with no controllers yet.

## Step 1 — Domain Model (no Spring dependency)
1. `ApplicationStatus` enum with `canTransitionTo(ApplicationStatus target)` encoding the allowed graph:
   `SUBMITTED → UNDER_REVIEW → SHORTLISTED → SELECTED`, `→ REJECTED`, `SUBMITTED|UNDER_REVIEW → WITHDRAWN`.
2. `DriveStatus` enum (`OPEN`, `CLOSED`).
3. `Student`, `Company`, `PlacementDrive`, `Application` entities — private fields, constructor validation, no public setters for invariant fields.
4. `EligibilityResult` value object — `boolean eligible`, `List<String> reasons`, `String signature` (no raw CGPA/backlog fields — privacy boundary).
5. `AuditEvent` — `{applicationId, fromStatus, toStatus, timestampIso, prevHash, hash}`.
6. Write plain `main()` or JUnit smoke tests instantiating each entity with valid/invalid data.

**Checkpoint:** entities compile and enforce invariants with zero Spring/HTTP involved.

## Step 2 — Repository Layer
1. Define `StudentRepository`, `CompanyRepository`, `DriveRepository`, `ApplicationRepository` interfaces (`save`, `findById`, `findAll`, plus domain-specific finders like `existsByEmail`).
2. Implement `InMemory*Repository` using `ConcurrentHashMap`.
3. Register as `@Repository` Spring beans.

**Checkpoint:** entities can be saved and retrieved through the interfaces in a unit test.

## Step 3 — Eligibility Strategy
1. Define a small `Criterion` contract (`Optional<String> check(Student, PlacementDrive)` returning a failure reason or empty).
2. Implement `CgpaCriterion`, `BacklogCriterion`, `SkillCriterion`, `ProgrammeYearCriterion`.
3. Define `EligibilityPolicy` interface: `EligibilityResult evaluate(Student, PlacementDrive)`.
4. Implement `CompositeEligibilityPolicy` that runs all criteria and aggregates reasons.
5. Implement `security/ResultSigner` — HMAC-SHA256 over the result's canonical string form; `sign()` and `verify()` methods.
6. Wire signing into `EligibilityService.evaluate()` so every returned `EligibilityResult` is signed before leaving the service.

**Checkpoint:** unit tests cover an eligible case, an ineligible case (multiple reasons), and a signature-tamper case (mutate result → verify fails).

## Step 4 — Application Workflow
1. `ApplicationService.apply(studentId, driveId)`:
   - Validate student and drive exist (404 mapping upstream).
   - Validate deadline not passed.
   - Validate no existing application for this student+drive (409 mapping upstream).
   - Validate eligibility (unless override flag) — reject otherwise.
   - Persist `Application` in `SUBMITTED` state.
2. `ApplicationService.updateStatus(applicationId, newStatus)`:
   - Validate transition via `ApplicationStatus.canTransitionTo()`.
   - On success, call `AuditTrailService.record(...)`.
3. `security/HashChain` — `sha256(prevHash + canonicalPayload)`.
4. `AuditTrailService` — maintains an in-memory list of `AuditEvent` per application; `record()` computes and appends the next hash; `verifyChain(applicationId)` recomputes and compares.

**Checkpoint:** unit tests — duplicate apply rejected, invalid transition rejected, valid transition chain produces a verifiable hash chain.

## Step 5 — REST Layer
1. Define request/response DTOs per resource (never expose entities).
2. Implement controllers in this order: `StudentController` → `CompanyController` → `DriveController` → `ApplicationController`.
3. Implement `GlobalExceptionHandler` (`@RestControllerAdvice`) mapping `NotFoundException→404`, `DuplicateResourceException→409`, `InvalidTransitionException→409`, validation errors→400, using the standard error contract shape.
4. Manually verify each endpoint with curl/Postman against the acceptance test table.

**Checkpoint:** T-01 through T-13 (non-chat tests) pass.

## Step 6 — Ollama Chatbot Integration
1. Define `ChatClient` interface: `String send(String systemPrompt, String userMessage)`.
2. Define `OllamaProperties` (`@ConfigurationProperties(prefix="ollama")`) for `base-url`, `model`, timeouts.
3. Implement `OllamaChatClient` — builds the `/api/chat` request per the configured shape, maps `ConnectException`/timeout to `ChatServiceUnavailableException`.
4. Implement `CareerAssistantService` with 4 methods (`answerFaq`, `explainEligibility`, `suggestPreparation`, `summarizeProfile`), each building a controlled system prompt + minimal verified context.
5. `explainEligibility` must call `ResultSigner.verify()` on the `EligibilityResult` before using it — refuse to answer if verification fails (this is the enforcement point for the "must not fabricate" rule).
6. Implement `ChatController` → `POST /api/chat`, mapped exceptions → 503.

**Checkpoint:** T-14 through T-17 pass; stopping Ollama produces a controlled 503 while all other endpoints keep working.

## Step 6.5 — Verifiable Application Receipt (new, unique)
1. Implement `ReceiptService.issue(applicationId)` — reads current status + `AuditTrailService` chain tip hash, builds the receipt payload, signs it via the existing `ResultSigner` (no new crypto class — reuse).
2. Add `GET /api/applications/{applicationId}/receipt` → returns the signed receipt JSON.
3. Add `POST /api/verify` → accepts a receipt body, recomputes/verifies the signature, returns `{valid, reason}`.
4. Unit test: issue a receipt, verify it passes; mutate one field, verify it fails.

**Checkpoint:** a receipt pulled for a real application verifies as valid; a hand-edited copy of the same receipt fails verification.

## Step 8 — Frontend Foundation (new — see `ui-design.md` for full design system)
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router.
2. Install Framer Motion, shadcn/ui (as a base only — see `ui-design.md` rules on customization), Lucide Icons.
3. Set up the design tokens (colors, spacing, typography) exactly as specified in `ui-design.md` — Tailwind config + CSS variables, dark/light mode via `next-themes` or equivalent.
4. Build the shared shell: navigation dock, command palette (⌘K), and the "Proof Rail" component (persistent panel showing verification state — see `ui-design.md`).
5. Build a typed API client (`lib/api.ts`) wrapping every endpoint in `flow.md` Part 1, with typed request/response shapes matching the backend DTOs exactly.

**Checkpoint:** shell renders, theme toggle works, command palette opens or a fallback nav works, API client compiles against typed DTOs.

## Step 9 — Student Screens
1. Profile screen + update form.
2. Drive browse/list + filter.
3. Drive detail → eligibility check (live call, shows signed result + reasons) → apply flow.
4. My Applications → application detail with status timeline + audit-chain visualization.
5. Receipt screen → download/share + inline verify call.
6. AI Assistant chat drawer (FAQ / eligibility explain / prep guidance / profile summary).

**Checkpoint:** a student can complete Flow A → Flow C → Flow D → Flow H (from `flow.md`) entirely through the UI, hitting the real backend.

## Step 10 — Coordinator Screens
1. Manage Companies (create/list).
2. Manage Drives (create with criteria builder, list/filter).
3. Applications Review (list/kanban by status) → application detail → status update action.

**Checkpoint:** a coordinator can complete Flow B → Flow E entirely through the UI.

## Step 11 — Polish Pass
1. Loading skeletons for every async screen (no blank-white flashes).
2. Empty states for every list (no drives yet, no applications yet, etc.) — designed, not default browser text.
3. Error/toast handling for every API failure path, including the Ollama-down 503 (Flow G) shown as a distinct, calm UI state — not a generic error banner.
4. Responsive pass: mobile, tablet, desktop breakpoints per `ui-design.md`.
5. Accessibility pass: keyboard nav through the whole app, focus states, WCAG AA contrast check.

**Checkpoint:** every flow in `flow.md` works end-to-end, on mobile width, in both themes, with no console errors.

## Step 12 — Diagrams & Docs
1. Class diagram from the actual final package structure.
2. Sequence diagram: apply to drive (success + conflict path).
3. Sequence diagram: ask AI assistant (success + timeout path).
4. Optional sequence diagram: status update → audit trail hash append.
5. HLD diagram + written answers to the 8 system-design questions.
6. README with setup, Ollama config, endpoint summary, pattern explanations, and a "Design Highlights" section for the 3 unique additions.

## Step 8 — Final Test Pass & Demo Prep
1. Run the full T-01…T-17 checklist end to end against the running app.
2. Capture required screenshots.
3. Rehearse the 5–7 minute demo script.

## Build Order Rule
Never implement a REST controller or the Ollama adapter before the corresponding service-layer logic has passing unit tests. The domain and service layers must be independently correct and demonstrable without Spring Web or Ollama running at all.

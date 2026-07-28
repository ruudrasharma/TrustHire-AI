# AGENTS.md — Rules for AI coding agents working on TrustHire AI

These rules apply to any AI tool (Claude Code, Cursor, Copilot agent mode, etc.) making changes in this repository. Read `prd.md`, `implementation_plan.md`, and `tech-design.md` before generating code.

## 1. Project Identity
- This is a 5-day **individual** capstone. All code must be explainable line-by-line by the student. Do not introduce frameworks, libraries, or patterns not listed in `tech-design.md` without flagging it first.
- Stack is fixed: Java 17+, Spring Boot (Web + Validation), in-memory repositories, Ollama over HTTP. Do not add a database, message queue, cache layer, or auth framework — these are explicit non-goals in `prd.md`.

## 2. Build Order (do not violate)
Follow `implementation_plan.md` step order exactly:
`domain → repository → policy(strategy) → service → security utils → REST → chat(adapter) → diagrams/docs`
Never generate a controller before its backing service exists and has at least one passing unit test. Never generate the Ollama adapter before the `ChatClient` interface exists.

## 3. File & Class Rules
- One public class per file.
- Target ≤ 150 lines per class (excluding imports/braces). If a class grows past this, it's doing too much — split it.
- No class may exceed 2 responsibilities. If you can't summarize a class's job in one sentence, redesign it.
- No God classes: controllers must not contain business logic; services must not contain HTTP or Ollama request-building code.
- Package by layer (`domain`, `policy`, `chat`, `repository`, `service`, `security`, `web`), not by feature.

## 4. Naming Conventions
- Entities: singular nouns (`Student`, not `Students`).
- Services: `<Noun>Service`.
- Repositories: `<Noun>Repository` (interface) / `InMemory<Noun>Repository` (impl).
- DTOs: `<Noun>CreateRequest`, `<Noun>UpdateRequest`, `<Noun>Response`.
- Exceptions: end in `Exception`, extend `RuntimeException`, live in `exception/`.
- REST paths: plural nouns, no verbs (`/api/students`, never `/api/createStudent`).

## 5. Design Pattern Enforcement
- `EligibilityPolicy` must remain the **only** entry point for eligibility logic. Never let a controller or `ApplicationService` compute eligibility inline.
- `ChatClient` must remain the **only** thing that knows Ollama's request/response shape. Never construct Ollama JSON payloads outside `OllamaChatClient`.
- Repository interfaces must remain storage-agnostic. Never let a service call `.get()` on a `Map` directly — always go through the repository interface.
- These three patterns are graded. Do not "simplify" them away for convenience.

## 6. The Three Unique Additions — Non-Negotiable
1. **Signed EligibilityResult** — `ResultSigner.sign()` must be called before any `EligibilityResult` leaves `EligibilityService`. `CareerAssistantService.explainEligibility()` must call `ResultSigner.verify()` before using a result and must refuse (not silently proceed) on failure.
2. **Hash-chained audit trail** — every successful call to `ApplicationService.updateStatus()` must trigger `AuditTrailService.record()`. Do not add a code path that changes `Application.status` without going through this method.
3. **Privacy boundary** — `EligibilityResult`, and every DTO derived from it, must never contain raw `cgpa` or `activeBacklogs` values. Only booleans and human-readable reason strings cross the API boundary.
4. **Verifiable receipt** — `ReceiptService` must reuse `ResultSigner`, not introduce a second signing mechanism. `POST /api/verify` must work statelessly from the submitted JSON body alone — it must not require looking up the application in a repository to validate the signature.

## 7. Error Handling
- All exceptions thrown from services must be one of the defined types in `exception/` — no bare `RuntimeException`.
- All exceptions are mapped centrally in `GlobalExceptionHandler`. Do not catch-and-format errors inside individual controllers.
- Chat failures (Ollama down, timeout, empty response) must always resolve to a `ChatServiceUnavailableException` → 503. Never let a chat failure return 200 with a fabricated answer.

## 8. Validation
- Structural validation (nulls, blanks, format) → Bean Validation annotations (`@NotBlank`, `@Email`, etc.) on request DTOs.
- Business validation (duplicate email, duplicate application, invalid transition, deadline passed) → service layer, never in the controller.

## 9. Logging
- Log operation name + outcome (e.g. "Application APP-501 created for STU-001") at INFO.
- Log Ollama integration failures at WARN/ERROR with cause, but never log the full prompt or raw student data.
- Never log `cgpa`, `activeBacklogs`, or the HMAC signing secret.

## 10. Testing Expectations
- Every service method that enforces a business rule (duplicate check, transition guard, signature verify, hash chain append) needs at least one positive and one negative unit test.
- Service-layer tests must not require Spring context or a running Ollama instance.
- Do not mark a checkpoint complete until its corresponding tests in the T-01…T-17 checklist pass.

## 11a. Frontend Rules (Next.js / TypeScript)
- Stack is fixed per `ui-design.md`: Next.js App Router, TypeScript, Tailwind, Framer Motion, shadcn/ui as a **base only** — every shadcn component used must be visibly customized (tokens, spacing, motion), never dropped in stock.
- No mock/placeholder API data anywhere. Every screen calls the real backend via `lib/api.ts`. If the backend isn't running, show the designed empty/error state — never hardcode fake drives, students, or applications.
- One typed API client module, one set of TypeScript types mirroring the backend DTOs exactly (regenerate types when a DTO changes — don't let them drift).
- Design tokens (colors, spacing, radii, type scale) live in one place (`tailwind.config.ts` + CSS variables) — no inline magic hex values in components.
- Every list screen needs a loading skeleton and an empty state; every mutation (apply, status update, chat send) needs a pending state and an error state. No screen may go straight from "loading" to "content" with nothing in between.
- The "Proof Rail" (verification panel) and the receipt/verify flow are graded unique features — do not simplify them into a plain text badge; they must visibly show the actual signature/hash data returned by the API.
- Respect `WCAG AA` contrast and full keyboard navigation — this is a stated success criterion in `prd.md`, not optional polish.

## 11b. What NOT to Do
- Do not add authentication/authorization scaffolding (JWT filters, security config) — explicitly out of scope.
- Do not swap in a real database "for convenience" — in-memory is a deliberate, graded constraint.
- Do not let the LLM's response ever mutate application state, even if the user's message asks it to ("approve my application" etc.) — `CareerAssistantService` is read-only with respect to `Application`.
- Do not generate placeholder/mock diagrams as final deliverables — diagrams must reflect the actual final class structure.
- Do not commit secrets, sample real personal data, or machine-specific paths.

## 12. Commit Discipline
- One commit per checkpoint in the 5-day plan, minimum.
- Commit message format: `Day<N>-<Stage>: <what changed>` (e.g. `Day2-B: implement ApplicationService transitions + audit trail`).

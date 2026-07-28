# Product Requirements Document — TrustHire AI

## 1. Summary
TrustHire AI is a backend platform for managing campus placement drives, student applications, and eligibility, augmented with a locally-run AI career assistant (via Ollama). It replaces fragmented spreadsheets/messages with a single, rule-driven, API-first system, built as a 5-day individual capstone demonstrating OOP, design patterns, LLD/HLD, REST API design, and local LLM integration.

The name reflects the project's central idea: every claim the system makes about a student's eligibility or application status is **backed by evidence** (a signature or a hash chain), not just asserted — a student, coordinator, or even the AI assistant can prove a result is genuine rather than having to trust it blindly.

## 2. Problem Statement
University placement activities are fragmented across spreadsheets and messages. Students can't easily tell why they are or aren't eligible for a drive, or track application status. Coordinators lack a structured way to publish drives, define eligibility, and manage applications end-to-end.

## 3. Target Users

| Persona | Goals |
|---|---|
| **Student** | Maintain profile, browse drives, understand eligibility, apply once per drive, track status, ask the AI assistant for guidance |
| **Placement Coordinator / Admin** | Create companies and drives, define eligibility rules, review applications, update status |
| **AI Career Assistant** | Answer FAQ, explain eligibility, give prep guidance, summarize profile — advisory only |

## 4. Core Features (In Scope)

1. **Student Profile Management** — create/retrieve/update profile (name, email, programme, graduation year, CGPA, backlogs, skills)
2. **Company Management** — create/retrieve company records
3. **Placement Drive Management** — create drives with role, package, deadline, required skills, eligibility criteria
4. **Eligibility Evaluation** — deterministic eligible/ineligible result with reasons, cryptographically signed
5. **Application Management** — apply (with duplicate + deadline + eligibility checks), retrieve, update status through a guarded state machine
6. **Tamper-evident Audit Trail** — every application status change is recorded as a hash-chained event (unique addition)
7. **REST API Layer** — resource-oriented endpoints, DTOs, validation, consistent error contract
8. **AI Career Assistant** — FAQ, eligibility explanation (grounded in the signed result), preparation guidance, profile summary — via Ollama
9. **Verifiable Application Receipt** (new, unique) — after any status change, the student can pull a small, portable JSON "receipt" containing the current status, the tip hash of that application's audit chain, and a signature. Anyone holding the receipt can call `POST /api/verify` to confirm it's authentic and unaltered — without needing direct database access. Effectively a shareable proof-of-status a student could attach to an email or show a recruiter, independent of the live system being up.
10. **Web Application (Frontend)** — a Next.js/TypeScript single web app serving both Student and Coordinator roles, consuming the REST API in `flow.md`. Full design system in `ui-design.md`. Not a separate mobile app; responsive web only.

## 5. Explicit Non-Goals (What This App Is NOT)

- **Not** a production auth/identity system — no JWT, OAuth, sessions, or real login. All actors are trusted callers for this prototype.
- **Not** a system of record for real personal data — all data is synthetic/fictional.
- **Not** a persistent-storage product — in-memory repositories only; data resets on restart.
- **Not** a notification system — no real email/SMS/WhatsApp delivery.
- **Not** a RAG or agentic system — no vector DB, no fine-tuning, no autonomous multi-step agents.
- **Not** a distributed system — single Spring Boot instance, no Kafka, no service discovery, no distributed locks.
- **Not** a native mobile app — the frontend is a responsive web app (Next.js), not iOS/Android.
- **Not** a decision-maker — the AI assistant never approves, rejects, or modifies applications. It only explains a result the deterministic engine already produced.
- **Not** a general blockchain product — the hash-chain audit trail is a lightweight tamper-evidence mechanism inside one service, not a distributed ledger, consensus system, or cryptocurrency.

## 6. Success Criteria (Acceptance)

- All 12 functional requirements (FR-01…FR-12) work end-to-end via REST.
- Strategy, Adapter, and Repository patterns are implemented at genuine variation points and explainable in one sentence each.
- Core placement APIs remain fully functional when Ollama is offline (503 for `/api/chat` only).
- Eligibility and duplicate-application rules are deterministic and testable without Spring or Ollama running.
- Full LLD (class diagram, 2+ sequence diagrams, state model) and basic HLD exist and match the code.
- All 17 mandatory test scenarios (T-01…T-17) pass.
- README allows another person to run the project from scratch.
- The web app covers every screen in `flow.md` Part 2, is fully responsive, has working dark/light mode, and every write action (apply, status update, chat) reflects real API state — no mocked UI data.

## 7. Constraints

- 5 working days, individual project.
- Java 17+, Spring Boot, in-memory repositories, Ollama local API.
- No production-scale infrastructure expected or rewarded.

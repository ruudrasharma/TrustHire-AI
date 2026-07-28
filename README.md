# TrustHire AI

> Campus placement, built on proof.

TrustHire AI is a full-stack campus placement platform where every eligibility decision is **cryptographically signed**, every status change is **hash-chained**, and every claim is **independently verifiable** — not just asserted.

Built as a 5-day capstone demonstrating OOP, design patterns (Strategy, Adapter, Repository), REST API design, and local LLM integration.

---

## ✨ What makes it different

| Feature | What it means |
|---|---|
| **Signed Eligibility Results** | Every eligible/ineligible result is HMAC-SHA256 signed before it leaves the backend. The AI assistant verifies the signature before using the result — it refuses if tampered. |
| **Hash-Chained Audit Trail** | Every application status change (SUBMITTED → UNDER_REVIEW → SHORTLISTED → SELECTED) is recorded as a SHA-256 hash-chained event. Reordering or deleting events breaks the chain. |
| **Verifiable Application Receipt** | Students can download a signed JSON receipt of their current status and share it with a recruiter. `POST /api/verify` validates it **statelessly** from the JSON alone — no database lookup required. |
| **Privacy Boundary** | Raw CGPA and active backlogs never cross the API boundary — only boolean eligibility and human-readable reason strings. |

---

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.x** (Web, Validation)
- **In-memory repositories** (`ConcurrentHashMap`) — no database, by design
- **HMAC-SHA256** signing via `javax.crypto`
- **SHA-256** hash chaining
- **Ollama** local LLM integration (HTTP adapter)

### Frontend
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS** — design tokens, no arbitrary values
- **Framer Motion** — spring animations
- **Lucide React** — icons

---

## Project Structure

```
TrustHire AI/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/trusthire/ai/
│       ├── domain/           # Entities & value objects
│       ├── exception/        # 6 typed exceptions
│       ├── repository/       # Interfaces + InMemory implementations
│       ├── policy/           # Strategy pattern: Criterion + CompositeEligibilityPolicy
│       ├── security/         # ResultSigner (HMAC) + HashChain (SHA-256)
│       ├── service/          # 8 application services
│       ├── chat/             # Adapter: ChatClient interface + OllamaChatClient
│       └── web/              # REST controllers + DTOs + GlobalExceptionHandler
└── frontend/                 # Next.js web app
    └── src/
        ├── app/              # App Router pages (student + coordinator sections)
        ├── components/       # OrbitDock, ProofRail, HashChainTimeline, ReceiptCard…
        └── lib/              # Typed API client, types, utils
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |
| Ollama | Latest (optional — AI chat only) |

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/ruudrasharma/TrustHire-AI.git
cd TrustHire-AI
```

### 2. Backend

```bash
cd backend

# (Optional) Override the signing secret
export TRUSTHIRE_SIGNING_SECRET=your-random-secret

# Run
mvn spring-boot:run
# API available at http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

### 4. AI Chat (Optional)

```bash
# Install Ollama: https://ollama.com
ollama serve
ollama pull llama3.2
# Backend auto-connects on port 11434
# If Ollama is absent, the rest of the app works normally (503 for /api/chat only)
```

---

## API Overview

```
POST   /api/students                           Create student profile
GET    /api/students/{id}                      Get student
PUT    /api/students/{id}                      Update student
GET    /api/students/{id}/applications         Student's applications

POST   /api/companies                          Create company
GET    /api/companies                          List companies
GET    /api/companies/{id}                     Get company

POST   /api/drives                             Create placement drive
GET    /api/drives                             List/filter drives
GET    /api/drives/{id}                        Get drive
GET    /api/drives/{driveId}/eligibility/{sid} Check eligibility (signed result)
POST   /api/drives/{driveId}/applications      Apply to drive

GET    /api/applications                       All applications (coordinator)
GET    /api/applications/{id}                  Get application
PATCH  /api/applications/{id}/status           Update status (triggers audit event)
GET    /api/applications/{id}/audit            Hash-chained event list
GET    /api/applications/{id}/receipt          Issue signed receipt

POST   /api/verify                             Stateless receipt verification
POST   /api/chat                               AI career assistant
```

---

## Design Patterns

| Pattern | Where | One-line purpose |
|---|---|---|
| **Strategy** | `Criterion` interface + 4 impls | Each eligibility rule is a pluggable strategy |
| **Composite** | `CompositeEligibilityPolicy` | Runs all criteria, aggregates results |
| **Adapter** | `ChatClient` → `OllamaChatClient` | Isolates Ollama's JSON shape from service layer |
| **Repository** | `XxxRepository` interface + `InMemoryXxx` | Services are storage-agnostic |
| **State Machine** | `ApplicationStatus.canTransitionTo()` | Guards all status transitions |

---

## Running Tests

```bash
cd backend
mvn test
# 17/17 unit tests pass
```

Tests cover:
- `ApplicationStatusTest` — all valid transitions + invalid rejections
- `CompositeEligibilityPolicyTest` — eligible pass, each criterion blocking, privacy boundary
- `ResultSignerTest` — sign/verify pass, tamper detection
- `ApplicationServiceTest` — full lifecycle, duplicate rejection, hash chain verification

---

## Screens

| Role | Screen | Endpoint |
|---|---|---|
| Student | Profile create/update | `GET/PUT /api/students/{id}` |
| Student | Browse drives | `GET /api/drives` |
| Student | Drive detail + eligibility | `GET /api/drives/{id}/eligibility/{sid}` |
| Student | Apply | `POST /api/drives/{id}/applications` |
| Student | My applications | `GET /api/students/{id}/applications` |
| Student | Application detail + hash chain | `GET /api/applications/{id}/audit` |
| Student | Download/verify receipt | `GET /api/applications/{id}/receipt`, `POST /api/verify` |
| Student | AI career assistant | `POST /api/chat` |
| Coordinator | Manage companies | `POST /api/companies` |
| Coordinator | Manage drives | `POST /api/drives` |
| Coordinator | Review + update applications | `PATCH /api/applications/{id}/status` |

---

## Security Notes

- **No authentication** — this is a demo prototype, not a production auth system.
- **Signing secret** — set `TRUSTHIRE_SIGNING_SECRET` env var before deployment. The dev default in `application.properties` is safe for local use only.
- **Privacy** — CGPA and active backlogs are **never** returned in API responses, only used internally by eligibility evaluation.
- **No real data** — all data is synthetic and resets on server restart.

---

## Non-Goals

- No JWT / OAuth / sessions
- No persistent database
- No email/SMS notifications  
- No RAG, vector DB, or agentic LLM
- No distributed system / Kafka

---

## License

MIT — see [LICENSE](LICENSE).

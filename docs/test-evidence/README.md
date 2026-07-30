# Test Evidence

This folder holds proof that the mandatory test checklist (T-01…T-17, see `implementation_plan.md` / original spec §10.2) actually passed — not just that tests exist.

## What to put here

1. **`mvn-test-output.txt`** — full console output of `cd backend && mvn test`, showing all unit tests passing (README claims 17/17 — paste the real run here).
2. **`postman-run-results.json`** or **`postman-run-results.html`** — export of a full Postman Collection Runner pass over `postman/TrustHireAI.postman_collection.json`, covering every T-01…T-17 scenario.
3. **`t-checklist.md`** — copy the table below and mark each row with the actual HTTP status/behavior you observed.

## T-01 → T-17 Checklist

| ID | Scenario | Expected | Observed | Pass? |
|---|---|---|---|---|
| T-01 | Create valid student | 201 | | ☐ |
| T-02 | Duplicate student email | 409 | | ☐ |
| T-03 | Drive for unknown company | 404 | | ☐ |
| T-04 | Evaluate eligible student | eligible=true + reasons | | ☐ |
| T-05 | Evaluate ineligible student | eligible=false + reasons | | ☐ |
| T-06 | Submit eligible application | 201 | | ☐ |
| T-07 | Submit duplicate application | 409 | | ☐ |
| T-08 | Submit ineligible application | documented 400/409 | | ☐ |
| T-09 | Apply after deadline | rejected | | ☐ |
| T-10 | Valid status transition | 200 | | ☐ |
| T-11 | Invalid status transition | 400/409 | | ☐ |
| T-12 | Retrieve unknown resource | 404 | | ☐ |
| T-13 | Blank/invalid field | 400 | | ☐ |
| T-14 | Chatbot general FAQ | 200 advisory answer | | ☐ |
| T-15 | Chatbot eligibility explanation | matches deterministic result | | ☐ |
| T-16 | Chatbot prep guidance | uses supplied role/skills | | ☐ |
| T-17 | Ollama unavailable | controlled 503; other APIs fine | | ☐ |

Bonus (unique features — not in the original spec but worth evidencing):
| ID | Scenario | Expected | Observed | Pass? |
|---|---|---|---|---|
| T-18 | Recompute application's hash chain | matches stored chain, no tampering | | ☐ |
| T-19 | Tamper one field of a signed EligibilityResult, re-verify | signature verification fails | | ☐ |
| T-20 | Pull a receipt, POST it to /api/verify unmodified | `{valid: true}` | | ☐ |
| T-21 | Hand-edit one field of a receipt, POST to /api/verify | `{valid: false}` | | ☐ |

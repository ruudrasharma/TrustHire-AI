# Screenshots

Required by the deliverable structure. These must be **real captures from your own running app/API** — put them directly in this folder with these exact filenames.

| Filename | What to capture | How |
|---|---|---|
| `successful-application.png` | A `201 Created` response body from `POST /api/drives/{driveId}/applications` | Postman response pane, or the "Application Submitted" screen in the web app |
| `duplicate-application.png` | A `409 Conflict` response when applying twice to the same drive | Postman response pane after re-running the same request |
| `chatbot-response.png` | A `200 OK` response from `POST /api/chat` with `advisory: true` in the body | Postman, or the AI Assistant chat drawer in the web app showing an answer |
| `ollama-unavailable.png` | A `503 Service Unavailable` from `/api/chat` **while every other endpoint still returns 200/201** (stop Ollama first, then show both a failed chat call and a working `GET /api/students/{id}` call side by side or in sequence) | Postman, two requests: one to `/api/chat` (503) and one to any other endpoint (200) |

## Bonus (recommended — evidences your unique features)
| Filename | What to capture |
|---|---|
| `hash-chain-audit.png` | `GET /api/applications/{id}/audit` response showing 2+ chained events with `prevHash`/`hash` |
| `signed-eligibility-result.png` | `GET /api/drives/{driveId}/eligibility/{studentId}` response showing the `signature` field |
| `receipt-verify-pass.png` | `POST /api/verify` with an unmodified receipt → `{valid: true}` |
| `receipt-verify-fail.png` | `POST /api/verify` with one field hand-edited → `{valid: false}` |
| `proof-rail-ui.png` | The web app's Proof Rail panel showing a signature/hash-chain state live |

Do not substitute mockups or placeholder images — these screenshots are graded evidence that the described behavior actually works.

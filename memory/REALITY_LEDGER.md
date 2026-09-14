# REALITY_LEDGER.md
*Per §80. Authoritative table of what is REAL vs what is not. Updated at the end of every phase.*

_Last updated: iteration 4 close (Phases 4+5+6+7 shipped)._

| Capability                          | State                | Source / Adapter                | Last verified          | Notes |
|-------------------------------------|----------------------|---------------------------------|------------------------|-------|
| MongoDB persistence                 | **LIVE**             | Motor (localhost:27017)         | iteration_4 pytest     | 27 collections seeded idempotently |
| Master L@B Map (nodes/edges)        | **LIVE**             | backend `/map`                  | iteration_4 pytest     | Add-node, set-truth mutations persist |
| Systems registry                    | **LIVE**             | backend `/systems`              | iteration_4 pytest     | Includes service_id, repo, depends_on, last_check |
| Missions + tasks                    | **LIVE**             | backend `/missions`, `/tasks`   | iteration_4 pytest     | 10-phase loop, advance persists |
| Approvals (§26 fields)              | **LIVE**             | backend `/approvals`            | iteration_4 pytest     | diff_id + verification_id + gov_class |
| Diffs (first-class §27)             | **LIVE**             | backend `/diffs/{id}`           | iteration_4 pytest     | Rendered in DiffViewer with red/green hunks |
| Jobs (§6 lifecycle)                 | **LIVE**             | backend `/jobs`                 | iteration_4 pytest     | advance/fail mutations record events |
| Approval → Job spawning             | **LIVE**             | `decide_approval`               | iteration_4 pytest     | On APPROVE with diff_id |
| Verification (auto on VERIFIED)     | **LIVE**             | `advance_job`                   | iteration_4 pytest     | PASSED record inserted, linked to job |
| Governance policies                 | **LIVE (read-only)** | backend `/policies`             | iteration_4 pytest     | No enforcement engine yet |
| Governance classes (§42)            | **LIVE (display)**   | backend `/routes`, `/services`  | iteration_4 pytest     | SAFE / CONTROLLED / FATHER APPROVAL / DO NOT TEST |
| Truth classes §24 (LIVE/DOWN/etc.)  | **LIVE (display)**   | backend `/services`             | iteration_4 pytest     | 9-state pill rendered on Services tab |
| Event log (append-only §39)         | **LIVE**             | `record_event`                  | iteration_4 pytest     | Every mutation writes an event |
| Mission strip (§23)                 | **LIVE**             | backend `/mission`              | iteration_4 pytest     | Global; MISSION · PHASE · MODE · GOV · TRUTH |
| Autonomy scope (§7)                 | **LIVE (display)**   | backend `/autonomy`             | iteration_4 pytest     | Allowed / Requires-Father lists |
| Jr state (§37)                      | **LIVE (display)**   | backend `/jr`                   | iteration_4 pytest     | wants_next surfaces on Home |
| Routes registry                     | **LIVE (display)**   | backend `/routes`               | iteration_4 pytest     | 8 endpoints with gov_class |
| Diagnostics                         | **LIVE (display)**   | backend `/diagnostics`          | iteration_4 pytest     | Ollama + Browser CDP labeled DOWN honestly |
| CELL console (conversation)         | **SIMULATED**        | regex `cellScript` in demo.js   | iteration_1            | Labeled "scripted" — no LLM |
| Runtime host telemetry (CPU/MEM)    | **SIMULATED**        | seed strings                    | —                      | Machine tab shows dashes with SIMULATED label |
| Ollama bridge                       | **DOWN**             | none                            | —                      | Diagnostics row marks it DOWN |
| Browser / CDP                       | **DOWN**             | none                            | —                      | Diagnostics row marks it DOWN |
| Git service                         | **NOT CONNECTED**    | none                            | —                      | Diffs are seeded, not from real Git |
| Filesystem service                  | **NOT CONNECTED**    | none                            | —                      | Not exposed |
| Memory (long-term/episodic/…)       | **DISPLAY-ONLY**     | backend `/memory`               | iteration_4            | No promotion/retention lifecycle yet |
| Observations                        | **LIVE**             | backend `/observations`         | iteration_5 pytest     | 5 seed types (LOG/CODE/SCREEN/MEDIA/EVENT), POST records event |
| Artifacts (§10-11 provenance)       | **LIVE**             | backend `/artifacts`            | iteration_5 pytest     | 5 seed classes, first-class provenance, verify records event, DOWN sources 409 |
| Browser / CDP                       | **DOWN** (honest)    | Phase-11 stub                   | iteration_5            | Renders BROWSER OFFLINE, refuses to fake |
| Provider (LLM adapter)              | **NOT IMPLEMENTED**  | —                               | —                      | Phase 10 target |
| Worker claim / territory (§62-63)   | **NOT IMPLEMENTED**  | —                               | —                      | Phase 12 target |

**Global mode**: `MODE: CONNECTED` (Mongo + backend); **DEMO banner still visible** per §57 until majority of adapters real.

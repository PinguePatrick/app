# INTEGRATION_STATUS.md
*Per §79. Tracks integration progression from mock → real. Updated per adapter.*

_Last updated: iteration 4 close._

## Adapter progression board

| Adapter          | Interface exists | Mock provider | Real provider | Notes |
|------------------|:----------------:|:-------------:|:-------------:|-------|
| **CellApi (HTTP seam)** | ✔ | — | ✔ | Single axios client at `REACT_APP_BACKEND_URL/api/cell/*` |
| **Persistence (Mongo)** | ✔ | — | ✔ | Motor async client, 27 collections |
| **Map**          | ✔ | — | ✔ | Full CRUD via backend |
| **Approvals**    | ✔ | — | ✔ | Full lifecycle with policy 409 |
| **Diffs**        | ✔ | — | ✔ (seeded) | Structure real, source seeded; will flip to Real Git in Phase 11 |
| **Jobs**         | ✔ | — | ✔ | §6 lifecycle + fail |
| **Verifications**| ✔ | — | ✔ (auto) | Auto-created on VERIFIED; independent postcondition check pending §38 |
| **Events**       | ✔ | — | ✔ | Append-only, every mutation emits |
| **Observations** | ✔ | — | ✔ (seeded + create) | 5 seed rows spanning LOG/CODE/SCREEN/MEDIA/EVENT; POST records event |
| **Artifacts**    | ✔ | — | ✔ (seeded + verify) | 5 seed rows spanning MARKDOWN/CODE/SCREENSHOT/IMAGE/JSON; verify records event; DOWN sources refuse verification (409) |
| **Memory (v2)**  | partial | ✔ (display-only seed) | — | Phase 9 target — add promotion lifecycle |
| **CELL provider (LLM)** | ✘ | ✔ (regex script) | — | Phase 10 target — provider-interface first, then Claude adapter via Emergent key |
| **Browser / CDP**| ✘ | — | — | Phase 11 target |
| **Ollama**       | ✘ | — | — | Phase 11 target |
| **Host telemetry**| ✘ | — | — | Phase 11 target — must never fabricate values |
| **Git**          | ✘ | — | — | Phase 11 target |
| **Filesystem**   | ✘ | — | — | Phase 11 target |
| **Runtime / process control** | ✘ | — | — | Phase 11 target — governed |

## Rule (§4, §32)
When an adapter is not yet real, the surface that consumes it MUST render one of:
`SIMULATED · NOT CONNECTED · DOWN · UNVERIFIED · STALE · ERROR / FAILED`.
Never green.

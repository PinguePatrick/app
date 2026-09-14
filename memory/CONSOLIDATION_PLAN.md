# CONSOLIDATION_PLAN.md
*The "Required First Report" per §105.  No app code is changing in this pass — this is the plan you approve before Phase 4+.*

## Current architecture (one line)
React 19 + Tailwind + Shadcn frontend calling a FastAPI + MongoDB backend at `/api/cell/*`; nine-page dark-cyan operator cockpit with a working map, real governance, and a scripted CELL console. Details: `ARCHITECTURE_INVENTORY.md`.

## What is already real (§105 item 2)
- Persisted L@B map, systems, missions, approvals in MongoDB
- Real mutations for `approve/block`, `add-node`, `set-truth`, `advance-phase`, `reseed`
- Real event log written by every mutation
- Two-world identity: JR (operator) → CELL (brain) → L@B (env)
- Explicit DEMO banner on every screen; no fake telemetry

## What is simulated (§105 item 3)
- CELL console (regex script, no LLM)
- Agent posture, runtime CPU/MEM, source freshness
- Governance policies (labels, no enforcement engine)
- Verification stage (does not exist yet)

## What is duplicated (§105 item 4)
- `frontend/src/data/demo.js` — mirrored by `backend/seed_data.py`. Kept as shape reference only; not imported.
- No other duplication.

## What will be preserved (§105 item 5)
- Current shell: top bar + left nav + main + right inspector + CELL console + Cmd+K palette
- Truth model (KNOWN/UNKNOWN/STALE/CONFLICTING/SIMULATED) on map nodes
- Persistence layer + mutation endpoints
- Design tokens: near-black + phosphor cyan, IBM Plex Mono / JetBrains Mono / Chivo
- All existing data-testids

## What will be integrated (§105 item 6)
Applied from `HISTORICAL_CAPABILITY_MAP.md`. Each becomes a *capability inside a modern surface*, not a new page:
- Build Board lifecycle → **Work → Builds** (governed state machine)
- Autonomy → **Home autonomy row** + **Governance → Autonomy**
- Operator Cockpit → **System** (Services / Runtime / Machine / Routes / Diagnostics)
- Watch / Showroom / Studio → **Observe** (Browser / Media / Code / Artifacts / Live output)
- Journal / What Jr Noticed → **Memory** (with provenance & retention)
- Multi-runtime Control → **System → Runtime** node cards
- Privacy Routing → **Governance → Routing**

## What will be archived (§105 item 7)
- Nothing to archive in-repo yet (the current app has no historical pages). The archive rule (§97) becomes active only if the user hands over historical HTML in a later pass.

## What will be removed (§105 item 8)
- `frontend/src/data/demo.js` will be moved to `frontend/src/data/_demo.reference.js` and no longer imported (kept for shape reference).
- Two nav items collapse: **Knowledge** → merged into L@B Map & Memory. **History** → merged into Governance.
- Two new nav items appear: **Observe** and **Settings**.
- No route silently disappears — every removed nav gets a redirect.

## New backend contracts required (§105 item 9)
All under `/api/cell/*` — additive, no breaking changes.

```
DOMAIN OBJECTS (new / extended)
  Job          {id, title, mission_id, worker, state[9], progress, files[], input, output, error, approval_id?, verification_id?, timestamps}
  Proposal     {id, mission_id, worker, rationale, source, risk[4], files[], acceptance, state[7]}   (state = DISCOVERED..VERIFIED)
  Diff         {id, proposal_id, files:[{path, additions, removals, hunks}]}
  Verification {id, target_kind, target_id, state[3], evidence, ts}   (PENDING|PASSED|FAILED)
  Event        {id, ts, kind, actor, subject_kind, subject_id, text}   (already exists — extend with actor+subject)
  Artifact     {id, kind[image|video|md|code|html], provenance, job_id, ts, live|cached|simulated}
  Observation  {id, source[browser|media|code], provenance, ts, retention[EPHEMERAL|CANDIDATE|PROMOTED]}
  Service      {id, name, kind, host, port, status[LIVE|DOWN|CACHED|SIMULATED|UNKNOWN], last_check, deps[], consumers[]}
  Route        {id, method, path, handler, gov_class[SAFE|CONTROLLED|FATHER|DO_NOT_TEST]}

NEW ENDPOINTS
  POST /api/cell/proposals                                       (create)
  POST /api/cell/proposals/{id}/attach-diff
  POST /api/cell/proposals/{id}/advance    body: {to: state}
  GET  /api/cell/jobs                       ?state=&worker=
  POST /api/cell/jobs                       (start from proposal)
  POST /api/cell/jobs/{id}/progress
  POST /api/cell/jobs/{id}/complete
  POST /api/cell/jobs/{id}/fail
  POST /api/cell/verifications              (attach to job or applied change)
  GET  /api/cell/services                   (each with LIVE/DOWN/… truth)
  GET  /api/cell/routes                     (with governance class)
  GET  /api/cell/observations
  POST /api/cell/observations/{id}/promote  (Observation → Memory)
  GET  /api/cell/artifacts
```

## Frontend architectural reshape (§67, §68, §70)
Split the single `cellApi.js` into **per-domain services** (still one HTTP base):
```
frontend/src/services/
  http.js                        (shared axios instance + safe())
  MissionService.js
  AgentService.js
  JobService.js
  ProposalService.js
  ApprovalService.js
  MapService.js
  RuntimeService.js
  MemoryService.js
  ObservationService.js
  ArtifactService.js
  GovernanceService.js
```
`CellContext` becomes an authoritative `appState` slice-store keyed by domain (mission/services/agents/jobs/approvals/memory/observations/artifacts/map/problems/notifications/runtime — §68). Views render state; services mutate state.

## Phased delivery (§94 — do NOT do all at once)

| Phase | Scope                                                                                                         | Ship criteria |
|-------|---------------------------------------------------------------------------------------------------------------|---------------|
| **1** | This report + inventory + capability map                                                                      | ✔ (this turn) |
| **2** | Shared domain model in backend (`models.py`) + new collections seeded empty                                   | new endpoints return `[]` cleanly |
| **3** | **Home** rebuild to answer the 10 questions in §87 (mission strip, autonomy row, active work, approvals, health, activity, next-focus, Father-alerts) | one screen, no fake data |
| **4** | **Work** consolidation: Jobs + Builds + Loop + Verification with the §6 state machine, backed by real endpoints | job.start → progress → complete/fail → verify visible |
| **5** | **Governance** upgrade: Diff object, approval fields (§26), verification lifecycle, routing settings           | approving now creates a Job, blocks by risk-class, records verification |
| **6** | **L@B Map** upgrade: node inspector adds services / repos / dependencies / consumers / last-check              | clicking a service node shows real health class |
| **7** | **System**: Services / Runtime / Machine / Compute / Routes / Diagnostics with LIVE/DOWN/CACHED/SIMULATED truth | zero fake green states |
| **8** | **Observe**: Browser (offline stub) + Artifacts stage with provenance + Media/Code viewers                     | every artifact shows Where/When/Who/Live-or-Cached |
| **9** | **Memory** upgrade: Working/Episodic/Semantic/Procedural/Meta + Observation → Candidate → Promoted lifecycle    | promotion is a visible governed action |
| **10**| **Settings** + Command Palette expansion + Terminal (read-only)                                               | every setting declares CONFIGURED/NOT CONFIGURED/SIMULATED |
| **11**| Mock → Real migration, one service at a time (§31, §94 Phase 10)                                              | flip flags per service, never rewrite views |

## Test plan per phase (§72-83, §103)
- Shell test after every phase (§73)
- Cross-surface test (§83): a Job started from Home appears in Jobs, Worker, Activity, Mission, Map
- Simulation test (§77): every SIMULATED path must never mutate the real environment
- Failure test (§80): apply-success/verification-fail state visible and NOT green
- No-button-theater test (§84): every button either works, blocks safely, or shows why unavailable

## What is deliberately out of scope
- No LLM in CELL console yet (Phase 10 candidate)
- No real Git / Terminal privileged execution (Phase 11)
- No commerce (frozen, §18)
- No Arcade (§19)
- No new pages for Work-only / Drive-only / Watch-only / etc. (§1)

## Decision needed from JR before Phase 2
1. **Confirm the 9 modern destinations from §98** (Home / Work / Agents / Observe / Memory / L@B Map / System / Governance / Settings) — proceed exactly as listed?
2. **Confirm Phase 2 first (domain model + empty new endpoints)** — or would you rather jump straight to Phase 3 (Home rebuild) so you see a visible payoff on the next turn?
3. **Confirm mock migration cadence** — one service at a time (§31), or batch by phase?
4. **Confirm nothing gets deleted** without an explicit `KEEP/REMOVE/MERGE` decision (§95).

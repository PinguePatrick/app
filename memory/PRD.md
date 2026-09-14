# CELL — L@B Command Interface (PRD)

## Problem statement (verbatim)
Build CELL, the central operational brain and command interface of a local-first AI laboratory called L@B, designed as an AI operations platform rather than a generic chatbot or marketing site. Dark, sophisticated command-center UI with a main CELL Command Center, Master L@B Map, Elite Teams, Operations, Knowledge, Memory, Runtime, Governance, History, global search, command palette, and an integrated CELL conversation panel. The Master L@B Map is the architectural source-of-truth interface, explicitly distinguishing KNOWN / UNKNOWN / STALE / CONFLICTING / SIMULATED information. Enforce visible governance and approval states. Principle: THE MAP IS THE TRUTH.

## User personas
- **JR** — Operator of CELL (root clearance L4)
- **CELL** — AI operator of L@B; runs the observe→update-map loop on JR's behalf
- **Elite Teams** — agent squads (Vanguard, Scribe, Forge, Signal, Watchtower, Custodian)

## Core requirements (static)
- Desktop-first ops UI: top status bar + left nav + central workspace + right context inspector
- 9 sections: Command Center, Master L@B Map, Elite Teams, Operations, Knowledge, Memory, Runtime, Governance, History
- Cmd+K command palette (nav + entities), global search trigger in top bar
- Dockable CELL conversation panel (scripted, deterministic; not a real LLM)
- Explicit visual encoding for data states KNOWN / UNKNOWN / STALE / CONFLICTING / SIMULATED
- Governance badges (PENDING / APPROVED / BLOCKED / EXECUTED); approvals require JR
- Operational loop visible on missions: observe → locate truth → understand → plan → governance → approve → execute → verify → record → update map
- Realistic clearly labeled DEMO data. No fabricated live telemetry, permissions, or connections.
- Abstraction layer (`services/cellApi.js`) ready to swap in a real backend

## Implemented (2026-02-12)
- Dark near-black + phosphor cyan (#00E5FF) aesthetic, IBM Plex Mono / JetBrains Mono / Chivo typography, sharp corners, scanline/grid textures
- Full shell (top bar, left nav, right inspector, DEMO banner, conversation panel, command palette)
- All 9 pages with dense demo data (7 systems, 6 agents, 6 teams, 4 missions, 6 tasks, 5 sources, 3 approvals, 3 risks, 11 history events, 5 memory entries, 4 runtime hosts, 4 policies)
- Interactive SVG Master L@B Map with 8 nodes, 12 edges, 5 truth states + filter toolbar; click a node to inspect
- Context inspector reveals full attributes for any selected entity (system/agent/mission/approval/source)
- Governance actions (Approve/Block) surface toast confirmations; BLOCKED items refuse override
- Scripted CELL console with keyword-matched replies

## Implemented (2026-02-12, iteration 2 — real backend)
- FastAPI + MongoDB backend at `/api/cell/*` with idempotent startup seeding (`seed_data.py`)
- 16 read endpoints mirror the frontend view model (state, operator, systems, agents, teams, missions, tasks, sources, approvals, risks, events, history, map, memory, runtime, policies)
- Mutation endpoints — every one auto-records an event and updates `last_map_sync`:
  - `POST /api/cell/approvals/{id}/decide` (APPROVE / BLOCK, refuses to override BLOCKED with 409)
  - `POST /api/cell/map/nodes` (adds node, mirrors into /systems)
  - `POST /api/cell/map/nodes/{id}/truth?truth=…` (KNOWN | UNKNOWN | STALE | CONFLICTING | SIMULATED)
  - `POST /api/cell/missions/{id}/advance` (loop phase advance)
  - `POST /api/cell/reseed` (dev reset)
- Frontend `cellApi.js` swapped from local mocks to axios calls against REACT_APP_BACKEND_URL
- New UI actions: MasterMap "Add node", per-row "Set truth" buttons, Operations "Advance phase", Governance approve/block persist and re-fetch via `refresh()`

## Implemented (2026-02-12, iteration 3 — Phase 3 Home rebuild)
- New backend endpoints: `GET /api/cell/mission`, `/autonomy`, `/jr` (all seeded, all `_id`-projected)
- **Global Mission Strip** below the top bar, on every route: MISSION · PHASE · MODE (`CONNECTED` | `SIMULATED`) · GOVERNANCE (`FATHER APPROVAL`) · TRUTH (`MASTER_LAB_MAP.md`) — §23
- **Rebuilt Home** answers the 10 §87 questions on one screen:
  1. Current mission → Mission Strip
  2. What is Jr doing → `identity-jr` card
  3. What is CELL doing → `identity-cell` card
  4. Which workers are active → `metric-workers` tile
  5. What jobs are running → Active operations
  6. What changed recently → Recent activity
  7. What is broken → Problems panel
  8. What requires approval → Father Alerts (prominent) + Approval queue
  9. L@B state → Truth breakdown
  10. What Jr wants next → NextFocus panel with per-item RISK + FATHER badges
- CELL and Jr identities kept explicitly separate (§36-37)
- Autonomy scope panel with `MODE`, ALLOWED / REQUIRES FATHER split (§7 Drive concept)
- Zero regressions: all mutations, palette, right-inspector, CELL console, DEMO banner preserved
- **Documents produced** (§105 Required First Report): `/app/memory/ARCHITECTURE_INVENTORY.md`, `HISTORICAL_CAPABILITY_MAP.md`, `CONSOLIDATION_PLAN.md`

## Implemented (2026-02-12, iteration 4 — Phases 4+5+6+7)
- **Phase 4 Work**: Operations page rebuilt as 4-tab Work surface (Jobs / Governed Builds / Mission Loop / Verification) with the §6 governed lifecycle bar (DISCOVERED → PROPOSED → REVIEW → APPROVED → BUILDING → TESTING → VERIFIED + failure states REJECTED / FAILED / VERIFICATION_FAILED). Advance/Fail buttons per active job.
- **Phase 5 Governance v2**: `Diff` is now a first-class object — every approval carries a `diff_id`, a `view-diff-{id}` button opens `DiffViewer` overlay with red/green hunks. `Verification` lifecycle wired (auto-created PASSED on job VERIFIED). Routing settings panel added (reference-only). Approving an approval now spawns a follow-on Job (§56).
- **Phase 6 L@B Map v2**: Right Inspector extended with facets for Service (truth pill), Repository, Depends-on / Consumers (clickable), Last-check, Related jobs — turns the map into an operational instrument (§28-30, §56-60).
- **Phase 7 System**: Runtime page rebuilt as 5-tab System surface (Services / Runtime / Machine / Routes / Diagnostics). Full §24 truth model live (LIVE / VERIFIED / CACHED / SIMULATED / STALE / UNKNOWN / DOWN / ERROR) — no fake green. Machine tab shows dashes explicitly (§32). Routes carry gov_class SAFE / CONTROLLED / FATHER APPROVAL / DO NOT TEST (§42).
- Backend: 8 new collections + 10 new endpoints + extended approval-decide to spawn Jobs. `/reseed` decorator bug fixed.
- Zero regressions. Shell, palette, right inspector, CELL console, DEMO banner, MissionStrip and every previous data-testid preserved.

## Testing status
- iteration_4: backend 39/39 pytest (serial) pass; frontend 100% of tested flows pass; zero critical bugs.

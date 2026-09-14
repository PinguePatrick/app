# ARCHITECTURE_INVENTORY.md
*Phase 1 · No behavior changes in this pass. Read-only inspection.*

## 1. What exists right now in `/app`

### Frontend (React 19 + Tailwind + Shadcn)
```
src/
├── App.js                        BrowserRouter, wraps <CellProvider> + <Shell>
├── index.css                     dark theme, cyan phosphor, IBM Plex/JetBrains/Chivo, scanlines
├── data/demo.js                  local demo data (now unused — kept as fallback)
├── services/cellApi.js           axios → REACT_APP_BACKEND_URL/api/cell/*  (REAL)
├── state/CellContext.jsx         single React Context: loads all reads on mount, exposes refresh()
├── components/
│   ├── DataStatePill.jsx         KNOWN | UNKNOWN | STALE | CONFLICTING | SIMULATED
│   ├── GovernanceBadge.jsx       PENDING | APPROVED | BLOCKED | EXECUTED
│   ├── MetricTile, Panel, DemoBanner
├── layout/
│   ├── Shell.jsx                 top bar + left nav + main + right inspector + convo + palette
│   ├── TopBar.jsx                CELL identity, STATUS/POSTURE/MAP SYNC, global search, operator
│   ├── LeftNav.jsx               9-item vertical nav
│   ├── RightInspector.jsx        context inspector for selected entity
│   ├── ConversationPanel.jsx     scripted CELL console (deterministic, no LLM)
│   └── CommandPalette.jsx        Cmd+K palette over Navigate/Systems/Agents/Missions
└── pages/                        (9 pages, thin — data comes from context)
    ├── CommandCenter.jsx         hero + 6 metrics + missions + approvals + truth + risks + events + loop strip
    ├── MasterMap.jsx             SVG canvas, 5-state visual encoding, filter, add-node form, set-truth buttons
    ├── EliteTeams.jsx            6 team panels with rosters
    ├── Operations.jsx            missions + 10-step loop bar + task list + advance-phase
    ├── Knowledge.jsx             sources of truth table
    ├── Memory.jsx                4 scope panels (long-term/episodic/semantic/working)
    ├── Runtime.jsx               hosts table with truth column
    ├── Governance.jsx            approval queue + policies list
    └── History.jsx               append-only event log
```

### Backend (FastAPI + Motor + Mongo)
```
backend/
├── server.py         /api/cell/* — 16 read routes + 5 mutation routes + /reseed
├── seed_data.py      idempotent SEED dict for 16 collections
└── requirements.txt  unchanged
```

### Wire diagram
```
React view → useCell() → cellApi.js (axios) → FastAPI /api/cell/* → Motor → Mongo
                                    ↑
                             refresh() re-fetches all collections after any mutation
```

## 2. What is REAL vs SIMULATED (honesty ledger)

| Capability                              | Status                | Notes |
|-----------------------------------------|-----------------------|-------|
| MongoDB persistence of map/systems      | **REAL**              | Motor + `test_database`; survives restarts |
| Approve/Block approvals (with policy 409) | **REAL**            | Persisted, events recorded |
| Add map node                            | **REAL**              | Mirrors to /systems, records MAP_UPDATE |
| Set node truth                          | **REAL**              | Persists across restarts |
| Advance mission phase                   | **REAL**              | 10-phase loop, persisted |
| Event stream                            | **REAL** (append-only)| Written by every mutation |
| CELL conversation                       | **SIMULATED**         | Regex script in demo.js — no LLM |
| Runtime CPU/MEM values                  | **SIMULATED**         | Static strings from seed |
| Agent "posture" (EXECUTING/IDLE/…)      | **SIMULATED**         | Static labels |
| Governance policies                     | **SIMULATED**         | Read-only labels; no enforcement engine |
| Verification stage                      | **NOT IMPLEMENTED**   | Loop advances but nothing verifies |
| Diff / proposal object                  | **NOT IMPLEMENTED**   | Approvals have no attached diff |
| File / repo / Git surface               | **NOT IMPLEMENTED**   | No editor, no repo tree |
| Terminal / bottom panel                 | **NOT IMPLEMENTED**   | |
| Browser observation                     | **NOT IMPLEMENTED**   | |
| Artifacts / Showroom                    | **NOT IMPLEMENTED**   | |
| Autonomy / Drive controls               | **NOT IMPLEMENTED**   | |
| Memory provenance / promotion lifecycle | **NOT IMPLEMENTED**   | Memory page is static list |
| Service abstraction layer               | **PARTIAL**           | Only `cellApi` exists (single client); no per-domain services |

## 3. Truth-model status
Current app implements 5 map-node classes: `KNOWN | UNKNOWN | STALE | CONFLICTING | SIMULATED`.
The directive (§24) wants a broader event/service class:
`LIVE | VERIFIED | CACHED | SIMULATED | PROPOSED | STALE | UNKNOWN | DOWN | ERROR`.
→ Extend, don't replace: node-truth stays; add a **runtime-truth** class alongside it.

## 4. Governance-model status
Current: 4-state approval (`PENDING/APPROVED/BLOCKED/EXECUTED`) plus policies.
Directive (§26, §43) wants: `PENDING/APPROVED/REJECTED/EXPIRED/APPLIED/VERIFIED/FAILED`.
Also wants (§27) `Diff` as a first-class object attached to every approval.
→ Extend backend model, keep existing endpoints backward-compatible.

## 5. Duplicates / risks
- Frontend `data/demo.js` is now dead code (backend seeds instead). Keep as a fallback shape reference; do not import in components.
- `services/cellApi.js` is a single client, not a service layer. The directive (§30, §70) wants **per-domain services** (Mission, Agent, Job, Memory, Map, Runtime, FS, Git, Browser, Artifact, Governance).
- Nothing to remove yet. No panel sprawl. No dead routes.

## 6. Non-negotiable rules already respected
✓ No fake live telemetry (DEMO banner explicit)
✓ Simulated state visible (SIM pills, DEMO banner, "scripted" tag on console)
✓ Approval workflow real, BLOCKED refuses override with 409
✓ THE MAP IS THE TRUTH principle wired
✓ Two-world model preserved: JR → CELL → L@B
✓ No emoji icons, no purple gradients, no Inter font, no "success theater"

## 7. Non-negotiable rules NOT YET respected
✗ No verification stage after apply
✗ No `Diff` object attached to approvals
✗ No `Job` primitive (missions are the closest but lack workers, files, tests)
✗ No per-service truth (LIVE/DOWN/CACHED/…) on the runtime/services surfaces
✗ Governance/Risk classification (SAFE/CONTROLLED/FATHER APPROVAL/DO NOT TEST) not encoded on actions

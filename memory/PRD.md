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

## Prioritized backlog
- **P1 — Real backend abstraction**: wire `cellApi` to FastAPI endpoints returning the same shape
- **P1 — Map editing**: add a node / mark as UNKNOWN / promote a SIMULATED node into KNOWN with an audit event
- **P2 — Live LLM in CELL console**: swap scripted replies for Claude Sonnet 5 via Emergent LLM key
- **P2 — Timeline/scrubber for History**: filter by kind, time range
- **P2 — Keyboard-driven navigation**: `g c` / `g m` shortcuts, focus rings on all rows
- **P3 — Multi-operator support**: additional user roles beyond JR
- **P3 — Real telemetry adapter**: Prometheus/OTel bridge (behind explicit toggle so we never fabricate)

## Testing status
- iteration_1 frontend suite: 100% of tested flows pass; one low-priority a11y warning (DialogTitle) fixed.

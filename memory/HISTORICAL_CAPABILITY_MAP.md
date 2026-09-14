# HISTORICAL_CAPABILITY_MAP.md
*Phase 2 · No behavior changes. Extracts capability from each historical system and assigns it to a modern destination.*
*Rule (§1, §5, §95, §96): **Do NOT create one page per historical system.** Recover the capability, place it in the correct modern surface, then delete the duplicate.*

## Modern destination set (locked from §98)
```
HOME · WORK · AGENTS · OBSERVE · MEMORY · L@B MAP · SYSTEM · GOVERNANCE · SETTINGS
```
Supporting surfaces (overlays / bottom panel, not top-level): **Jobs, Loop, Approvals, Terminal, Problems, Artifacts, Inspector, Command Palette**.

## Historical → modern map

| Historical system            | Strongest capability                             | Modern home                | Priority | Action |
|------------------------------|--------------------------------------------------|----------------------------|----------|--------|
| **Jros — Work**              | operational logs, crew, council, loop, history   | **Work → Operations**      | P1       | INTEGRATE |
| **Jros — Build Board**       | proposal → approve → build → test → verify SM    | **Work → Builds** + Governance | P1   | INTEGRATE — this is the governed lifecycle §6 |
| **Jros — Drive**             | autonomy scope, heartbeat, cadence, next focus   | **Home → autonomy row** + Governance → Autonomy | P2 | INTEGRATE |
| **Operator Cockpit**         | service health, routes, scheduler, kill switches | **System** (+ Home health strip) | P1 | INTEGRATE |
| **Watch Jr**                 | browser/media/code observation with provenance   | **Observe**                | P2       | INTEGRATE (behind “not-connected” state where offline) |
| **Jr Showroom**              | live output stage (image/video/md/code/iframe)   | **Observe → Artifacts**    | P2       | RENAME to Artifact Viewer |
| **Jr Studio**                | REQUEST → GENERATE → PROGRESS → RESULT           | **Work → Jobs** (as one Job kind) | P2 | INTEGRATE — key idea is visible long-running state |
| **Reasoning Journal**        | conversation, keywords, tags, learning history   | **Memory → Episodic**      | P2       | INTEGRATE |
| **What Jr Noticed**          | browsing awareness, retention controls           | **Memory + Observe**       | P2       | INTEGRATE with explicit governed-retention UI |
| **Jros Control (Jr/Jr3/JrOsX)** | multi-runtime identity + health              | **System → Runtime**       | P2       | INTEGRATE — no iframes, use inspector cards |
| **Privacy Routing / Edit Mode** | shield / direct routing state                | **Governance → Routing**   | P3       | INTEGRATE (reference only until real backend) |
| **AI Desk**                  | mirrored conversations, message viewer           | **Agents → Communication** (later) | P3 | DEFER |
| **Job Copilot**              | draft-only rules, no autonomous send             | **Governance rules** (constants) | P3 | REFERENCE ONLY (rule set, no page) |
| **Empire / commerce**        | trading, shop, bank                              | —                          | FROZEN   | DO NOT EXPAND (§18) |
| **Arcade**                   | —                                                 | —                          | —        | IGNORE (§19) |
| **Crew Art**                 | visual identity only                             | design tokens              | P4       | REFERENCE ONLY |

## Consolidation deltas from the *current* app (JrCockpit v1)

The current 9-item nav is close but not aligned with §98. Diff:

| Current nav        | Directive nav | Change                              |
|--------------------|---------------|-------------------------------------|
| Command Center     | **Home**      | Rename + expand to answer §87 ten questions |
| Master L@B Map     | **L@B Map**   | Keep; add per-node service/repo/runtime facets |
| Elite Teams        | **Agents**    | Rename; add CELL row + XJ-8/9/11 explicit roles |
| Operations         | **Work**      | Rename; add sub-surfaces Jobs / Loop / Builds / History / Verification |
| Knowledge          | **(merge)**   | Fold sources-of-truth into **L@B Map → nodes** and **Memory → Semantic** |
| Memory             | **Memory**    | Keep; add Working / Episodic / Semantic / Procedural / Meta / Provenance |
| Runtime            | **System**    | Rename; add Services / Runtime / Machine / Compute / Routes / Health / Diagnostics |
| Governance         | **Governance**| Keep; add Diff, Verification, Routing, Action history |
| History            | **(merge)**   | Fold into Governance → Action history + Home → Recent activity |
| —                  | **Observe**   | **NEW** — Browser + Media + Code + Artifacts + Live output |
| —                  | **Settings**  | **NEW** — Providers / Agents / CELL / L@B / Runtime / Git / Appearance |

Net effect: 9 → 9, but the **content** shifts to match §98. **No historical page is added 1-for-1.**

## Capability recovery rules (from directive)
- §6 Build Board lifecycle (DISCOVERED → PROPOSED → REVIEW → APPROVED → BUILDING → TESTING → VERIFIED, + failure states) → **required** on every Job/Proposal.
- §26 approval fields (id, action, source, requester, worker, target, risk, changes, reason, timestamp, state, decision, verification) → **required** on every approval object.
- §27 Diff as first-class object → attach `Diff` to every proposal.
- §32 no fake integration → every simulated provider labels itself SIMULATED / NOT CONNECTED / DOWN.
- §42 action-risk classification → SAFE / CONTROLLED / FATHER APPROVAL / DO NOT TEST tagged on every button.
- §43 verification is mandatory → every "APPLIED" state must transition to VERIFIED or VERIFICATION FAILED.
- §52 shared domain model → Mission, Agent, Worker, Service, Runtime, Job, Proposal, Approval, Diff, Verification, Memory, Observation, Artifact, Node, Route, Problem, Notification.
- §53 unified Event model → JOB_CREATED / APPROVAL_REQUESTED / VERIFICATION_PASSED / etc.

## What must NOT be built
- Standalone pages for Work-only, Drive-only, Watch-only, Showroom-only, Journal-only, Build Board-only, Operator Cockpit-only, Studio-only (§1).
- Any commerce lane expansion (§18).
- Fake service health, fake browser, fake jobs, fake git push (§32, §33).
- Buttons that toast-and-do-nothing (§84).

# Phase 8 · OBSERVE — Pre-Report
*Per §92. Read this and confirm scope before implementation.*

## CURRENT STATE
- No Observation or Artifact primitive in the backend yet.
- No Browser / Media / Code viewer surface in the cockpit.
- Watch-Jr and Showroom capabilities are recovered on paper only (see HISTORICAL_CAPABILITY_MAP.md).
- Existing surfaces available to receive Observe capability: `/operations` (Jobs), `/map` (nodes), `/history` (events), Right Inspector.

## TARGET (from §6-12)
Introduce **first-class Observations and Artifacts** with provenance, integrated *into existing destinations*. No new top-level nav (§5).

Every Observation carries: `id · type · source · actor · timestamp · location · job_id · mission_id · truth · content_ref`.
Types: `BROWSER · MEDIA · CODE · SCREEN · ARTIFACT · LOG · EVENT`.

Every Artifact carries: `id · class · producer · job_id · mission_id · created · verified · content_ref`.
Classes: `IMAGE · VIDEO · MARKDOWN · CODE · HTML · JSON · TEXT · SCREENSHOT`.

## WHERE IT LANDS (no new panels)
- **Operations → new tab "Observe"** (5th tab) — Browser/Media/Code/Artifacts sub-tabs. When Browser adapter is DOWN, show `BROWSER OFFLINE · adapter not connected` per §8.
- **Home** — new "Latest artifacts" row (bounded to 3 items) linked to their producing Job.
- **Right Inspector** — Job selection now shows a *Related artifacts* facet.
- **History** — event kinds `OBSERVATION_CREATED` and `ARTIFACT_CREATED` become clickable → open the artifact/observation in place.
- **Map** — a system node's inspector already links to Related Jobs; extend to show Related Observations count where present.

## FILES TO CHANGE

### Backend (additive; no breaking changes)
- `seed_data.py` — add `observations` (5 seed rows) + `artifacts` (5 seed rows). Include DOWN-state placeholders for Browser.
- `server.py` — add:
  - `GET /api/cell/observations[?type=&job_id=]`
  - `GET /api/cell/observations/{id}`
  - `POST /api/cell/observations` (records `OBSERVATION_CREATED` event)
  - `GET /api/cell/artifacts[?job_id=]`
  - `GET /api/cell/artifacts/{id}`
  - `POST /api/cell/artifacts` (records `ARTIFACT_CREATED` event, `verified=false` by default)
  - `POST /api/cell/artifacts/{id}/verify` (records `ARTIFACT_VERIFIED` event)

### Frontend
- `services/cellApi.js` — add `getObservations`, `getObservation`, `getArtifacts`, `getArtifact`, `createObservation`, `createArtifact`, `verifyArtifact`.
- `state/CellContext.jsx` — load `observations` + `artifacts` into the authoritative context.
- `components/ArtifactStage.jsx` — reusable viewer that adapts to class (image / video / markdown / code / html / json / text / screenshot). Shows provenance: WHERE FROM · WHEN · WHO · TRUTH.
- `components/BrowserObservation.jsx` — offline stub renderer: `BROWSER OFFLINE` state with "Retry" button that just records a diagnostic event (§8 rule).
- `pages/Operations.jsx` — add 5th tab **Observe** with sub-tabs Browser · Media · Code · Artifacts.
- `pages/CommandCenter.jsx` — insert "Latest artifacts" row (3 items).
- `layout/RightInspector.jsx` — extend Job selection to show a `facet-artifacts` list.

## NEW CONTRACTS
```
Observation { id, type, source, actor, ts, location, job_id?, mission_id?, truth, content_ref }
Artifact    { id, class, producer, job_id?, mission_id?, created, verified, content_ref, provenance }
```
`content_ref` for demo will be a URL string or inline text — no binary storage yet. Real binary storage arrives in Phase 11 with a filesystem adapter.

## GOVERNANCE IMPACT
- No new governance surface. Observations and Artifacts are read-only by default; verification of an Artifact reuses the existing verification model (§43, §11).
- Recording an Observation is **SAFE** (no privileged action).
- Verifying an Artifact is **CONTROLLED** — no Father approval required, but the state transition is recorded as an event.

## TEST PLAN (per §74-77)
- **Backend regression**: all 39 existing pytest cases must still pass.
- **New backend cases** (~14 targeted):
  - GET returns seed rows; filter by `type` and `job_id`
  - POST observation records `OBSERVATION_CREATED` event with correct actor
  - POST artifact creates with `verified=false`
  - POST /verify flips `verified=true` and emits `ARTIFACT_VERIFIED`
  - GET /{id} 404 on missing
  - JSON has no `_id`
- **Frontend flows**:
  - Operations → Observe tab renders 4 sub-tabs
  - Browser sub-tab shows `BROWSER OFFLINE` when adapter DOWN (always today)
  - Artifacts sub-tab renders 5 artifacts; unverified ones tagged `UNVERIFIED`
  - Clicking artifact opens ArtifactStage with provenance visible
  - Home shows "Latest artifacts" row
  - Right Inspector on a Job shows Related Artifacts count
  - History rows for `OBSERVATION_CREATED` / `ARTIFACT_CREATED` are clickable
- **Non-regression**:
  - Mission Strip still global
  - DiffViewer still opens
  - Approve-spawns-Job still works
  - Cmd+K still opens

## ROLLBACK PLAN
- All changes are additive. Rollback = revert 6 files and drop `observations` + `artifacts` collections.
- No existing endpoint or schema is modified.
- Frontend routes unchanged; palette/mission-strip untouched.
- Rollback verification: run existing pytest — all 39 pass.

## OUT OF SCOPE (deferred to later phases)
- Real Chrome CDP integration (§32, Phase 11)
- Memory promotion lifecycle from Observation → Candidate → Promoted (§16, Phase 9)
- Live LLM CELL summarization of observations (§18, Phase 10)
- Binary content storage (Phase 11 with filesystem adapter)

## DECISION FOR JR
1. Confirm scope as above? (No new nav item; Observations & Artifacts land inside Operations, Home, Inspector, History, Map)
2. Confirm `content_ref` starts as a URL / inline string (no binary storage yet)?
3. Any observation types or artifact classes you'd like added / removed?

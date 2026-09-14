# Phase 8 · OBSERVE — Post-Report
*Per §93.*

## WHAT CHANGED
### Backend
- New collections seeded (idempotent): `observations` (5 rows), `artifacts` (5 rows).
- New endpoints (7): `GET /observations[?type=&job_id=]`, `GET /observations/{id}`, `POST /observations`, `GET /artifacts[?job_id=]`, `GET /artifacts/{id}`, `POST /artifacts`, `POST /artifacts/{id}/verify`.
- Every mutation emits an event (`OBSERVATION_CREATED`, `ARTIFACT_CREATED`, `ARTIFACT_VERIFIED`).
- `verify` refuses to promote a DOWN source (409 per §11).

### Frontend
- **Operations gets a 5th tab "Observe"** with 4 sub-tabs (Browser · Media · Code · Artifacts).
- New reusable `ArtifactStage` component: adapts to class, refuses to display when source is DOWN, exposes full provenance (Where from · Job · Mission · Created · Truth).
- New `BrowserObservation` component: honest OFFLINE stub per §8, records a diagnostic observation on Retry.
- **Home** gets a "Latest artifacts" row (3 items linked to Operations).
- **Right Inspector** gets a `facet-artifacts` panel on Job / Mission / System selection.
- **History** rows for `OBSERVATION_CREATED / ARTIFACT_CREATED / ARTIFACT_VERIFIED / JOB / APPROVAL` are clickable.

### Hygiene (§78)
- Command palette root now has canonical `data-testid="command-palette"`.
- `/agents` and `/settings` no-route warnings gone (catch-all `<Route path="*"><Navigate to="/"/></Route>` added).
- `pytest.ini` intentionally left untouched (explicit "AGENT: do NOT modify" note); tests already pass 50/50 serial.

## WHAT IS NOW REAL
- Observations & Artifacts persistence + mutation lifecycle
- Artifact verification path (with policy refusal for DOWN sources)
- Home → Operations → Right Inspector → History cross-surface links for artifacts

## WHAT REMAINS SIMULATED
- CELL console (still scripted — Phase 10)
- Browser CDP (still DOWN — Phase 11)
- Ollama · Git · Host telemetry · Filesystem · Runtime process control (all Phase 11)
- Memory promotion lifecycle (Phase 9)
- `content_ref` binaries — still URL/inline text only (binary storage arrives with the filesystem adapter in Phase 11)

## TEST RESULTS
- Backend: 50/50 pytest pass serial (39 previous + 11 new).
- Frontend: 100% of tested Phase 8 flows + regressions.
- No critical bugs. No app-side issues in reviewer comments.

## FAILURES FOUND / FIXED (during the pass)
- Backend forgot the `@api.post` decorator on `reseed` after a previous edit — fixed.
- Fresh SEED module wasn't picked up until backend restart — resolved by restart + reseed.
- Undefined `ServiceTruthPillObs` symbol in Operations Observe log — replaced with correct import.

## KNOWN LIMITATIONS
- ArtifactCreate uses `kls` on POST body (external API asymmetric with GET). Documented; will migrate to `Field(alias="class")` in a later hygiene pass.
- `record_event` still stores `HH:MM:SS` only; adequate for demo, ambiguous across days.
- Retry on Browser only records a diagnostic — real CDP connect is Phase 11.

## NEXT PHASE
Per §91: **Phase 9 — Memory v2** (Observation → Candidate → Promoted lifecycle). This wires directly on top of Phase 8: the new `observations` endpoint becomes the source, and Memory grows a promotion state machine with visible retention (CANDIDATE / ACTIVE / ARCHIVED / FORGOTTEN per §17). No new nav.

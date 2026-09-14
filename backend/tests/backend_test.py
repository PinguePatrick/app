"""Backend tests for CELL/JrCockpit — Phases 3+4+5+6+7."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # Ensure clean state at session start
    s.post(f"{API}/cell/reseed")
    return s


# ---- Phase 3 read endpoints ----
class TestPhase3Reads:
    def test_mission(self, client):
        d = client.get(f"{API}/cell/mission").json()
        assert d["codename"] == "MAKE-JRCOCKPIT-THE-ONE"
        assert d["governance"] == "FATHER APPROVAL"
        assert "_id" not in d

    def test_autonomy(self, client):
        d = client.get(f"{API}/cell/autonomy").json()
        assert d["mode"] == "CONTROLLED"
        assert len(d["allowed"]) > 0

    def test_jr(self, client):
        d = client.get(f"{API}/cell/jr").json()
        assert d["posture"] == "CONTEMPLATING"
        assert len(d["wants_next"]) == 3


# ---- Regression: existing reads ----
class TestRegressionReads:
    @pytest.mark.parametrize("path", [
        "/cell/state", "/cell/systems", "/cell/map", "/cell/approvals",
        "/cell/missions", "/cell/agents", "/cell/teams", "/cell/events",
        "/cell/risks", "/cell/tasks", "/cell/sources", "/cell/memory",
        "/cell/runtime", "/cell/policies", "/cell/operator", "/cell/history",
    ])
    def test_endpoint_200(self, client, path):
        r = client.get(f"{API}{path}")
        assert r.status_code == 200
        body = r.json()
        if isinstance(body, list):
            for it in body:
                assert "_id" not in it
        elif isinstance(body, dict):
            assert "_id" not in body

    def test_map_shape(self, client):
        d = client.get(f"{API}/cell/map").json()
        assert len(d["nodes"]) > 0
        for e in d["edges"]:
            assert "from" in e and "from_" not in e


# ---- Phase 4+6+7 new endpoints: jobs, proposals, verifications, services, routes, routing, diagnostics, diffs ----
class TestNewEndpoints:
    def test_jobs_seeded(self, client):
        jobs = client.get(f"{API}/cell/jobs").json()
        assert len(jobs) == 5
        ids = {j["id"] for j in jobs}
        assert {"job-001", "job-002", "job-003", "job-004", "job-005"} <= ids

    def test_proposals_seeded(self, client):
        props = client.get(f"{API}/cell/proposals").json()
        assert len(props) == 4
        states = {p["state"] for p in props}
        assert "REJECTED" in states

    def test_verifications_seeded(self, client):
        vs = client.get(f"{API}/cell/verifications").json()
        assert len(vs) >= 2
        states = {v["state"] for v in vs}
        assert "PASSED" in states and "FAILED" in states

    def test_services_seeded_all_statuses(self, client):
        svcs = client.get(f"{API}/cell/services").json()
        assert len(svcs) == 9
        statuses = {s["status"] for s in svcs}
        expected = {"LIVE", "VERIFIED", "CACHED", "SIMULATED", "STALE", "UNKNOWN", "DOWN", "ERROR"}
        assert expected <= statuses, f"missing: {expected - statuses}"

    def test_routes_seeded(self, client):
        rts = client.get(f"{API}/cell/routes").json()
        assert len(rts) == 8
        gov = {r["gov_class"] for r in rts}
        assert {"SAFE", "CONTROLLED", "FATHER APPROVAL", "DO NOT TEST"} <= gov

    def test_routing(self, client):
        d = client.get(f"{API}/cell/routing").json()
        assert d["mode"] == "DIRECT"

    def test_diagnostics(self, client):
        ds = client.get(f"{API}/cell/diagnostics").json()
        assert len(ds) == 4

    def test_diff_by_id(self, client):
        d = client.get(f"{API}/cell/diffs/diff-1").json()
        assert d["approval_id"] == "ap-1"
        assert len(d["files"]) >= 1

    def test_diff_not_found(self, client):
        r = client.get(f"{API}/cell/diffs/nope")
        assert r.status_code == 404


# ---- Phase 5 extended data ----
class TestExtendedData:
    def test_approvals_extended(self, client):
        aps = client.get(f"{API}/cell/approvals").json()
        for a in aps:
            assert "diff_id" in a and "verification_id" in a and "gov_class" in a

    def test_systems_extended(self, client):
        sys = client.get(f"{API}/cell/systems").json()
        for s in sys:
            assert "service_id" in s and "repo" in s and "depends_on" in s and "last_check" in s


# ---- Phase 4 job lifecycle mutations ----
class TestJobLifecycle:
    def test_advance_job_review_to_verified(self, client):
        # reseed for clean state
        client.post(f"{API}/cell/reseed")
        # job-002 starts REVIEW → APPROVED → BUILDING → TESTING → VERIFIED
        for expected in ["APPROVED", "BUILDING", "TESTING", "VERIFIED"]:
            r = client.post(f"{API}/cell/jobs/job-002/advance")
            assert r.status_code == 200, r.text
            assert r.json()["state"] == expected
        # verify verification_id was created
        j = r.json()
        assert j["verification_id"]
        vid = j["verification_id"]
        # verify appears in verifications list
        vs = client.get(f"{API}/cell/verifications").json()
        v = next((x for x in vs if x["id"] == vid), None)
        assert v is not None
        assert v["state"] == "PASSED"
        # cannot advance past terminal
        r2 = client.post(f"{API}/cell/jobs/job-002/advance")
        assert r2.status_code == 409

    def test_fail_job(self, client):
        client.post(f"{API}/cell/reseed")
        r = client.post(f"{API}/cell/jobs/job-003/fail", params={"reason": "test failure"})
        assert r.status_code == 200
        d = r.json()
        assert d["state"] == "FAILED"
        assert "test failure" in d.get("error", "")

    def test_advance_nonexistent(self, client):
        r = client.post(f"{API}/cell/jobs/no-such/advance")
        assert r.status_code == 404


# ---- Phase 5 governance: approve spawns job ----
class TestApprovalSpawnsJob:
    def test_approve_ap1_spawns_job(self, client):
        client.post(f"{API}/cell/reseed")
        jobs_before = client.get(f"{API}/cell/jobs").json()
        r = client.post(f"{API}/cell/approvals/ap-1/decide", json={"decision": "APPROVE"})
        assert r.status_code == 200
        assert r.json()["state"] == "APPROVED"
        jobs_after = client.get(f"{API}/cell/jobs").json()
        assert len(jobs_after) == len(jobs_before) + 1
        new_job = next((j for j in jobs_after if j["title"].startswith("Apply: RELAY-EDGE rebind")), None)
        assert new_job is not None
        assert new_job["state"] == "APPROVED"
        assert new_job["approval_id"] == "ap-1"

    def test_block_already_blocked_returns_409(self, client):
        # ap-2 is BLOCKED (from seed); trying to approve returns 409
        client.post(f"{API}/cell/reseed")
        r = client.post(f"{API}/cell/approvals/ap-2/decide", json={"decision": "APPROVE"})
        assert r.status_code == 409


# ---- Regression: reseed + other mutations ----
class TestMutationsRegression:
    def test_reseed(self, client):
        r = client.post(f"{API}/cell/reseed")
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_add_node_and_set_truth(self, client):
        r = client.post(f"{API}/cell/map/nodes", json={"label": "TEST_NODE", "kind": "external", "truth": "UNKNOWN"})
        assert r.status_code == 200
        nid = r.json()["id"]
        r2 = client.post(f"{API}/cell/map/nodes/{nid}/truth?truth=KNOWN")
        assert r2.status_code == 200 and r2.json()["truth"] == "KNOWN"

    def test_advance_mission(self, client):
        r = client.post(f"{API}/cell/missions/m-003/advance")
        assert r.status_code == 200



# ---- Phase 8: Observations & Artifacts ----
class TestPhase8Observations:
    def test_observations_seeded(self, client):
        obs = client.get(f"{API}/cell/observations").json()
        assert len(obs) == 5
        types = {o["type"] for o in obs}
        assert {"LOG", "CODE", "SCREEN", "MEDIA", "EVENT"} <= types
        for o in obs:
            assert "_id" not in o

    def test_observations_filter_by_type(self, client):
        obs = client.get(f"{API}/cell/observations?type=CODE").json()
        assert len(obs) >= 1
        assert all(o["type"] == "CODE" for o in obs)

    def test_get_observation_by_id(self, client):
        r = client.get(f"{API}/cell/observations/obs-1")
        assert r.status_code == 200
        assert r.json()["id"] == "obs-1"

    def test_get_observation_404(self, client):
        r = client.get(f"{API}/cell/observations/nope")
        assert r.status_code == 404

    def test_create_observation(self, client):
        client.post(f"{API}/cell/reseed")
        body = {"type": "LOG", "source": "TEST", "actor": "pytest", "truth": "LIVE"}
        r = client.post(f"{API}/cell/observations", json=body)
        assert r.status_code == 200
        d = r.json()
        assert d["id"].startswith("obs-")
        assert d["type"] == "LOG"
        assert d["actor"] == "pytest"
        # Verify OBSERVATION_CREATED event was recorded
        events = client.get(f"{API}/cell/events").json()
        assert any(e["kind"] == "OBSERVATION_CREATED" and "pytest" in e.get("text", "") for e in events)


class TestPhase8Artifacts:
    def test_artifacts_seeded(self, client):
        client.post(f"{API}/cell/reseed")
        arts = client.get(f"{API}/cell/artifacts").json()
        assert len(arts) == 5
        classes = {a["class"] for a in arts}
        assert {"MARKDOWN", "CODE", "SCREENSHOT", "IMAGE", "JSON"} <= classes
        for a in arts:
            assert "_id" not in a

    def test_artifacts_filter_by_job(self, client):
        arts = client.get(f"{API}/cell/artifacts?job_id=job-001").json()
        assert len(arts) >= 1
        assert all(a["job_id"] == "job-001" for a in arts)
        assert any(a["id"] == "art-1" for a in arts)

    def test_create_artifact_unverified(self, client):
        body = {"kls": "CODE", "producer": "TEST"}
        r = client.post(f"{API}/cell/artifacts", json=body)
        assert r.status_code == 200
        d = r.json()
        assert d["verified"] is False
        assert d["truth"] == "UNVERIFIED"
        events = client.get(f"{API}/cell/events").json()
        assert any(e["kind"] == "ARTIFACT_CREATED" for e in events)

    def test_verify_artifact_flips_state(self, client):
        client.post(f"{API}/cell/reseed")
        r = client.post(f"{API}/cell/artifacts/art-2/verify")
        assert r.status_code == 200
        d = r.json()
        assert d["verified"] is True
        assert d["truth"] == "VERIFIED"
        events = client.get(f"{API}/cell/events").json()
        assert any(e["kind"] == "ARTIFACT_VERIFIED" for e in events)

    def test_verify_down_artifact_409(self, client):
        r = client.post(f"{API}/cell/artifacts/art-3/verify")
        assert r.status_code == 409
        assert "DOWN" in r.text

    def test_reseed_restores_observations_and_artifacts(self, client):
        r = client.post(f"{API}/cell/reseed")
        assert r.status_code == 200
        obs = client.get(f"{API}/cell/observations").json()
        arts = client.get(f"{API}/cell/artifacts").json()
        assert len(obs) == 5
        assert len(arts) == 5
        art2 = next(a for a in arts if a["id"] == "art-2")
        assert art2["verified"] is False

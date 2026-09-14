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

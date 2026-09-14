"""Backend tests for CELL/JrCockpit consolidation Phase 3."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://lab-ops-hub-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- New Phase 3 read endpoints ----
class TestMission:
    def test_get_mission(self, client):
        r = client.get(f"{API}/cell/mission")
        assert r.status_code == 200
        d = r.json()
        assert d["codename"] == "MAKE-JRCOCKPIT-THE-ONE"
        assert d["phase"] == "CONSOLIDATION"
        assert d["mode"] == "CONNECTED"
        assert d["governance"] == "FATHER APPROVAL"
        assert d["truth_source"] == "MASTER_LAB_MAP.md"
        assert "objective" in d
        assert "_id" not in d


class TestAutonomy:
    def test_get_autonomy(self, client):
        r = client.get(f"{API}/cell/autonomy")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "autonomy"
        assert d["mode"] == "CONTROLLED"
        assert isinstance(d["allowed"], list) and len(d["allowed"]) > 0
        assert isinstance(d["requires_father"], list) and len(d["requires_father"]) > 0


class TestJr:
    def test_get_jr(self, client):
        r = client.get(f"{API}/cell/jr")
        assert r.status_code == 200
        d = r.json()
        assert d["handle"] == "Jr"
        assert d["posture"] == "CONTEMPLATING"
        assert isinstance(d["wants_next"], list)
        assert len(d["wants_next"]) == 3
        for w in d["wants_next"]:
            assert "text" in w and "risk" in w and "requires_father" in w


# ---- Regression: existing reads ----
class TestExistingReads:
    @pytest.mark.parametrize("path", [
        "/cell/state", "/cell/systems", "/cell/map", "/cell/approvals",
        "/cell/missions", "/cell/agents", "/cell/teams", "/cell/events",
        "/cell/risks", "/cell/tasks", "/cell/sources", "/cell/memory",
        "/cell/runtime", "/cell/policies", "/cell/operator", "/cell/history",
    ])
    def test_endpoint_200(self, client, path):
        r = client.get(f"{API}{path}")
        assert r.status_code == 200
        # verify no mongo _id leaked
        body = r.json()
        if isinstance(body, list):
            for it in body:
                assert "_id" not in it
        elif isinstance(body, dict):
            assert "_id" not in body

    def test_map_shape(self, client):
        d = client.get(f"{API}/cell/map").json()
        assert "nodes" in d and "edges" in d
        assert len(d["nodes"]) > 0
        # edges renamed from_ -> from
        for e in d["edges"]:
            assert "from" in e
            assert "from_" not in e


# ---- Regression: mutations ----
class TestMutations:
    def test_advance_mission(self, client):
        m_before = next(m for m in client.get(f"{API}/cell/missions").json() if m["id"] == "m-003")
        r = client.post(f"{API}/cell/missions/m-003/advance")
        assert r.status_code == 200
        assert r.json()["phase"] != m_before["phase"] or r.json()["phase"] == "UPDATE MAP"

    def test_add_node_and_set_truth(self, client):
        r = client.post(f"{API}/cell/map/nodes", json={"label": "TEST_NODE", "kind": "external", "truth": "UNKNOWN"})
        assert r.status_code == 200
        node_id = r.json()["id"]
        # verify persistence
        m = client.get(f"{API}/cell/map").json()
        assert any(n["id"] == node_id for n in m["nodes"])
        # set truth
        r2 = client.post(f"{API}/cell/map/nodes/{node_id}/truth?truth=KNOWN")
        assert r2.status_code == 200
        assert r2.json()["truth"] == "KNOWN"

    def test_decide_approval(self, client):
        # reseed to ensure ap-1 PENDING
        client.post(f"{API}/cell/reseed")
        r = client.post(f"{API}/cell/approvals/ap-1/decide", json={"decision": "APPROVE"})
        assert r.status_code == 200
        assert r.json()["state"] == "APPROVED"
        # blocked cannot approve
        r2 = client.post(f"{API}/cell/approvals/ap-2/decide", json={"decision": "APPROVE"})
        assert r2.status_code == 409

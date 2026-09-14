from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from pathlib import Path
from datetime import datetime, timezone
import os, logging, uuid

from seed_data import SEED

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="CELL // L@B backend")
api = APIRouter(prefix="/api")

# ---------- helpers ----------
PROJECT = {"_id": 0}

async def find_all(coll: str, sort=None):
    cur = db[coll].find({}, PROJECT)
    if sort:
        cur = cur.sort(sort)
    return await cur.to_list(1000)

async def seed_if_empty():
    for coll, docs in SEED.items():
        count = await db[coll].count_documents({})
        if count == 0 and docs:
            await db[coll].insert_many([dict(d) for d in docs])
            logging.info(f"[seed] {coll}: inserted {len(docs)}")

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hhmmss() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")

async def record_event(kind: str, text: str):
    await db.events.insert_one({
        "id": f"e-{uuid.uuid4().hex[:8]}",
        "ts": hhmmss(),
        "kind": kind,
        "text": text,
    })

# ---------- models ----------
class ApprovalDecision(BaseModel):
    decision: str  # APPROVE | BLOCK

class NodeCreate(BaseModel):
    label: str
    kind: str = "external"
    truth: str = "UNKNOWN"
    x: Optional[float] = None
    y: Optional[float] = None

class MissionPhaseUpdate(BaseModel):
    phase: str

# ---------- reads ----------
@api.get("/")
async def root():
    return {"service": "cell-backend", "principle": "THE MAP IS THE TRUTH", "seeded": True}

@api.get("/cell/state")
async def cell_state():
    doc = await db.cell_state.find_one({"id": "cell"}, PROJECT)
    return doc

@api.get("/cell/mission")
async def mission_current():
    doc = await db.mission.find_one({"id": "mission-active"}, PROJECT)
    return doc

@api.get("/cell/autonomy")
async def autonomy():
    doc = await db.autonomy.find_one({"id": "autonomy"}, PROJECT)
    return doc

@api.get("/cell/jr")
async def jr_state():
    doc = await db.jr_state.find_one({"id": "jr"}, PROJECT)
    return doc

@api.get("/cell/operator")
async def operator():
    doc = await db.operator.find_one({"id": "user-jr"}, PROJECT)
    return doc

@api.get("/cell/systems")
async def systems(): return await find_all("systems")

@api.get("/cell/agents")
async def agents(): return await find_all("agents")

@api.get("/cell/teams")
async def teams(): return await find_all("teams")

@api.get("/cell/missions")
async def missions(): return await find_all("missions")

@api.get("/cell/tasks")
async def tasks(): return await find_all("tasks")

@api.get("/cell/sources")
async def sources(): return await find_all("sources")

@api.get("/cell/approvals")
async def approvals(): return await find_all("approvals")

@api.get("/cell/risks")
async def risks(): return await find_all("risks")

@api.get("/cell/events")
async def events():
    # Return recent 40, newest first (by insertion order, we don't have a proper ts; keep original 11 first)
    return await find_all("events")

@api.get("/cell/history")
async def history():
    return await find_all("events")

@api.get("/cell/map")
async def map_data():
    nodes = await find_all("map_nodes")
    edges = await find_all("map_edges")
    # Rename from_ back to from for the frontend
    for e in edges:
        if "from_" in e:
            e["from"] = e.pop("from_")
    return {"nodes": nodes, "edges": edges}

@api.get("/cell/memory")
async def memory(): return await find_all("memory")

@api.get("/cell/runtime")
async def runtime(): return await find_all("runtime")

@api.get("/cell/jobs")
async def jobs(): return await find_all("jobs")

@api.get("/cell/proposals")
async def proposals(): return await find_all("proposals")

@api.get("/cell/diffs/{diff_id}")
async def get_diff(diff_id: str):
    doc = await db.diffs.find_one({"id": diff_id}, PROJECT)
    if not doc:
        raise HTTPException(404, "Diff not found")
    return doc

@api.get("/cell/verifications")
async def verifications(): return await find_all("verifications")

@api.get("/cell/services")
async def services(): return await find_all("services")

@api.get("/cell/routes")
async def routes(): return await find_all("routes")

@api.get("/cell/routing")
async def routing():
    doc = await db.routing.find_one({"id": "routing"}, PROJECT)
    return doc

@api.get("/cell/diagnostics")
async def diagnostics(): return await find_all("diagnostics")

@api.get("/cell/observations")
async def get_observations(type: Optional[str] = None, job_id: Optional[str] = None):
    q = {}
    if type: q["type"] = type
    if job_id: q["job_id"] = job_id
    return await db.observations.find(q, PROJECT).to_list(1000)

@api.get("/cell/observations/{obs_id}")
async def get_observation(obs_id: str):
    doc = await db.observations.find_one({"id": obs_id}, PROJECT)
    if not doc: raise HTTPException(404, "Observation not found")
    return doc

class ObservationCreate(BaseModel):
    type: str
    source: str
    actor: str = "CELL"
    location: Optional[str] = None
    job_id: Optional[str] = None
    mission_id: Optional[str] = None
    truth: str = "LIVE"
    content_ref: Optional[str] = None

@api.post("/cell/observations")
async def create_observation(body: ObservationCreate):
    oid = f"obs-{uuid.uuid4().hex[:6]}"
    doc = {"id": oid, "ts": hhmmss(), **body.model_dump()}
    await db.observations.insert_one(dict(doc))
    await record_event("OBSERVATION_CREATED", f"{body.type} from {body.source} by {body.actor}")
    return doc

@api.get("/cell/artifacts")
async def get_artifacts(job_id: Optional[str] = None):
    q = {}
    if job_id: q["job_id"] = job_id
    return await db.artifacts.find(q, PROJECT).to_list(1000)

@api.get("/cell/artifacts/{art_id}")
async def get_artifact(art_id: str):
    doc = await db.artifacts.find_one({"id": art_id}, PROJECT)
    if not doc: raise HTTPException(404, "Artifact not found")
    return doc

class ArtifactCreate(BaseModel):
    kls: str  # class (renamed to avoid python keyword)
    producer: str
    job_id: Optional[str] = None
    mission_id: Optional[str] = None
    content_ref: Optional[str] = None

@api.post("/cell/artifacts")
async def create_artifact(body: ArtifactCreate):
    aid = f"art-{uuid.uuid4().hex[:6]}"
    doc = {
        "id": aid, "class": body.kls, "producer": body.producer,
        "job_id": body.job_id, "mission_id": body.mission_id,
        "created": hhmmss(), "verified": False, "truth": "UNVERIFIED",
        "content_ref": body.content_ref or "",
    }
    await db.artifacts.insert_one(dict(doc))
    await record_event("ARTIFACT_CREATED", f"{body.kls} by {body.producer} (unverified)")
    return doc

@api.post("/cell/artifacts/{art_id}/verify")
async def verify_artifact(art_id: str):
    doc = await db.artifacts.find_one({"id": art_id}, PROJECT)
    if not doc: raise HTTPException(404, "Artifact not found")
    if doc.get("truth") == "DOWN":
        raise HTTPException(409, "Cannot verify an artifact whose source is DOWN")
    await db.artifacts.update_one({"id": art_id}, {"$set": {"verified": True, "truth": "VERIFIED"}})
    await record_event("ARTIFACT_VERIFIED", f"{doc['class']} {art_id} verified")
    return await db.artifacts.find_one({"id": art_id}, PROJECT)

@api.get("/cell/policies")
async def policies(): return await find_all("policies")

# ---------- mutations: governance ----------
@api.post("/cell/approvals/{approval_id}/decide")
async def decide_approval(approval_id: str, body: ApprovalDecision):
    doc = await db.approvals.find_one({"id": approval_id}, PROJECT)
    if not doc:
        raise HTTPException(404, "Approval not found")
    if doc["state"] == "APPROVED" and body.decision.upper() != "APPROVE":
        raise HTTPException(409, "Already approved")
    if doc["state"] == "BLOCKED" and body.decision.upper() == "APPROVE":
        raise HTTPException(409, "Blocked by policy — cannot approve. Change policy first.")
    new_state = "APPROVED" if body.decision.upper() == "APPROVE" else "BLOCKED"
    await db.approvals.update_one({"id": approval_id}, {"$set": {"state": new_state}})
    await record_event("APPROVAL", f"JR {new_state.lower()}: {doc['title']}")

    # §5-Governance: approval decisions spawn a Job (only on APPROVE, when a diff exists)
    if new_state == "APPROVED" and doc.get("diff_id"):
        job_id = f"job-{uuid.uuid4().hex[:6]}"
        await db.jobs.insert_one({
            "id": job_id,
            "title": f"Apply: {doc['title']}",
            "mission_id": doc.get("mission_id"),
            "worker": doc.get("requester", "CELL"),
            "state": "APPROVED",
            "progress": 10,
            "approval_id": approval_id,
            "verification_id": None,
            "files": [],
            "started_at": hhmmss(),
            "risk": doc.get("risk", "LOW"),
        })
        await record_event("JOB", f"Spawned {job_id} from approval {approval_id}")

    updated = await db.approvals.find_one({"id": approval_id}, PROJECT)
    return updated

# ---------- mutations: map ----------
@api.post("/cell/map/nodes")
async def add_node(body: NodeCreate):
    node_id = f"sys-{uuid.uuid4().hex[:6]}"
    node = {
        "id": node_id,
        "x": body.x if body.x is not None else 300,
        "y": body.y if body.y is not None else 250,
        "r": 26,
        "truth": body.truth,
        "label": body.label,
        "kind": body.kind,
    }
    await db.map_nodes.insert_one(dict(node))
    await db.systems.insert_one({
        "id": node_id, "name": body.label, "kind": body.kind,
        "truth": body.truth, "health": "gray",
        "owner": "—", "note": "Added by JR via CELL.",
    })
    await db.cell_state.update_one({"id": "cell"}, {"$set": {"last_map_sync": hhmmss()}})
    await record_event("MAP_UPDATE", f"Node added: {body.label} ({body.truth})")
    return node

@api.post("/cell/map/nodes/{node_id}/truth")
async def set_node_truth(node_id: str, truth: str):
    if truth not in {"KNOWN", "UNKNOWN", "STALE", "CONFLICTING", "SIMULATED"}:
        raise HTTPException(400, "Invalid truth state")
    node = await db.map_nodes.find_one({"id": node_id}, PROJECT)
    if not node:
        raise HTTPException(404, "Node not found")
    await db.map_nodes.update_one({"id": node_id}, {"$set": {"truth": truth}})
    await db.systems.update_one({"id": node_id}, {"$set": {"truth": truth}})
    await record_event("MAP_UPDATE", f"{node['label']} → {truth}")
    return await db.map_nodes.find_one({"id": node_id}, PROJECT)

# ---------- mutations: missions ----------
LOOP_PHASES = ["OBSERVE","LOCATE","UNDERSTAND","PLAN","GOVERNANCE","APPROVE","EXECUTE","VERIFY","RECORD","UPDATE MAP"]

@api.post("/cell/missions/{mission_id}/advance")
async def advance_mission(mission_id: str):
    m = await db.missions.find_one({"id": mission_id}, PROJECT)
    if not m:
        raise HTTPException(404, "Mission not found")
    try:
        idx = LOOP_PHASES.index(m["phase"])
    except ValueError:
        idx = 0
    next_phase = LOOP_PHASES[min(idx + 1, len(LOOP_PHASES) - 1)]
    await db.missions.update_one({"id": mission_id}, {"$set": {"phase": next_phase}})
    await record_event("TASK", f"{m['codename']}: phase → {next_phase}")
    return await db.missions.find_one({"id": mission_id}, PROJECT)

JOB_LIFECYCLE = ["DISCOVERED", "PROPOSED", "REVIEW", "APPROVED", "BUILDING", "TESTING", "VERIFIED"]
JOB_FAILURE   = {"REJECTED", "FAILED", "VERIFICATION_FAILED"}

@api.post("/cell/jobs/{job_id}/advance")
async def advance_job(job_id: str):
    j = await db.jobs.find_one({"id": job_id}, PROJECT)
    if not j:
        raise HTTPException(404, "Job not found")
    if j["state"] in JOB_FAILURE or j["state"] == "VERIFIED":
        raise HTTPException(409, f"Job is terminal ({j['state']}); cannot advance")
    try:
        idx = JOB_LIFECYCLE.index(j["state"])
    except ValueError:
        idx = 0
    next_state = JOB_LIFECYCLE[min(idx + 1, len(JOB_LIFECYCLE) - 1)]
    upd = {"state": next_state}
    if next_state == "VERIFIED":
        vid = f"ver-{uuid.uuid4().hex[:6]}"
        await db.verifications.insert_one({
            "id": vid, "target_kind": "job", "target_id": job_id,
            "state": "PASSED", "ts": hhmmss(),
            "evidence": f"Auto-verification recorded on {j['title']}",
        })
        upd["verification_id"] = vid
        upd["progress"] = 100
    await db.jobs.update_one({"id": job_id}, {"$set": upd})
    await record_event("JOB", f"{j['title']} → {next_state}")
    return await db.jobs.find_one({"id": job_id}, PROJECT)

@api.post("/cell/jobs/{job_id}/fail")
async def fail_job(job_id: str, reason: str = "no reason given"):
    j = await db.jobs.find_one({"id": job_id}, PROJECT)
    if not j:
        raise HTTPException(404, "Job not found")
    await db.jobs.update_one({"id": job_id}, {"$set": {"state": "FAILED", "error": reason}})
    await record_event("JOB", f"{j['title']} → FAILED ({reason})")
    return await db.jobs.find_one({"id": job_id}, PROJECT)

@api.post("/cell/reseed")
async def reseed():
    for coll in SEED.keys():
        await db[coll].delete_many({})
    await seed_if_empty()
    return {"ok": True, "collections": list(SEED.keys())}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

@app.on_event("startup")
async def on_startup():
    await seed_if_empty()

@app.on_event("shutdown")
async def on_shutdown():
    client.close()

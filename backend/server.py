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

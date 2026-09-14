// CELL / L@B — demo dataset. Explicitly labeled as DEMO. No real telemetry.
// The MAP is the truth: every entity has a `truth` state.

export const DEMO_TAG = "DEMO";

export const jr = {
  id: "user-jr",
  handle: "JR",
  role: "Operator",
  clearance: "L4 // ROOT",
  lastAuth: "2026-02-12T09:41:00Z",
};

export const cellState = {
  status: "NOMINAL", // NOMINAL | DEGRADED | LOCKED | DRIFT
  posture: "OBSERVE",
  uptimeIso: "2026-02-01T00:00:00Z",
  version: "cell-0.7.3-alpha",
  advisories: 2,
  lastMapSync: "2026-02-12T09:38:12Z",
};

export const systems = [
  { id: "sys-cortex",   name: "CORTEX-01",     kind: "Compute",   truth: "KNOWN",       health: "green",  owner: "Elite/Vanguard", note: "Primary inference lattice." },
  { id: "sys-vault",    name: "VAULT-A",       kind: "Storage",   truth: "KNOWN",       health: "green",  owner: "Elite/Custodian", note: "Encrypted memory vault." },
  { id: "sys-relay",    name: "RELAY-EDGE",    kind: "Network",   truth: "STALE",       health: "amber",  owner: "Elite/Signal", note: "Last sync 4h ago." },
  { id: "sys-forge",    name: "FORGE-LAB",     kind: "Runtime",   truth: "SIMULATED",   health: "cyan",   owner: "Elite/Forge",  note: "Sandbox mirror of prod." },
  { id: "sys-oracle",   name: "ORACLE-SRC",    kind: "Knowledge", truth: "CONFLICTING", health: "red",    owner: "Elite/Scribe", note: "Two sources disagree on schema v3." },
  { id: "sys-halo",     name: "HALO-MESH",     kind: "Observability", truth: "KNOWN",   health: "green",  owner: "Elite/Watchtower", note: "Telemetry mesh." },
  { id: "sys-outer",    name: "OUTER-RIM",     kind: "External",  truth: "UNKNOWN",     health: "gray",   owner: "—",            note: "Not yet mapped." },
];

export const agents = [
  { id: "a-scribe",  name: "SCRIBE-07",  role: "Knowledge curator", team: "Scribe",     truth: "KNOWN",   posture: "IDLE",     lastSeen: "12s" },
  { id: "a-forge",   name: "FORGE-02",   role: "Runtime engineer",  team: "Forge",      truth: "KNOWN",   posture: "EXECUTING", lastSeen: "live" },
  { id: "a-signal",  name: "SIGNAL-11",  role: "Network probe",     team: "Signal",     truth: "STALE",   posture: "OFFLINE",  lastSeen: "4h 12m" },
  { id: "a-watch",   name: "WATCHTOWER", role: "Observer",          team: "Watchtower", truth: "KNOWN",   posture: "OBSERVING",lastSeen: "1s" },
  { id: "a-custod",  name: "CUSTODIAN",  role: "Memory keeper",     team: "Custodian",  truth: "KNOWN",   posture: "IDLE",     lastSeen: "3m" },
  { id: "a-ghost",   name: "GHOST-Δ",    role: "Simulator",         team: "Forge",      truth: "SIMULATED",posture: "SIMULATING", lastSeen: "sim" },
];

export const teams = [
  { id: "t-vanguard",    name: "VANGUARD",    charter: "Frontline compute & orchestration", members: 4, missions: 2 },
  { id: "t-scribe",      name: "SCRIBE",      charter: "Knowledge & sources of truth",      members: 3, missions: 1 },
  { id: "t-forge",       name: "FORGE",       charter: "Runtime, sandboxes, simulation",    members: 5, missions: 3 },
  { id: "t-signal",      name: "SIGNAL",      charter: "Network, ingress, edge",            members: 2, missions: 1 },
  { id: "t-watchtower",  name: "WATCHTOWER",  charter: "Observability & anomaly detection", members: 3, missions: 0 },
  { id: "t-custodian",   name: "CUSTODIAN",   charter: "Memory, retention, provenance",     members: 2, missions: 1 },
];

export const missions = [
  {
    id: "m-001", codename: "COLD-HARVEST", status: "ACTIVE", risk: "LOW",
    phase: "EXECUTE", owner: "Vanguard",
    objective: "Refresh Oracle knowledge index for domain-2.",
    truth: "KNOWN",
    startedAt: "2026-02-12T08:12:00Z",
  },
  {
    id: "m-002", codename: "NORTH-GATE", status: "AWAITING APPROVAL", risk: "MEDIUM",
    phase: "GOVERNANCE", owner: "Signal",
    objective: "Re-bind RELAY-EDGE to secondary uplink.",
    truth: "STALE",
    startedAt: "2026-02-12T09:02:00Z",
  },
  {
    id: "m-003", codename: "MIRROR-WALK", status: "SIMULATION", risk: "N/A",
    phase: "PLAN", owner: "Forge",
    objective: "Simulated failover of CORTEX-01 to FORGE-LAB.",
    truth: "SIMULATED",
    startedAt: "2026-02-12T07:44:00Z",
  },
  {
    id: "m-004", codename: "SPLIT-BRAIN", status: "BLOCKED", risk: "HIGH",
    phase: "GOVERNANCE", owner: "Scribe",
    objective: "Resolve ORACLE-SRC schema conflict v3.",
    truth: "CONFLICTING",
    startedAt: "2026-02-11T22:10:00Z",
  },
];

export const tasks = [
  { id: "tk-01", missionId: "m-001", label: "Snapshot Oracle domain-2", status: "DONE",     assignee: "SCRIBE-07" },
  { id: "tk-02", missionId: "m-001", label: "Rebuild vector index",     status: "RUNNING",  assignee: "FORGE-02" },
  { id: "tk-03", missionId: "m-001", label: "Verify against golden set",status: "PENDING",  assignee: "WATCHTOWER" },
  { id: "tk-04", missionId: "m-002", label: "Draft rebind plan",        status: "DONE",     assignee: "SIGNAL-11" },
  { id: "tk-05", missionId: "m-002", label: "Governance review",        status: "AWAITING", assignee: "JR" },
  { id: "tk-06", missionId: "m-004", label: "Diff schema sources",      status: "RUNNING",  assignee: "SCRIBE-07" },
];

export const sources = [
  { id: "src-1", label: "ORACLE-SRC/schema.v3",   trust: "CONFLICTING", freshness: "3m",   provenance: "internal" },
  { id: "src-2", label: "VAULT-A/index.golden",   trust: "KNOWN",       freshness: "22s",  provenance: "internal" },
  { id: "src-3", label: "RELAY-EDGE/routes.tsv",  trust: "STALE",       freshness: "4h",   provenance: "internal" },
  { id: "src-4", label: "outer://intel-feed",     trust: "UNKNOWN",     freshness: "—",    provenance: "external" },
  { id: "src-5", label: "FORGE-LAB/mirror",       trust: "SIMULATED",   freshness: "live", provenance: "sandbox" },
];

export const approvals = [
  { id: "ap-1", missionId: "m-002", title: "RELAY-EDGE rebind → secondary uplink", requester: "SIGNAL-11", policy: "P-NET-04", state: "PENDING", risk: "MEDIUM" },
  { id: "ap-2", missionId: "m-004", title: "Force-merge schema v3 (side-B)",       requester: "SCRIBE-07", policy: "P-KNW-11", state: "BLOCKED", risk: "HIGH" },
  { id: "ap-3", missionId: "m-001", title: "Publish rebuilt vector index",         requester: "FORGE-02",  policy: "P-KNW-02", state: "APPROVED", risk: "LOW" },
];

export const risks = [
  { id: "r-1", label: "Schema drift on ORACLE-SRC", level: "HIGH",   linked: ["m-004", "sys-oracle"] },
  { id: "r-2", label: "RELAY-EDGE stale routes",    level: "MEDIUM", linked: ["m-002", "sys-relay"] },
  { id: "r-3", label: "Unmapped outer feed",        level: "LOW",    linked: ["sys-outer"] },
];

export const events = [
  { id: "e-1", ts: "09:41:22", kind: "MAP_UPDATE",     text: "sys-relay → STALE (last sync 4h)" },
  { id: "e-2", ts: "09:39:04", kind: "GOVERNANCE",     text: "Approval requested: NORTH-GATE (P-NET-04)" },
  { id: "e-3", ts: "09:37:11", kind: "SIMULATION",     text: "MIRROR-WALK simulation started (sandbox)" },
  { id: "e-4", ts: "09:31:59", kind: "TASK",           text: "FORGE-02: Rebuild vector index → RUNNING" },
  { id: "e-5", ts: "09:22:17", kind: "CONFLICT",       text: "ORACLE-SRC schema v3 sources disagree" },
  { id: "e-6", ts: "09:14:00", kind: "OBSERVE",        text: "CELL entered OBSERVE posture" },
  { id: "e-7", ts: "08:47:33", kind: "APPROVAL",       text: "JR approved: publish rebuilt vector index" },
];

// Master L@B Map — nodes/edges (hand-placed grid positions, viewBox 1000x600)
export const mapNodes = [
  { id: "sys-cortex", x: 180, y: 140, r: 34, truth: "KNOWN",       label: "CORTEX-01",   kind: "compute" },
  { id: "sys-vault",  x: 180, y: 320, r: 30, truth: "KNOWN",       label: "VAULT-A",     kind: "storage" },
  { id: "sys-relay",  x: 420, y: 120, r: 28, truth: "STALE",       label: "RELAY-EDGE",  kind: "network" },
  { id: "sys-halo",   x: 420, y: 300, r: 26, truth: "KNOWN",       label: "HALO-MESH",   kind: "observability" },
  { id: "sys-oracle", x: 640, y: 200, r: 32, truth: "CONFLICTING", label: "ORACLE-SRC",  kind: "knowledge" },
  { id: "sys-forge",  x: 640, y: 400, r: 30, truth: "SIMULATED",   label: "FORGE-LAB",   kind: "runtime" },
  { id: "sys-outer",  x: 860, y: 140, r: 26, truth: "UNKNOWN",     label: "OUTER-RIM",   kind: "external" },
  { id: "cell-core",  x: 500, y: 500, r: 40, truth: "KNOWN",       label: "CELL",        kind: "core" },
];

export const mapEdges = [
  { from: "sys-cortex", to: "sys-vault",  truth: "KNOWN" },
  { from: "sys-cortex", to: "sys-relay",  truth: "STALE" },
  { from: "sys-relay",  to: "sys-outer",  truth: "UNKNOWN" },
  { from: "sys-cortex", to: "sys-oracle", truth: "CONFLICTING" },
  { from: "sys-vault",  to: "sys-oracle", truth: "KNOWN" },
  { from: "sys-halo",   to: "sys-cortex", truth: "KNOWN" },
  { from: "sys-halo",   to: "sys-relay",  truth: "KNOWN" },
  { from: "sys-forge",  to: "sys-cortex", truth: "SIMULATED" },
  { from: "cell-core",  to: "sys-cortex", truth: "KNOWN" },
  { from: "cell-core",  to: "sys-halo",   truth: "KNOWN" },
  { from: "cell-core",  to: "sys-oracle", truth: "KNOWN" },
  { from: "cell-core",  to: "sys-forge",  truth: "KNOWN" },
];

export const history = events.concat([
  { id: "e-8",  ts: "yesterday 22:11", kind: "APPROVAL",   text: "JR blocked: force-merge schema v3 (side-B)" },
  { id: "e-9",  ts: "yesterday 20:04", kind: "MAP_UPDATE", text: "sys-outer marked UNKNOWN (never contacted)" },
  { id: "e-10", ts: "2d ago",          kind: "GOVERNANCE", text: "Policy P-NET-04 activated" },
  { id: "e-11", ts: "2d ago",          kind: "MAP_UPDATE", text: "sys-forge added as sandbox mirror" },
]);

export const memoryEntries = [
  { id: "mem-1", scope: "long-term", key: "operator.preferences.jr",   updated: "2026-02-10", provenance: "CELL/self" },
  { id: "mem-2", scope: "episodic",  key: "mission:COLD-HARVEST/notes", updated: "2026-02-12", provenance: "SCRIBE-07" },
  { id: "mem-3", scope: "semantic",  key: "schema.oracle.v3.context",   updated: "2026-02-11", provenance: "SCRIBE-07", conflict: true },
  { id: "mem-4", scope: "working",   key: "map.diff/2026-02-12",        updated: "2026-02-12", provenance: "CELL/self" },
  { id: "mem-5", scope: "episodic",  key: "sim:MIRROR-WALK/trace",      updated: "2026-02-12", provenance: "GHOST-Δ", simulated: true },
];

export const runtimeHosts = [
  { id: "rt-1", name: "FORGE-LAB/pod-α",   image: "cell-forge:0.7.3",  state: "RUNNING",  cpu: "42%", mem: "3.1G", truth: "KNOWN" },
  { id: "rt-2", name: "FORGE-LAB/pod-β",   image: "cell-forge:0.7.3",  state: "IDLE",     cpu: "3%",  mem: "0.4G", truth: "KNOWN" },
  { id: "rt-3", name: "SANDBOX/mirror-01", image: "cell-mirror:sim",   state: "SIMULATED",cpu: "—",   mem: "—",    truth: "SIMULATED" },
  { id: "rt-4", name: "EDGE/relay-01",     image: "cell-relay:0.6.9",  state: "OFFLINE",  cpu: "—",   mem: "—",    truth: "STALE" },
];

export const policies = [
  { id: "P-NET-04", label: "Network re-binding requires operator approval", severity: "MEDIUM", active: true },
  { id: "P-KNW-02", label: "Knowledge index publication requires golden diff", severity: "LOW", active: true },
  { id: "P-KNW-11", label: "Conflicting-source force-merge is disallowed",    severity: "HIGH", active: true },
  { id: "P-RUN-01", label: "Runtime writes must originate from mapped agents", severity: "MEDIUM", active: true },
];

// Scripted, deterministic CELL replies — clearly not a live LLM.
export const cellScript = [
  { match: /map|truth|what.*is/i,
    reply: "THE MAP IS THE TRUTH. I show 7 systems. 1 CONFLICTING (ORACLE-SRC), 1 STALE (RELAY-EDGE), 1 SIMULATED (FORGE-LAB), 1 UNKNOWN (OUTER-RIM). Open Master L@B Map to inspect." },
  { match: /approve|approval|governance/i,
    reply: "1 approval pending: NORTH-GATE (P-NET-04, risk MEDIUM). 1 blocked: SPLIT-BRAIN (P-KNW-11, risk HIGH). Approvals require you, JR." },
  { match: /simulate|simulation/i,
    reply: "MIRROR-WALK is running in sandbox (FORGE-LAB). Results are SIMULATED — they will not update the map until you promote them." },
  { match: /risk|risks/i,
    reply: "3 open risks. HIGH: schema drift on ORACLE-SRC. MEDIUM: RELAY-EDGE stale routes. LOW: OUTER-RIM unmapped." },
  { match: /help|hello|hi|status/i,
    reply: "CELL online. Posture: OBSERVE. I operate L@B on your behalf, JR. I will not fabricate connections or execute without your approval." },
];

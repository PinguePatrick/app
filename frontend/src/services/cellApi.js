// Real backend seam. Calls FastAPI at REACT_APP_BACKEND_URL/api/cell/*
import axios from "axios";

const BASE = `${process.env.REACT_APP_BACKEND_URL}/api/cell`;
const http = axios.create({ baseURL: BASE, timeout: 15000 });

async function safe(fn, fallback) {
  try { const r = await fn(); return r.data; } catch (e) { console.warn("[cellApi]", e?.message); return fallback; }
}

export const cellApi = {
  isDemo: false,
  getCellState:  () => safe(() => http.get("/state"),     null),
  getMission:    () => safe(() => http.get("/mission"),   null),
  getAutonomy:   () => safe(() => http.get("/autonomy"),  null),
  getJrState:    () => safe(() => http.get("/jr"),        null),
  getOperator:   () => safe(() => http.get("/operator"),  null),
  getSystems:    () => safe(() => http.get("/systems"),   []),
  getAgents:     () => safe(() => http.get("/agents"),    []),
  getTeams:      () => safe(() => http.get("/teams"),     []),
  getMissions:   () => safe(() => http.get("/missions"),  []),
  getTasks:      () => safe(() => http.get("/tasks"),     []),
  getSources:    () => safe(() => http.get("/sources"),   []),
  getApprovals:  () => safe(() => http.get("/approvals"), []),
  getRisks:      () => safe(() => http.get("/risks"),     []),
  getEvents:     () => safe(() => http.get("/events"),    []),
  getHistory:    () => safe(() => http.get("/history"),   []),
  getMap:        () => safe(() => http.get("/map"),       { nodes: [], edges: [] }),
  getMemory:     () => safe(() => http.get("/memory"),        []),
  getRuntime:    () => safe(() => http.get("/runtime"),       []),
  getPolicies:   () => safe(() => http.get("/policies"),      []),
  getJobs:       () => safe(() => http.get("/jobs"),          []),
  getProposals:  () => safe(() => http.get("/proposals"),     []),
  getVerifications:() => safe(() => http.get("/verifications"), []),
  getServices:   () => safe(() => http.get("/services"),      []),
  getRoutes:     () => safe(() => http.get("/routes"),        []),
  getRouting:    () => safe(() => http.get("/routing"),       null),
  getDiagnostics:() => safe(() => http.get("/diagnostics"),   []),
  getDiff:       (id) => safe(() => http.get(`/diffs/${id}`), null),
  getObservations: (params) => safe(() => http.get("/observations", { params }), []),
  getArtifacts:    (params) => safe(() => http.get("/artifacts",    { params }), []),

  // mutations
  decideApproval: (id, decision) => http.post(`/approvals/${id}/decide`, { decision }).then(r => r.data),
  addNode:        (payload)       => http.post(`/map/nodes`, payload).then(r => r.data),
  setNodeTruth:   (id, truth)     => http.post(`/map/nodes/${id}/truth?truth=${encodeURIComponent(truth)}`).then(r => r.data),
  advanceMission: (id)            => http.post(`/missions/${id}/advance`).then(r => r.data),
  advanceJob:     (id)            => http.post(`/jobs/${id}/advance`).then(r => r.data),
  failJob:        (id, reason)    => http.post(`/jobs/${id}/fail?reason=${encodeURIComponent(reason)}`).then(r => r.data),
  createObservation: (body)       => http.post(`/observations`, body).then(r => r.data),
  createArtifact:    (body)       => http.post(`/artifacts`, body).then(r => r.data),
  verifyArtifact:    (id)         => http.post(`/artifacts/${id}/verify`).then(r => r.data),
};

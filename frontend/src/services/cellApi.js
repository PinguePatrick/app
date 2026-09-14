// Abstraction seam. Today: returns local demo data.
// Tomorrow: swap the internals for real backend calls without changing callers.
import * as demo from "@/data/demo";

const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));

export const cellApi = {
  async getCellState()   { await wait(); return demo.cellState; },
  async getOperator()    { await wait(); return demo.jr; },
  async getSystems()     { await wait(); return demo.systems; },
  async getAgents()      { await wait(); return demo.agents; },
  async getTeams()       { await wait(); return demo.teams; },
  async getMissions()    { await wait(); return demo.missions; },
  async getTasks()       { await wait(); return demo.tasks; },
  async getSources()     { await wait(); return demo.sources; },
  async getApprovals()   { await wait(); return demo.approvals; },
  async getRisks()       { await wait(); return demo.risks; },
  async getEvents()      { await wait(); return demo.events; },
  async getHistory()     { await wait(); return demo.history; },
  async getMap()         { await wait(); return { nodes: demo.mapNodes, edges: demo.mapEdges }; },
  async getMemory()      { await wait(); return demo.memoryEntries; },
  async getRuntime()     { await wait(); return demo.runtimeHosts; },
  async getPolicies()    { await wait(); return demo.policies; },
  isDemo: true,
};

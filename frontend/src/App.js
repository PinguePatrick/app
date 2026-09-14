import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import { CellProvider } from "@/state/CellContext";
import Shell from "@/layout/Shell";
import CommandCenter from "@/pages/CommandCenter";
import MasterMap from "@/pages/MasterMap";
import EliteTeams from "@/pages/EliteTeams";
import Operations from "@/pages/Operations";
import Knowledge from "@/pages/Knowledge";
import Memory from "@/pages/Memory";
import Runtime from "@/pages/Runtime";
import Governance from "@/pages/Governance";
import History from "@/pages/History";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CellProvider>
          <Shell>
            <Routes>
              <Route path="/" element={<CommandCenter />} />
              <Route path="/map" element={<MasterMap />} />
              <Route path="/teams" element={<EliteTeams />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="/runtime" element={<Runtime />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Shell>
          <Toaster />
        </CellProvider>
      </BrowserRouter>
    </div>
  );
}

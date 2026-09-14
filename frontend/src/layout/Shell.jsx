import React from "react";
import TopBar from "@/layout/TopBar";
import LeftNav from "@/layout/LeftNav";
import RightInspector from "@/layout/RightInspector";
import ConversationPanel from "@/layout/ConversationPanel";
import CommandPalette from "@/layout/CommandPalette";
import DemoBanner from "@/components/DemoBanner";
import { useCell } from "@/state/CellContext";

export default function Shell({ children }) {
  const { loading } = useCell();
  return (
    <div className="min-h-screen bg-[#050505] text-[#F8FAFC] flex flex-col">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <LeftNav />
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="px-4 pt-3">
            <DemoBanner />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {loading ? (
              <div className="h-full grid place-items-center text-[#52525B] font-data text-[11px] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 bg-[#00E5FF] blink" />
                  bootstrapping cell…
                </div>
              </div>
            ) : children}
          </div>
        </main>
        <RightInspector />
      </div>
      <ConversationPanel />
      <CommandPalette />
    </div>
  );
}

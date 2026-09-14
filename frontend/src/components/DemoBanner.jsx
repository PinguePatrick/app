import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DemoBanner() {
  return (
    <div
      data-testid="demo-banner"
      className="border border-[#D97706] bg-[#D9770610] text-[#F59E0B] font-data text-[11px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-2"
    >
      <AlertTriangle size={12} strokeWidth={2} />
      <span>DEMO ENVIRONMENT · No live telemetry, permissions, or execution results are real</span>
    </div>
  );
}

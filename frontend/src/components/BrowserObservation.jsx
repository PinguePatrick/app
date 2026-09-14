// Offline stub — §8 rule. When CDP is not connected, do not fake a live browser.
import React from "react";
import { useCell } from "@/state/CellContext";
import { cellApi } from "@/services/cellApi";
import { toast } from "sonner";
import { Globe, RotateCw, ExternalLink } from "lucide-react";

export default function BrowserObservation() {
  const { diagnostics, observations, refresh } = useCell();
  const cdp = diagnostics.find((d) => d.name === "Browser CDP");
  const isDown = !cdp || cdp.status === "DOWN";

  const retry = async () => {
    try {
      await cellApi.createObservation({
        type: "LOG", source: "browser/cdp", actor: "JR",
        location: "not connected", truth: "DOWN",
        content_ref: "Retry attempted — Browser CDP still not bound. No live browser."
      });
      toast("Diagnostic recorded — Browser CDP still DOWN");
      await refresh();
    } catch { toast("Retry failed"); }
  };

  const browserObservations = observations.filter((o) => o.type === "BROWSER" || o.type === "SCREEN");

  return (
    <div data-testid="browser-observation" className="border border-[#27272A] bg-[#0B0D10]">
      <header className="h-9 px-3 border-b border-[#27272A] bg-[#0F1115] flex items-center gap-2">
        <Globe size={13} className={isDown ? "text-[#DC2626]" : "text-[#10B981]"} />
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-[#F8FAFC]">
          BROWSER · {isDown ? "OFFLINE" : "CONNECTED"}
        </span>
        {isDown && (
          <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8] ml-2">
            adapter not connected
          </span>
        )}
        <button data-testid="browser-retry" onClick={retry}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 border border-[#27272A] hover:border-[#00E5FF] hover:text-[#00E5FF] text-[#94A3B8] font-data text-[10px] uppercase tracking-widest">
          <RotateCw size={10} /> Retry
        </button>
      </header>
      <div className="p-6 grid place-items-center min-h-[280px] scanlines">
        <div className="text-center max-w-md">
          <Globe size={40} className="text-[#27272A] mx-auto" />
          <div className="mt-3 font-display text-lg text-[#F8FAFC]">
            {isDown ? "Browser adapter offline" : "Live browser"}
          </div>
          <p className="mt-2 font-body text-[12px] text-[#94A3B8] leading-relaxed">
            {isDown
              ? "No Chrome DevTools Protocol endpoint bound. This stub will not fabricate a live browser. Retry records a diagnostic event; it does not attempt CDP connection until the real adapter arrives in Phase 11."
              : "Live CDP connection detected."}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 font-data text-[10px] uppercase tracking-widest text-[#52525B]">
            <ExternalLink size={10} /> read · inspect · remember — all disabled while offline
          </div>
        </div>
      </div>
      {browserObservations.length > 0 && (
        <div className="border-t border-[#27272A]">
          <div className="px-4 py-2 bg-[#0F1115] font-data text-[10px] uppercase tracking-widest text-[#52525B]">
            Recorded browser observations
          </div>
          <ul className="divide-y divide-[#27272A]">
            {browserObservations.map((o) => (
              <li key={o.id} className="px-4 py-2 grid grid-cols-[80px_80px_1fr] gap-2 items-center font-data text-[11px]">
                <span className="text-[#52525B]">{o.ts}</span>
                <span className="text-[#00E5FF] uppercase tracking-widest">{o.type}</span>
                <span className="text-[#F8FAFC] truncate">{o.content_ref}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

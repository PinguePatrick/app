// Diff viewer modal — first-class Diff object per §27.
import React, { useEffect, useState } from "react";
import { cellApi } from "@/services/cellApi";
import { X, FileDiff } from "lucide-react";

export default function DiffViewer({ diffId, onClose }) {
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!diffId) return;
    setLoading(true);
    cellApi.getDiff(diffId).then((d) => { setDiff(d); setLoading(false); });
  }, [diffId]);

  if (!diffId) return null;

  return (
    <div
      data-testid="diff-viewer"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-6"
      onClick={onClose}
    >
      <div
        className="w-[min(880px,100%)] max-h-[80vh] bg-[#0B0D10] border border-[#00E5FF] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-10 border-b border-[#27272A] bg-[#0F1115] px-4 flex items-center gap-2">
          <FileDiff size={13} className="text-[#00E5FF]" />
          <span className="font-display text-[12px] tracking-[0.2em] uppercase text-[#F8FAFC]">
            DIFF · {diff?.id || diffId}
          </span>
          <span className="font-data text-[10px] text-[#52525B] uppercase tracking-widest ml-2">
            proposed change · approval required
          </span>
          <button data-testid="diff-close" onClick={onClose} className="ml-auto text-[#52525B] hover:text-[#F8FAFC]"><X size={14} /></button>
        </header>
        {loading ? (
          <div className="p-6 font-data text-[11px] uppercase tracking-widest text-[#52525B]">Loading diff…</div>
        ) : !diff ? (
          <div className="p-6 font-data text-[11px] uppercase tracking-widest text-[#E11D48]">Diff not found</div>
        ) : (
          <div className="overflow-y-auto">
            <div className="px-4 py-3 border-b border-[#27272A] font-body text-[12px] text-[#94A3B8]">
              {diff.summary}
            </div>
            {diff.files.map((f, i) => (
              <div key={i} className="border-b border-[#27272A]">
                <div className="px-4 py-2 bg-[#16191E] flex items-center gap-3">
                  <span className="font-data text-[12px] text-[#F8FAFC]">{f.path}</span>
                  <span className="font-data text-[10px] text-[#10B981]">+{f.additions}</span>
                  <span className="font-data text-[10px] text-[#FB7185]">−{f.removals}</span>
                </div>
                <pre className="px-4 py-2 font-data text-[12px] leading-relaxed overflow-x-auto">
                  {f.hunks.map((h, hi) => {
                    const color = h.startsWith("+") ? "#10B981" : h.startsWith("-") ? "#FB7185" : "#94A3B8";
                    return <div key={hi} style={{ color }}>{h}</div>;
                  })}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

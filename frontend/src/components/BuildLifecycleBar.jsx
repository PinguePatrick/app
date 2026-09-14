// §6 governed build lifecycle bar. 7 steps + failure states.
import React from "react";

export const JOB_LIFECYCLE = ["DISCOVERED", "PROPOSED", "REVIEW", "APPROVED", "BUILDING", "TESTING", "VERIFIED"];
export const JOB_FAILURE   = { REJECTED: 2, FAILED: 5, VERIFICATION_FAILED: 6 };

export default function BuildLifecycleBar({ state, testId }) {
  const failedAt = JOB_FAILURE[state];
  const idx = failedAt ?? JOB_LIFECYCLE.indexOf(state);

  return (
    <div data-testid={testId} className="grid grid-cols-7 gap-0.5 min-w-[420px]">
      {JOB_LIFECYCLE.map((s, i) => {
        const isPast    = i < idx;
        const isCurrent = i === idx;
        const isFailed  = failedAt !== undefined && isCurrent;
        const isVerified = state === "VERIFIED" && i === 6;

        let bg = "bg-[#27272A]";
        if (isPast)      bg = "bg-[#00E5FF]";
        if (isCurrent)   bg = isFailed ? "bg-[#E11D48]" : "bg-[#00E5FF]";
        if (isVerified)  bg = "bg-[#10B981]";

        const glow = isCurrent && !isFailed ? "shadow-[0_0_6px_#00E5FF]" : isFailed ? "shadow-[0_0_6px_#E11D48]" : "";

        return (
          <div key={s} className="flex flex-col items-center">
            <div className={`h-1.5 w-full ${bg} ${glow}`} />
            <span className={`mt-1 text-[8px] font-data uppercase tracking-widest text-center ${
              isCurrent ? (isFailed ? "text-[#FB7185]" : "text-[#00E5FF]") : isPast ? "text-[#94A3B8]" : "text-[#52525B]"
            }`}>{s}</span>
          </div>
        );
      })}
      {failedAt !== undefined && (
        <span className="col-span-7 mt-1 font-data text-[10px] uppercase tracking-widest text-[#FB7185] text-center">
          ↑ {state.replace("_", " ")}
        </span>
      )}
    </div>
  );
}

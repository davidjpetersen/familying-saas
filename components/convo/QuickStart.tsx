"use client";

import { useState } from "react";
import { AgeBand } from "@/types/convo";
import { track } from "@/lib/analytics";

export default function QuickStart({
  onStart,
}: {
  onStart: (context?: string, ageBand?: AgeBand) => void;
}) {
  const [ageBand, setAgeBand] = useState<AgeBand>("4-6");
  const contexts = [
    { label: "Dinner", value: "dinner" },
    { label: "Car", value: "car" },
    { label: "Bedtime", value: "bedtime" },
    { label: "Anywhere", value: undefined },
  ];
  return (
    <div className="space-y-4">
      <select
        aria-label="Select age band"
        className="border p-2 rounded"
        value={ageBand}
        onChange={(e) => setAgeBand(e.target.value as AgeBand)}
      >
        {[
          "0-3",
          "4-6",
          "7-9",
          "10-12",
          "13+",
        ].map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <div className="flex gap-2 flex-wrap">
        {contexts.map((c) => (
          <button
            key={c.label}
            className="px-4 py-2 border rounded text-sm"
            onClick={() => {
              track("convo_quick_start_click", {
                context: c.value,
                ageBand,
              });
              onStart(c.value, ageBand);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { EnergyItem } from "@/lib/energy/types";

interface LiveParamsProps {
  latest: EnergyItem | null;
  loading?: boolean;
}

export function LiveParams({ latest, loading }: LiveParamsProps) {
  const p = latest?.payload;
  if (!p || loading) {
    return (
      <div className="live-params">
        <h3>Live Parameters</h3>
        <div className="params-skeleton" />
      </div>
    );
  }

  const load = p.load ?? {};
  const grid = p.in ?? {};

  const params = [
    { label: "Vavg", value: load.Vavg, unit: "V" },
    { label: "Il1 / Il2 / Il3", value: `${load.Il1 ?? "—"} / ${load.Il2 ?? "—"} / ${load.Il3 ?? "—"}`, unit: "A" },
    { label: "pfAvg", value: load.pfAvg, unit: "" },
    { label: "Grid KVA", value: grid.KVA, unit: "kVA" },
  ];

  return (
    <div className="live-params">
      <h3>Live Parameters</h3>
      <div className="params-grid">
        {params.map(({ label, value, unit }) => (
          <div key={label} className="param">
            <span className="param-label">{label}</span>
            <span className="param-value">
              {typeof value === "number"
                ? `${value.toFixed(2)}${unit}`
                : value ?? "—"}
            </span>
          </div>
        ))}
      </div>
      {p.time && (
        <p className="last-updated">
          Last update: {new Date(p.time).toLocaleString()}
        </p>
      )}
    </div>
  );
}

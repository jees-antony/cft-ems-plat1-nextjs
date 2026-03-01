"use client";

import type { EnergyItem, LoadData } from "@/lib/energy/types";

interface LiveParamsProps {
  latest: EnergyItem | null;
  loading?: boolean;
}

export function LiveParams({ latest, loading }: LiveParamsProps) {
  const p = latest?.payload;
  // if the server didn't provide a time field, look at the item's SK/timestamp
  const rawTs = p?.time ?? latest?.timestamp;

  if (!p || loading) {
    return (
      <div className="live-params">
        <h3>Live Parameters</h3>
        <div className="params-skeleton" />
      </div>
    );
  }

  const load: LoadData = p.load ?? {};
  const grid: LoadData = p.in ?? {};

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
      <div className="status-grid">
        <div className="status-item">
          <span className="param-label">New IQF</span>
          <span className="param-value">{p.NewIQFRunning === undefined ? "—" : (String(p.NewIQFRunning) === "1" ? "Running" : "Stopped")}</span>
        </div>
        <div className="status-item">
          <span className="param-label">Old IQF</span>
          <span className="param-value">{p.OldIQFRunning === undefined ? "—" : (String(p.OldIQFRunning) === "1" ? "Running" : "Stopped")}</span>
        </div>
      </div>
      {rawTs && (
        <p className="last-updated">
          Last update: {
            new Date(rawTs).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          }
        </p>
      )}
    </div>
  );
}

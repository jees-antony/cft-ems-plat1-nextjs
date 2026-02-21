"use client";

import type { TopKpis } from "@/lib/energy/types";

interface KpiCardsProps {
  kpis: TopKpis;
  loading?: boolean;
}

const cards: {
  key: keyof TopKpis;
  label: string;
  unit: string;
  color: string;
  format?: (v: number) => string;
}[] = [
  { key: "solarKw", label: "Solar Output", unit: "kW", color: "var(--accent-solar)" },
  { key: "loadKw", label: "Load", unit: "kW", color: "var(--accent-load)" },
  { key: "gridKw", label: "Grid", unit: "kW", color: "var(--accent-grid)" },
  { key: "batteryVoltage", label: "Battery Voltage", unit: "V", color: "var(--accent-battery)" },
  { key: "solarEfficiency", label: "Solar Efficiency", unit: "%", color: "var(--accent-solar)", format: (v) => v.toFixed(1) },
  { key: "peakLoad24h", label: "Peak Load (24h)", unit: "kW", color: "var(--accent-muted)" },
];

export function KpiCards({ kpis, loading }: KpiCardsProps) {
  return (
    <div className="kpi-cards">
      {cards.map(({ key, label, unit, color, format }) => {
        const val = kpis[key];
        const num = typeof val === "number" ? val : 0;
        const display = format ? format(num) : num.toFixed(2);
        return (
          <div
            key={key}
            className="kpi-card"
            style={{ "--card-accent": color } as React.CSSProperties}
          >
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">
              {loading ? "—" : `${display} ${unit}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
  {
    key: "co2Energy",
    label: "CO₂ Energy Meter",
    unit: "kWh",
    color: "var(--accent-solar)",
  },
  {
    key: "frascoldEnergy",
    label: "Frascold Energy Meter",
    unit: "kWh",
    color: "var(--accent-load)",
  },
  {
    key: "newIqfEnergy",
    label: "New IQF Energy Meter",
    unit: "kWh",
    color: "var(--accent-grid)",
  },
];

export function KpiCards({ kpis, loading }: KpiCardsProps) {
  console.log("[KpiCards] Rendered with KPIs:", kpis, "loading:", loading);

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

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
  isStatus?: boolean;
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
  {
    key: "nh3Unit1",
    label: "NH3 Unit 1",
    unit: "",
    color: "var(--accent-load)",
  },
  {
    key: "nh3Unit2",
    label: "NH3 Unit 2",
    unit: "",
    color: "var(--accent-solar)",
  },
  {
    key: "newIqfRunning",
    label: "New IQF",
    unit: "",
    color: "var(--accent-grid)",
    isStatus: true,
  },
  {
    key: "oldIqfRunning",
    label: "Old IQF",
    unit: "",
    color: "var(--accent-load)",
    isStatus: true,
  },
];

export function KpiCards({ kpis, loading }: KpiCardsProps) {
  console.log("[KpiCards] Rendered with KPIs:", kpis, "loading:", loading);

  return (
    <div className="kpi-cards">
      {cards.map(({ key, label, unit, color, format, isStatus }) => {
        const val = kpis[key] as any;
        const isString = typeof val === "string";
        const num = typeof val === "number" ? val : 0;
        const display = isString ? val : format ? format(num) : num.toFixed(2);
        return (
          <div
            key={String(key)}
            className={`kpi-card ${isStatus ? "kpi-status" : ""}`}
            style={{ "--card-accent": color } as React.CSSProperties}
          >
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">
              {loading ? "—" : (isStatus ? display : `${display} ${unit}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

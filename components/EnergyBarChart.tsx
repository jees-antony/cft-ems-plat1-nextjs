"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TopKpis } from "@/lib/energy/types";

interface EnergyBarChartProps {
  kpis: TopKpis;
  loading?: boolean;
}

export function EnergyBarChart({ kpis, loading }: EnergyBarChartProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <h3>Energy Comparison</h3>
        <div className="chart-skeleton" />
      </div>
    );
  }

  console.log("[EnergyBarChart] KPI values:", kpis);

  const data = [
    { name: "CO₂", value: kpis.co2Energy },
    { name: "Frascold", value: kpis.frascoldEnergy },
    { name: "New IQF", value: kpis.newIqfEnergy },
  ];

  console.log("[EnergyBarChart] Chart data:", data);

  return (
    <div className="chart-container">
      <h3>Energy Comparison</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "var(--text)" }}
            formatter={(value: number) => [`${value.toFixed(2)} kWh`, "Energy"]}
          />
          <Bar dataKey="value" fill="var(--accent-solar)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


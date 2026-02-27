"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { EnergyDataPoint } from "@/lib/energy/types";

interface TrendChartProps {
  data: EnergyDataPoint[];
  loading?: boolean;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function TrendChart({ data, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <h3>Energy Meters Trend</h3>
        <div className="chart-skeleton" />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    time: formatTime(d.time),
    co2: d.co2Energy ?? 0,
    frascold: d.frascoldEnergy ?? 0,
    newIqf: d.newIqfEnergy ?? 0,
  }));

  return (
    <div className="chart-container">
      <h3>Energy Meters Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "var(--text)" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="co2"
            name="CO₂ Energy (kWh)"
            stroke="var(--accent-solar)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="frascold"
            name="Frascold Energy (kWh)"
            stroke="var(--accent-load)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="newIqf"
            name="New IQF Energy (kWh)"
            stroke="var(--accent-grid)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

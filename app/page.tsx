"use client";

import useSWR from "swr";
import { KpiCards } from "@/components/KpiCards";
import { TrendChart } from "@/components/TrendChart";
import { EnergyBarChart } from "@/components/EnergyBarChart";
import { mapItemsToDataPoints, mapLatestToKpis } from "@/lib/energy/mappers";
import type { EnergyItem, EnergyDataPoint } from "@/lib/energy/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const POLL_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const { data: trendData, isLoading: trendLoading } = useSWR<{
    items: EnergyItem[];
  }>("/api/energy?points=60", fetcher, {
    refreshInterval: POLL_INTERVAL_MS,
  });

  const { data: latestData, isLoading: latestLoading } = useSWR<{
    item: EnergyItem | null;
  }>("/api/energy/latest", fetcher, {
    refreshInterval: POLL_INTERVAL_MS,
  });

  const { data: healthData } = useSWR<{ mode?: string }>("/api/health", fetcher);

  const items = trendData?.items ?? [];
  const latest = latestData?.item ?? null;
  const energyData: EnergyDataPoint[] = mapItemsToDataPoints(items);
  const topKpis = mapLatestToKpis(latest);
  const loading = trendLoading || latestLoading;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Energy Management Dashboard</h1>
        <span className="mode-badge">
          {healthData?.mode === "synthetic" ? "Synthetic" : "Live"}
        </span>
      </header>

      <KpiCards kpis={topKpis} loading={loading} />

      <div className="grid-2">
        <div>
          <TrendChart data={energyData} loading={loading} />
        </div>
        <div>
          <EnergyBarChart kpis={topKpis} loading={loading} />
        </div>
      </div>
    </main>
  );
}

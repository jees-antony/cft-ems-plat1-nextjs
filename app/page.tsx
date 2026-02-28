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
  // Fetch only the trend data (last N points); extract latest from that
  const { data: trendData, isLoading: loading } = useSWR<{
    items: EnergyItem[];
  }>("/api/energy?points=60", fetcher, {
    refreshInterval: POLL_INTERVAL_MS,
  });

  const items = trendData?.items ?? [];
  // Latest is the last item in the sorted array (oldest → newest)
  const latest = items.length > 0 ? items[items.length - 1] : null;
  const energyData: EnergyDataPoint[] = mapItemsToDataPoints(items);
  const topKpis = mapLatestToKpis(latest);

  // Log API responses and data mapping
  console.log("[Dashboard] API trend response items count:", items.length);
  console.log("[Dashboard] Extracted latest from items:", latest);
  console.log("[Dashboard] Mapped energy data:", energyData);
  console.log("[Dashboard] Top KPIs:", topKpis);
  console.log("[Dashboard] Loading:", loading);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>CFT Energy Management Dashboard</h1>
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

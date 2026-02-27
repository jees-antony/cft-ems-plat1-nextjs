"use client";

import useSWR from "swr";
import { KpiCards } from "@/components/KpiCards";
import { mapLatestToKpis } from "@/lib/energy/mappers";
import type { EnergyItem } from "@/lib/energy/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const POLL_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const { data: latestData, isLoading: latestLoading } = useSWR<{
    item: EnergyItem | null;
  }>("/api/energy/latest", fetcher, {
    refreshInterval: POLL_INTERVAL_MS,
  });

  const { data: healthData } = useSWR<{ mode?: string }>("/api/health", fetcher);

  const latest = latestData?.item ?? null;
  const topKpis = mapLatestToKpis(latest);
  const loading = latestLoading;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Energy Management Dashboard</h1>
        <span className="mode-badge">
          {healthData?.mode === "synthetic" ? "Synthetic" : "Live"}
        </span>
      </header>

      <KpiCards kpis={topKpis} loading={loading} />
    </main>
  );
}

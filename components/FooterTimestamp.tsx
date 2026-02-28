"use client";

import useSWR from "swr";
import type { EnergyItem } from "@/lib/energy/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function FooterTimestamp() {
  // Use the same trend endpoint as the main dashboard for consistency
  // SWR will deduplicate and share the cache with the page's request
  const { data } = useSWR<{ items: EnergyItem[] }>(
    "/api/energy?points=60",
    fetcher,
    { refreshInterval: 30_000 }
  );

  // Extract the latest (last) item from the trend
  const items = data?.items ?? [];
  const item = items.length > 0 ? items[items.length - 1] : null;
  const ts =
    item?.payload?.time ??
    item?.timestamp;

  console.log("[FooterTimestamp] Using trend data - Latest item:", item, "Timestamp:", ts);

  if (!ts) return null;

  return (
    <footer className="footer-ts">
      Last update: {new Date(ts).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}
    </footer>
  );
}

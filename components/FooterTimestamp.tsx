"use client";

import useSWR from "swr";
import type { EnergyItem } from "@/lib/energy/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function FooterTimestamp() {
  const { data, isLoading } = useSWR<{ item: EnergyItem | null }>(
    "/api/energy/latest",
    fetcher,
    { refreshInterval: 30_000 }
  );

  const item = data?.item ?? null;
  const ts =
    item?.payload?.time ??
    item?.timestamp; // fallback if payload didn't carry time

  console.log("[FooterTimestamp] API response:", data, "Timestamp value:", ts);

  if (!ts || isLoading) return null;

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

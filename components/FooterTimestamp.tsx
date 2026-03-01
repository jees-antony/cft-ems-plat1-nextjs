"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import type { EnergyItem } from "@/lib/energy/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function FooterTimestamp() {
  const [displayTime, setDisplayTime] = useState<string>("Loading...");

  // Use the same trend endpoint as the main dashboard for consistency
  const { data } = useSWR<{ items: EnergyItem[] }>(
    "/api/energy?points=60",
    fetcher,
    { refreshInterval: 30_000 }
  );

  useEffect(() => {
    // Extract the latest (last) item from the trend
    const items = data?.items ?? [];
    const item = items.length > 0 ? items[items.length - 1] : null;
    const ts = item?.payload?.time ?? item?.timestamp;

    if (ts) {
      setDisplayTime(
        new Date(ts).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    } else {
      // Fallback to current time if no data
      setDisplayTime(
        new Date().toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
  }, [data]);

  return (
    <footer className="footer-ts">
      <style jsx>{`
        .footer-ts {
          position: fixed;
          bottom: 68px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          background: rgba(10, 10, 16, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 50;
        }
      `}</style>
      Last update: {displayTime}
    </footer>
  );
}

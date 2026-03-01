"use client";

import { useState } from "react";
import useSWR from "swr";
import * as xlsx from "xlsx";
import { DataLogTable } from "@/components/DataLogTable";
import { mapItemsToDataPoints } from "@/lib/energy/mappers";
import type { EnergyItem, EnergyDataPoint } from "@/lib/energy/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COUNT_OPTIONS = [50, 100, 200, 500, 1000];

export default function DataLogPage() {
    const [count, setCount] = useState(200);

    const { data, isLoading } = useSWR<{ items: EnergyItem[] }>(
        `/api/energy?points=${count}`,
        fetcher,
        { revalidateOnFocus: false, refreshInterval: 60_000 }
    );

    const items = data?.items ?? [];
    const energyData: EnergyDataPoint[] = mapItemsToDataPoints(items);

    const handleExport = () => {
        if (!energyData || energyData.length === 0) return;

        const exportData = energyData.map((d) => ({
            Timestamp: new Date(d.time).toLocaleString(),
            "CO2 Energy (kWh)": d.co2Energy,
            "Frascold Energy (kWh)": d.frascoldEnergy,
          "New IQF Energy (kWh)": d.newIqfEnergy,
          "NH3 Unit 1": d.nh3Unit1,
          "NH3 Unit 2": d.nh3Unit2,
          "New IQF Status": d.newIqfRunning,
          "Old IQF Status": d.oldIqfRunning,
        }));

        const worksheet = xlsx.utils.json_to_sheet(exportData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Data Log");
        xlsx.writeFile(workbook, `energy_data_log_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Data Log</h1>
                    <p className="subtitle">Last {energyData.length} records</p>
                </div>

                <div className="header-controls">
                    <div className="count-selector">
                        <label htmlFor="count-select">Show</label>
                        <select
                            id="count-select"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="count-select"
                        >
                            {COUNT_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt} records</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="export-btn"
                        onClick={handleExport}
                        disabled={isLoading || energyData.length === 0}
                    >
                        Export Excel
                    </button>
                </div>
            </header>

            <DataLogTable data={energyData} loading={isLoading && !data} />

            <style jsx>{`
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .header-left h1 {
          margin: 0;
        }
        .subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
        }
        .header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .count-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }
        .count-select {
          appearance: none;
          background: rgba(79, 110, 247, 0.1);
          border: 1.5px solid rgba(79, 110, 247, 0.25);
          color: rgba(130, 160, 255, 0.9);
          border-radius: 999px;
          padding: 0 16px;
          height: 38px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: all 0.18s ease;
          padding-right: 28px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237090ff' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        .count-select:hover, .count-select:focus {
          border-color: rgba(79, 110, 247, 0.5);
          background-color: rgba(79, 110, 247, 0.18);
          color: #a8bfff;
        }
        .count-select option {
          background: #1a1a2e;
          color: #e0e0e0;
        }
        .export-btn {
          display: inline-flex;
          align-items: center;
          height: 38px;
          padding: 0 24px;
          background: #4f6ef7;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 2px 12px rgba(79, 110, 247, 0.35);
          white-space: nowrap;
        }
        .export-btn:hover:not(:disabled) {
          background: #3d5ae5;
          box-shadow: 0 4px 18px rgba(79, 110, 247, 0.5);
          transform: translateY(-1px);
        }
        .export-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
        </main>
    );
}

"use client";

import type { EnergyDataPoint } from "@/lib/energy/types";

interface DataLogTableProps {
    data: EnergyDataPoint[];
    loading?: boolean;
}

function formatTime(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch {
        return iso;
    }
}

export function DataLogTable({ data, loading }: DataLogTableProps) {
    if (loading) {
        return (
            <div className="table-container">
                <div className="table-skeleton">Loading data...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">No data available for the selected period.</div>
            </div>
        );
    }

    return (
        <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>CO₂ Energy (kWh)</th>
                        <th>Frascold Energy (kWh)</th>
                        <th>New IQF Energy (kWh)</th>
                        <th>NH3 Unit 1</th>
                        <th>NH3 Unit 2</th>
                        <th>New IQF Status</th>
                        <th>Old IQF Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={`${row.time}-${idx}`}>
                            <td>{formatTime(row.time)}</td>
                            <td>{row.co2Energy?.toFixed(2) ?? "0.00"}</td>
                            <td>{row.frascoldEnergy?.toFixed(2) ?? "0.00"}</td>
                            <td>{row.newIqfEnergy?.toFixed(2) ?? "0.00"}</td>
                            <td>{typeof row.nh3Unit1 === "number" ? row.nh3Unit1.toFixed(4) : "—"}</td>
                            <td>{typeof row.nh3Unit2 === "number" ? row.nh3Unit2.toFixed(4) : "—"}</td>
                            <td>{row.newIqfRunning ?? "Stopped"}</td>
                            <td>{row.oldIqfRunning ?? "Stopped"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style jsx>{`
        .table-container {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
          margin-top: 1rem;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          color: var(--text);
        }
        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .data-table th {
          font-weight: 600;
          color: var(--text-muted);
          position: sticky;
          top: 0;
          background: var(--bg-card);
          z-index: 10;
        }
        .data-table tr:hover {
          background: var(--bg-page);
        }
        .data-table tr:last-child td {
          border-bottom: none;
        }
        .empty-state, .table-skeleton {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}

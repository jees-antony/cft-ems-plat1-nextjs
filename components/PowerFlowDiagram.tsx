"use client";

import type { TopKpis } from "@/lib/energy/types";

interface PowerFlowDiagramProps {
  kpis: TopKpis;
  loading?: boolean;
}

export function PowerFlowDiagram({ kpis, loading }: PowerFlowDiagramProps) {
  const { solarKw, gridKw, loadKw, batteryVoltage } = kpis;

  return (
    <div className="power-flow">
      <h3>Power Flow</h3>
      {loading ? (
        <div className="power-flow-skeleton" />
      ) : (
        <div className="flow-grid">
          <div className="flow-node solar">
            <span className="label">Solar</span>
            <span className="value">{solarKw.toFixed(2)} kW</span>
          </div>
          <div className="flow-node grid">
            <span className="label">Grid</span>
            <span className="value">{gridKw.toFixed(2)} kW</span>
          </div>
          <div className="flow-node battery">
            <span className="label">Battery</span>
            <span className="value">{batteryVoltage.toFixed(1)} V</span>
          </div>
          <div className="flow-node load">
            <span className="label">Load</span>
            <span className="value">{loadKw.toFixed(2)} kW</span>
          </div>
          <div className="flow-line solar-to-load" />
          <div className="flow-line grid-to-load" />
        </div>
      )}
    </div>
  );
}

/**
 * Map API responses to frontend UI shapes
 */

import type { EnergyItem, EnergyDataPoint, TopKpis } from "./types";

/** Kw or KVA as fallback (some payloads use KVA only) */
function kwOrKva(obj?: { Kw?: number; KVA?: number }): number | undefined {
  const v = obj?.Kw ?? obj?.KVA;
  return v !== undefined ? v : undefined;
}

export function mapItemsToDataPoints(items: EnergyItem[]): EnergyDataPoint[] {
  return items.map((item) => {
    const ts = item.timestamp ?? parseInt(item.SK ?? "0", 10);
    const p = item.payload ?? {};
    return {
      time: new Date(ts).toISOString(),
      timestamp: ts,
      co2Energy: p.co2_energy_meter,
      frascoldEnergy: p.frascold_energy_meter,
      newIqfEnergy: p.new_IQF_energy_meter,
    };
  });
}

export function mapLatestToKpis(item: EnergyItem | null): TopKpis {
  if (!item?.payload) {
    return {
      co2Energy: 0,
      frascoldEnergy: 0,
      newIqfEnergy: 0,
    };
  }
  const p = item.payload;
  return {
    co2Energy: p.co2_energy_meter ?? 0,
    frascoldEnergy: p.frascold_energy_meter ?? 0,
    newIqfEnergy: p.new_IQF_energy_meter ?? 0,
  };
}

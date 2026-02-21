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
    const p = item.payload ?? {};
    const ts = item.timestamp ?? parseInt(item.SK ?? "0", 10);
    return {
      time: p.time ?? new Date(ts).toISOString(),
      timestamp: ts,
      loadKw: kwOrKva(p.load),
      solarKw: p.solar_kw,
      gridKw: kwOrKva(p.in),
      batteryVoltage: p.battery_voltage,
      solarKwh: p.today_solar_kwh,
      loadKwh: p.load?.KWH,
    };
  });
}

export function mapLatestToKpis(item: EnergyItem | null): TopKpis {
  if (!item?.payload) {
    return {
      solarKw: 0,
      loadKw: 0,
      gridKw: 0,
      batteryVoltage: 0,
    };
  }
  const p = item.payload;
  const loadKw = kwOrKva(p.load) ?? 0;
  const solarKw = p.solar_kw ?? 0;
  const gridKw = kwOrKva(p.in) ?? 0;
  const solarEfficiency = solarKw > 0 && p.data_1
    ? Math.min(100, (solarKw / 15) * 100)
    : undefined;
  return {
    solarKw,
    loadKw,
    gridKw,
    batteryVoltage: p.battery_voltage ?? 0,
    solarEfficiency,
    peakLoad24h: p.max_demand_24h,
  };
}

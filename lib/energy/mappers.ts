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
      // NH3 sensors (some payloads use different casing)
      nh3Unit1: (p.NH3Unit1 ?? p.NH3unit1) as number | undefined,
      nh3Unit2: (p.NH3unit2 ?? p.NH3Unit2) as number | undefined,
      // Running flags: normalize 1/0 or "1"/"0" to human-readable
      newIqfRunning:
        String(p.NewIQFRunning ?? p.NewIqfRunning ?? p.newIQFRunning ?? "0") === "1"
          ? "Running"
          : "Stopped",
      oldIqfRunning:
        String(p.OldIQFRunning ?? p.OldIqfRunning ?? p.oldIQFRunning ?? "0") === "1"
          ? "Running"
          : "Stopped",
    };
  });
}

import { computeSolarKw } from "./solar-calc";

export function mapLatestToKpis(item: EnergyItem | null): TopKpis {
  if (!item?.payload) {
    return {
      co2Energy: 0,
      frascoldEnergy: 0,
      newIqfEnergy: 0,
      nh3Unit1: 0,
      nh3Unit2: 0,
      newIqfRunning: "Stopped",
      oldIqfRunning: "Stopped",
      solarKw: 0,
      gridKw: 0,
      loadKw: 0,
      batteryVoltage: 0,
    };
  }
  const p = item.payload;
  return {
    co2Energy: p.co2_energy_meter ?? 0,
    frascoldEnergy: p.frascold_energy_meter ?? 0,
    newIqfEnergy: p.new_IQF_energy_meter ?? 0,
    nh3Unit1: (p.NH3Unit1 ?? p.NH3unit1) ?? 0,
    nh3Unit2: (p.NH3unit2 ?? p.NH3Unit2) ?? 0,
    newIqfRunning:
      String(p.NewIQFRunning ?? p.NewIqfRunning ?? p.newIQFRunning ?? "0") === "1"
        ? "Running"
        : "Stopped",
    oldIqfRunning:
      String(p.OldIQFRunning ?? p.OldIqfRunning ?? p.oldIQFRunning ?? "0") === "1"
        ? "Running"
        : "Stopped",

    solarKw: computeSolarKw(p),
    gridKw: p.in?.Kw ?? 0,
    loadKw: p.load?.Kw ?? 0,
    batteryVoltage:
      (p.battery_voltage as number) ??
      (p.batteryVoltage as number) ??
      0,
  };
}

/**
 * Shared types for Zoladyne EMS energy data
 */

export interface LoadData {
  KVA?: number;
  KWH?: number;
  Kw?: number;
  Vavg?: number;
  Il1?: number;
  Il2?: number;
  Il3?: number;
  Vr?: number;
  Vy?: number;
  Vb?: number;
  Ir?: number;
  Iy?: number;
  Ib?: number;
  pfAvg?: number;
  Kvar?: number;
}

export interface MpptData {
  pv_voltage?: {
    mppt1?: number;
    mppt2?: number;
    mppt3?: number;
    mppt4?: number;
    mppt5?: number;
    mppt6?: number;
  };
  pv_current?: {
    mppt1?: number;
    mppt2?: number;
    mppt3?: number;
    mppt4?: number;
    mppt5?: number;
    mppt6?: number;
  };
}

export interface EnergyPayload {
  /** Energy meter values for EMS dashboard */
  co2_energy_meter?: number;
  frascold_energy_meter?: number;
  new_IQF_energy_meter?: number;
}

export interface EnergyItem {
  PK: string;
  SK: string;
  payload: EnergyPayload;
  /** Convenience: SK as number (ms) */
  timestamp?: number;
}

/** API response shape for time-series */
export interface EnergyTrendResponse {
  items: EnergyItem[];
}

/** API response shape for latest */
export interface LatestEnergyResponse {
  item: EnergyItem | null;
}

/** Frontend-mapped shape for charts/KPIs */
export interface EnergyDataPoint {
  time: string;
  timestamp: number;
  co2Energy?: number;
  frascoldEnergy?: number;
  newIqfEnergy?: number;
}

export interface TopKpis {
  co2Energy: number;
  frascoldEnergy: number;
  newIqfEnergy: number;
}

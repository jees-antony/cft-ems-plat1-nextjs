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
  load?: LoadData;
  in?: LoadData;
  battery_voltage?: number;
  KWH?: number;
  data_1?: MpptData;
  data_2?: MpptData;
  data_3?: MpptData;
  time?: string;
  /** Backend-computed: solar kW */
  solar_kw?: number;
  /** Backend-computed: today solar kWh */
  today_solar_kwh?: number;
  /** Backend-computed: max demand 24h */
  max_demand_24h?: number;
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
  loadKw?: number;
  solarKw?: number;
  gridKw?: number;
  batteryVoltage?: number;
  solarKwh?: number;
  loadKwh?: number;
}

export interface TopKpis {
  solarKw: number;
  loadKw: number;
  gridKw: number;
  batteryVoltage: number;
  solarEfficiency?: number;
  peakLoad24h?: number;
}

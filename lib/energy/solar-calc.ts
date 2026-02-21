/**
 * Solar kW calculation from MPPT data
 * Port from backend logic
 *
 * For each of data_1, data_2, data_3:
 *   voltage = pv_voltage.mppt1
 *   current = sum(pv_current.mppt1..mppt6) / 10
 *   kw_i = voltage * current
 * Total: (kw1 + kw2 + kw3) / 1000
 */

import type { MpptData } from "./types";

function getVoltage(data?: MpptData): number {
  return data?.pv_voltage?.mppt1 ?? 0;
}

function getCurrent(data?: MpptData): number {
  const pc = data?.pv_current;
  if (!pc) return 0;
  const sum =
    (pc.mppt1 ?? 0) +
    (pc.mppt2 ?? 0) +
    (pc.mppt3 ?? 0) +
    (pc.mppt4 ?? 0) +
    (pc.mppt5 ?? 0) +
    (pc.mppt6 ?? 0);
  return sum / 10;
}

/**
 * Compute solar kW from payload's data_1, data_2, data_3
 * @returns solar power in kW
 */
export function computeSolarKw(payload: {
  data_1?: MpptData;
  data_2?: MpptData;
  data_3?: MpptData;
}): number {
  const kw1 = getVoltage(payload.data_1) * getCurrent(payload.data_1);
  const kw2 = getVoltage(payload.data_2) * getCurrent(payload.data_2);
  const kw3 = getVoltage(payload.data_3) * getCurrent(payload.data_3);
  return (kw1 + kw2 + kw3) / 1000;
}

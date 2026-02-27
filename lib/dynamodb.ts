/**
 * DynamoDB client and query helpers for Zoladyne EMS
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import type { EnergyItem, EnergyPayload } from "./energy/types";

const PK = "cft/ems/site1";

/** Normalize DynamoDB item to EMS payload shape (three energy meters). */
function normalizePayload(item: Record<string, unknown> | { payload?: unknown }): EnergyPayload {
  const rec = item as Record<string, unknown>;

  // Handle literal "payload.value" attribute that may contain { value: { ...meters } }
  const payloadDot = rec["payload.value"] as Record<string, unknown> | undefined;
  if (payloadDot && typeof payloadDot === "object") {
    const inner = (payloadDot as Record<string, unknown>).value as Record<string, unknown> | undefined;
    if (inner && typeof inner === "object") {
      return inner as EnergyPayload;
    }
    return payloadDot as EnergyPayload;
  }

  // Fallbacks if data is nested under payload / payload.value
  const payload = rec.payload as Record<string, unknown> | undefined;
  if (payload && typeof payload === "object") {
    const value = payload.value as Record<string, unknown> | undefined;
    if (value && typeof value === "object") {
      return value as EnergyPayload;
    }
    return payload as EnergyPayload;
  }

  return {} as EnergyPayload;
}

function getClient(): DynamoDBClient | null {
  const region = process.env.REGION ?? process.env.AWS_REGION ?? "ap-south-1";
  if (process.env.USE_SYNTHETIC_DATA === "1") return null;
  
  try {
    // Log configuration for debugging (region only, not credentials)
    if (process.env.NODE_ENV === "development") {
      console.log("[DynamoDB] Initializing client with region:", region);
    }
    return new DynamoDBClient({ region });
  } catch (error) {
    console.error("[DynamoDB] Failed to initialize client:", error);
    console.warn("[DynamoDB] Falling back to synthetic data mode");
    return null;  // Fallback to synthetic mode
  }
}
}

function getDocClient() {
  const client = getClient();
  if (!client) return null;
  return DynamoDBDocumentClient.from(client);
}

function getTable(): string {
  return process.env.DDB_TABLE ?? "cft-ems-t1";
}

function enrichItem(rawItem: Record<string, unknown> | EnergyItem): EnergyItem {
  const payload = normalizePayload(rawItem);
  const item: EnergyItem = {
    PK: String(rawItem.PK ?? PK),
    SK: String(
      (rawItem as Record<string, unknown>).timestamp ??
        (rawItem as Record<string, unknown>).SK ??
        ""
    ),
    payload,
    timestamp:
      (rawItem as Record<string, unknown>).timestamp !== undefined
        ? parseInt(String((rawItem as Record<string, unknown>).timestamp), 10)
        : (rawItem as Record<string, unknown>).SK
        ? parseInt(String((rawItem as Record<string, unknown>).SK), 10)
        : undefined,
  };
  return item;
}

/** Check if we should use synthetic data */
export function useSynthetic(): boolean {
  return process.env.USE_SYNTHETIC_DATA === "1" || !getClient();
}

/** Query last N points (oldest → newest). Fetches newest N items then sorts ascending. */
export async function queryLastNPoints(
  n: number
): Promise<{ items: EnergyItem[] }> {
  if (useSynthetic()) {
    return getSyntheticTrend(n);
  }

  const doc = getDocClient();
  if (!doc) return getSyntheticTrend(n);

  try {
    const input: QueryCommandInput = {
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": PK },
      ScanIndexForward: false,
      Limit: Math.min(n, 500),
    };
    const res = await doc.send(new QueryCommand(input));
    const rawItems = (res.Items ?? []) as Record<string, unknown>[];
    const items = rawItems.map(enrichItem);
    const sorted = items.sort(
      (a, b) => (a.timestamp ?? parseInt(a.SK, 10)) - (b.timestamp ?? parseInt(b.SK, 10))
    );
    return { items: sorted };
  } catch (error: any) {
    // If credentials error, fall back to synthetic data
    if (error?.name === "CredentialsProviderError" || error?.code === "CredentialsError") {
      console.warn("[DynamoDB Query] Credentials error, falling back to synthetic data:", error.message);
      return getSyntheticTrend(n);
    }
    throw error;
  }
}

/** Query latest single record */
export async function queryLatest(): Promise<EnergyItem | null> {
  if (useSynthetic()) {
    const { items } = await getSyntheticTrend(1);
    return items[0] ?? null;
  }

  const doc = getDocClient();
  if (!doc) {
    const { items } = await getSyntheticTrend(1);
    return items[0] ?? null;
  }

  try {
    const input: QueryCommandInput = {
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": PK },
      ScanIndexForward: false,
      Limit: 1,
    };
    const res = await doc.send(new QueryCommand(input));
    const raw = res.Items?.[0] as Record<string, unknown> | undefined;
    return raw ? enrichItem(raw) : null;
  } catch (error: any) {
    if (error?.name === "CredentialsProviderError" || error?.code === "CredentialsError") {
      console.warn("[DynamoDB Query Latest] Credentials error, falling back to synthetic");
      const { items } = await getSyntheticTrend(1);
      return items[0] ?? null;
    }
    throw error;
  }
}

/** Query by date range (UTC midnight timestamps) */
export async function queryHistory(
  startDate: string,
  endDate: string,
  limit: number
): Promise<{ items: EnergyItem[]; lastKey?: Record<string, unknown> }> {
  if (useSynthetic()) {
    const { items } = await getSyntheticHistory(startDate, endDate, limit);
    return { items };
  }

  const doc = getDocClient();
  if (!doc) {
    const { items } = await getSyntheticHistory(startDate, endDate, limit);
    return { items };
  }

  const startMs = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const endMs = new Date(`${endDate}T23:59:59.999Z`).getTime();

  const input: QueryCommandInput = {
    TableName: getTable(),
    KeyConditionExpression: "PK = :pk AND #ts BETWEEN :start AND :end",
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    },
    ExpressionAttributeValues: {
      ":pk": PK,
      ":start": String(startMs),
      ":end": String(endMs),
    },
    ScanIndexForward: false,
    Limit: limit,
  };
  const res = await doc.send(new QueryCommand(input));
  const rawItems = (res.Items ?? []) as Record<string, unknown>[];
  const items = rawItems.map(enrichItem);
  return { items, lastKey: res.LastEvaluatedKey as Record<string, unknown> };
}

/** Query by timestamp range (ms) */
export async function queryRange(
  startMs: number,
  endMs: number
): Promise<{ items: EnergyItem[]; lastKey?: Record<string, unknown> }> {
  if (useSynthetic()) {
    const start = new Date(startMs).toISOString().slice(0, 10);
    const end = new Date(endMs).toISOString().slice(0, 10);
    const { items } = await getSyntheticHistory(start, end, 200);
    return { items: items.filter((i) => {
      const t = i.timestamp ?? parseInt(i.SK, 10);
      return t >= startMs && t <= endMs;
    }) };
  }

  const doc = getDocClient();
  if (!doc) {
    const start = new Date(startMs).toISOString().slice(0, 10);
    const end = new Date(endMs).toISOString().slice(0, 10);
    const { items } = await getSyntheticHistory(start, end, 200);
    return { items: items.filter((i) => {
      const t = i.timestamp ?? parseInt(i.SK, 10);
      return t >= startMs && t <= endMs;
    }) };
  }

  const allItems: EnergyItem[] = [];
  let lastKey: Record<string, unknown> | undefined;
  do {
    const input: QueryCommandInput = {
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk AND #ts BETWEEN :start AND :end",
      ExpressionAttributeNames: {
        "#ts": "timestamp",
      },
      ExpressionAttributeValues: {
        ":pk": PK,
        ":start": String(startMs),
        ":end": String(endMs),
      },
      ScanIndexForward: true,
      ExclusiveStartKey: lastKey,
    };
    const res = await doc.send(new QueryCommand(input));
    const rawItems = (res.Items ?? []) as Record<string, unknown>[];
    allItems.push(...rawItems.map(enrichItem));
    lastKey = res.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  return { items: allItems, lastKey };
}

// --- Synthetic data for offline / local dev ---

function syntheticPayload(ts: number): EnergyItem["payload"] {
  const t = new Date(ts);
  const hour = t.getUTCHours() + t.getUTCMinutes() / 60;
  const solar = Math.max(0, Math.sin((hour - 6) * (Math.PI / 12)) * 15);
  const load = 5 + Math.random() * 8;
  const grid = Math.max(0, load - solar);
  return {
    load: {
      Kw: load,
      KWH: load * (hour / 24),
      KVA: load * 1.1,
      Vavg: 230,
      Il1: 2,
      Il2: 2,
      Il3: 2,
      pfAvg: 0.92,
    },
    in: {
      Kw: grid,
      KWH: grid * (hour / 24),
    },
    battery_voltage: 48 + Math.random() * 4,
    KWH: 120,
    data_1: {
      pv_voltage: { mppt1: 320 + Math.random() * 40 },
      pv_current: {
        mppt1: 2, mppt2: 2, mppt3: 2, mppt4: 2, mppt5: 2, mppt6: 2,
      },
    },
    data_2: {
      pv_voltage: { mppt1: 310 + Math.random() * 50 },
      pv_current: {
        mppt1: 1.8, mppt2: 1.8, mppt3: 1.9, mppt4: 2, mppt5: 1.9, mppt6: 2,
      },
    },
    data_3: {
      pv_voltage: { mppt1: 305 + Math.random() * 45 },
      pv_current: {
        mppt1: 2, mppt2: 1.9, mppt3: 2, mppt4: 2.1, mppt5: 2, mppt6: 1.9,
      },
    },
    time: t.toISOString(),
  };
}

async function getSyntheticTrend(n: number): Promise<{ items: EnergyItem[] }> {
  const items: EnergyItem[] = [];
  const now = Date.now();
  const step = 60 * 1000; // 1 min between points
  for (let i = n - 1; i >= 0; i--) {
    const ts = now - i * step;
    const payload = syntheticPayload(ts);
    const item: EnergyItem = {
      PK,
      SK: String(ts),
      payload,
      timestamp: ts,
    };
    enrichItem(item);
    items.push(item);
  }
  return { items };
}

async function getSyntheticHistory(
  startDate: string,
  endDate: string,
  limit: number
): Promise<{ items: EnergyItem[] }> {
  const startMs = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const endMs = new Date(`${endDate}T23:59:59.999Z`).getTime();
  const items: EnergyItem[] = [];
  const step = 15 * 60 * 1000; // 15 min
  for (let ts = endMs; ts >= startMs && items.length < limit; ts -= step) {
    const payload = syntheticPayload(ts);
    items.push({
      PK,
      SK: String(ts),
      payload,
      timestamp: ts,
    });
  }
  return { items: items.map(enrichItem) };
}

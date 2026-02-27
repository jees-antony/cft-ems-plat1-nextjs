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
  
  try {
    // Log configuration for debugging (region only, not credentials)
    if (process.env.NODE_ENV === "development") {
      console.log("[DynamoDB] Initializing client with region:", region);
    }
    return new DynamoDBClient({ region });
  } catch (error) {
    console.error("[DynamoDB] Failed to initialize client:", error);
    return null;
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
  return false; // Production: no synthetic data
}

/** Query last N points (oldest → newest). Fetches newest N items then sorts ascending. */
export async function queryLastNPoints(
  n: number
): Promise<{ items: EnergyItem[] }> {
  const doc = getDocClient();
  if (!doc) {
    console.error("[DynamoDB] DDB client not available - credentials may not be loaded");
    return { items: [] };
  }

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
    console.error("[DynamoDB Query] Error:", error?.message || String(error));
    return { items: [] };
  }
}

/** Query latest single record */
export async function queryLatest(): Promise<EnergyItem | null> {
  const doc = getDocClient();
  if (!doc) {
    console.error("[DynamoDB] DDB client not available - credentials may not be loaded");
    return null;
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
    console.error("[DynamoDB Query Latest] Error:", error?.message || String(error));
    return null;
  }
}

/** Query by date range (UTC midnight timestamps) */
export async function queryHistory(
  startDate: string,
  endDate: string,
  limit: number
): Promise<{ items: EnergyItem[]; lastKey?: Record<string, unknown> }> {
  const doc = getDocClient();
  if (!doc) {
    console.error("[DynamoDB] DDB client not available - credentials may not be loaded");
    return { items: [] };
  }

  try {
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
  } catch (error: any) {
    console.error("[DynamoDB Query History] Error:", error?.message || String(error));
    return { items: [] };
  }
}

/** Query by timestamp range (ms) */
export async function queryRange(
  startMs: number,
  endMs: number
): Promise<{ items: EnergyItem[]; lastKey?: Record<string, unknown> }> {
  const doc = getDocClient();
  if (!doc) {
    console.error("[DynamoDB] DDB client not available - credentials may not be loaded");
    return { items: [] };
  }

  try {
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
  } catch (error: any) {
    console.error("[DynamoDB Query Range] Error:", error?.message || String(error));
    return { items: [] };
  }
}

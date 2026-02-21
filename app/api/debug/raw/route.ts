/**
 * GET /api/debug/raw
 * Returns raw DynamoDB response for latest item (for debugging payload structure)
 */

import { NextResponse } from "next/server";
import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

export async function GET() {
  try {
    if (process.env.USE_SYNTHETIC_DATA === "1") {
      return NextResponse.json({ mode: "synthetic", raw: null });
    }
    const region = process.env.AWS_REGION ?? "ap-south-1";
    const table = process.env.DDB_TABLE ?? "zoladyne-dash";
    const client = new DynamoDBClient({ region });
    const doc = DynamoDBDocumentClient.from(client);
    const input: QueryCommandInput = {
      TableName: table,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": "zoladyne/ems" },
      ScanIndexForward: false,
      Limit: 2,
    };
    const res = await doc.send(new QueryCommand(input));
    const items = res.Items ?? [];
    const raw = items[0] ?? null;
    return NextResponse.json({
      itemCount: items.length,
      rawItem: raw,
      payloadKeys: raw && typeof raw.payload === "object"
        ? Object.keys((raw.payload as Record<string, unknown>) ?? {})
        : [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

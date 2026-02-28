/**
 * GET /api/energy?points=60
 * Returns time-series for charts (last N points, oldest → newest)
 */

import { NextRequest, NextResponse } from "next/server";
import { queryLastNPoints } from "@/lib/dynamodb";

console.log("ENV:", {
  REGION: process.env.REGION,
  // AWS_REGION: process.env.AWS_REGION,
  TABLE: process.env.DDB_TABLE,
});

export async function GET(request: NextRequest) {
  try {
    const points = Math.min(
      Math.max(1, parseInt(request.nextUrl.searchParams.get("points") ?? "60", 10)),
      500
    );
    const { items } = await queryLastNPoints(points);
    console.log("[api/energy] returning", items.length, "points");
    return NextResponse.json({ items });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[api/energy] ERROR:", {
      message: errorMessage,
      stack: errorStack,
      type: typeof err,
      env: { REGION: process.env.REGION, DDB_TABLE: process.env.DDB_TABLE },
    });
    return NextResponse.json(
      { error: "Failed to fetch energy data", details: errorMessage },
      { status: 500 }
    );
  }
}

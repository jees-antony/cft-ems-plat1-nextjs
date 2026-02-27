/**
 * GET /api/energy/latest
 * Returns the most recent record
 */

import { NextResponse } from "next/server";
import { queryLatest } from "@/lib/dynamodb";

export async function GET() {
  try {
    const item = await queryLatest();
    return NextResponse.json({ item });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    console.error("[api/energy/latest] ERROR:", {
      message: errorMessage,
      stack: errorStack,
      type: typeof err,
      env: { REGION: process.env.REGION, DDB_TABLE: process.env.DDB_TABLE },
    });
    return NextResponse.json(
      { error: "Failed to fetch latest energy data", details: errorMessage },
      { status: 500 }
    );
  }
}

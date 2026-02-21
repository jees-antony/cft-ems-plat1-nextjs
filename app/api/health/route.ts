/**
 * GET /api/health
 * Basic health check
 */

import { NextResponse } from "next/server";
import { useSynthetic } from "@/lib/dynamodb";

export async function GET() {
  const synthetic = useSynthetic();
  return NextResponse.json({
    status: "ok",
    mode: synthetic ? "synthetic" : "dynamodb",
    timestamp: new Date().toISOString(),
  });
}

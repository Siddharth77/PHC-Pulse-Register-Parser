import { NextResponse } from "next/server";
import { getFederatedMetricsState } from "../state";

export async function GET() {
  try {
    const data = getFederatedMetricsState();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch federated metrics" },
      { status: 500 }
    );
  }
}

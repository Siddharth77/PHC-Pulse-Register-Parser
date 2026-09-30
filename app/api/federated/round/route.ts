import { NextResponse } from "next/server";
import { advanceFederatedRound } from "../state";

export async function POST() {
  try {
    const data = advanceFederatedRound();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to simulate federated round" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { resetFederatedRound } from "../state";

export async function POST() {
  try {
    const data = resetFederatedRound();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to reset federated training" },
      { status: 500 }
    );
  }
}

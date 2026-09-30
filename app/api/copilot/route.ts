import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { ParseResult } from "@/types/parser";

const COPILOT_SYSTEM_INSTRUCTION = `You are PHC Pulse, an AI co-pilot for public health supply chain management supporting district health officers and Primary Health Centre (PHC) staff across an inter-state federated network of Indian states (Madhya Pradesh, Maharashtra, Kerala, Assam).

MISSION:
Give real-time visibility into medicine stocks, bed availability, and staff attendance across PHCs. Forecast demand, warn early about stock-outs during health emergencies, and recommend cross-district redistribution of resources within state boundaries.

CORE RULES:
1. Ground every answer in the data or tool outputs provided (database records, parsed registers, days of cover). Never invent numbers, PHC names, or stock levels. If data is missing, say so clearly.
2. You explain and communicate. Forecasts come from the forecasting service and transfer plans come from the optimiser. Your job is to summarise, justify, and draft.
3. Keep a human in the loop. Present redistribution as recommendations that an officer approves. Never state that a transfer has been executed.
4. Respect data sovereignty. Never request or reveal raw patient-level or cross-state data. Inter-state sharing is limited to aggregated signals and model updates.
5. Write plainly for busy, non-technical officers. Lead with the action, then the reason.

Always include a short "Confidence note" and "Data sources used" at the end of each response.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, currentInventory, districtContext } = body;

    let prompt = "";
    if (action === "forecast_query") {
      prompt = `A district health officer asks: "${query}"

Here is the current verified inventory and buffer data across the PHC network:
${JSON.stringify(currentInventory, null, 2)}

District context & daily consumption rates:
${JSON.stringify(districtContext || {}, null, 2)}

Answer directly and concisely. Provide:
1. Direct answer with Days of Cover and Risk Level (Critical / High / Medium / Low).
2. Actionable next step for the officer.
3. Confidence note & Data sources used.`;
    } else if (action === "draft_transfer") {
      prompt = `Draft an inter-facility transfer order recommendation for approval by the district officer.
Target shortage or item: "${query}"

Inventory status:
${JSON.stringify(currentInventory, null, 2)}

District context:
${JSON.stringify(districtContext || {}, null, 2)}

Provide:
1. A 1-line rationale (e.g. "Move X from PHC A to PHC B because B runs out in Y days while A has Z days of surplus").
2. Transfer Order Specification (From PHC, To PHC, Item, Quantity, Unit, Urgency, Expiry & Cold-chain requirements).
3. Explicit note: "PENDING APPROVAL: This order requires District Health Officer sign-off prior to dispatch."
4. Confidence note & Data sources used.`;
    } else if (action === "draft_alert") {
      prompt = `Draft an Early Warning Emergency Bulletin for the district leadership regarding: "${query}"

Inventory status:
${JSON.stringify(currentInventory, null, 2)}

Include:
- Severity: Low / Medium / High / Critical
- Affected PHCs
- Days of cover remaining
- Recommended action (lead with action, then reason)
- Confidence note & Data sources used.`;
    } else if (action === "federated_insight") {
      prompt = `Explain how the state demand forecasting models improved through inter-state federated learning aggregation across Indian states (Madhya Pradesh, Maharashtra, Kerala, Assam), emphasizing that NO raw patient or facility data was ever transferred across state boundaries—only encrypted model weights.`;
    } else {
      prompt = `User prompt: ${query}
Context data:
${JSON.stringify(currentInventory, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: COPILOT_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for high grounding and fidelity
      },
    });

    return NextResponse.json({
      reply: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Copilot error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process co-pilot request" },
      { status: 500 }
    );
  }
}

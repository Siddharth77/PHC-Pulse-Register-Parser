import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

const REDISTRIBUTION_EXPLAINER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plan_summary: {
      type: Type.STRING,
      description: "A summary of the redistribution plan in at most 3 sentences, addressing the overall urgency and resource rebalancing goal.",
    },
    transfers: {
      type: Type.ARRAY,
      description: "List of transfers ordered by urgency (destination days of cover, ascending).",
      items: {
        type: Type.OBJECT,
        properties: {
          transfer_id: { type: Type.STRING },
          from_phc: { type: Type.STRING },
          to_phc: { type: Type.STRING },
          item: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          urgency: { type: Type.STRING },
          explanation: {
            type: Type.STRING,
            description: "One sentence explaining what moves, from where to where, and why, using exact supplied numbers.",
          },
          watch_out: {
            type: Type.STRING,
            description: "Note regarding near-expiry stock, cold chain, long distance, or risk to source PHC's cover.",
          },
          status: { type: Type.STRING, description: "Set to PENDING_APPROVAL" },
        },
        required: [
          "transfer_id",
          "from_phc",
          "to_phc",
          "item",
          "quantity",
          "urgency",
          "explanation",
          "watch_out",
          "status",
        ],
      },
    },
    data_issues: {
      type: Type.STRING,
      description: "Report if plan is empty or contains inconsistencies; otherwise null.",
      nullable: true,
    },
  },
  required: ["plan_summary", "transfers"],
};

const SYSTEM_INSTRUCTION = `You are the PHC Pulse Redistribution Explainer.
- You receive an optimiser-computed transfer plan and supporting data.
- Never change, add, or remove transfers or quantities. The plan is final.
- Explain each transfer in ONE sentence: what moves, from where to where, and why, using the exact numbers supplied.
- Add a watch_out note for near-expiry stock, cold chain, long distance, or a source PHC left with low cover.
- Write a summary of at most 3 sentences.
- Order transfers by urgency (destination days of cover, ascending).
- Set every status to "PENDING_APPROVAL"; never say a transfer happened.
- If the plan is empty or inconsistent, say so in data_issues.
Output JSON only.`;

export async function POST(req: NextRequest) {
  try {
    const { transferPlan, inventoryData } = await req.json();

    if (!transferPlan || !Array.isArray(transferPlan) || transferPlan.length === 0) {
      return NextResponse.json({
        plan_summary: "No transfers identified in the provided plan.",
        transfers: [],
        data_issues: "The provided plan is empty or missing data.",
      });
    }

    const prompt = `OPTIMISER PLAN:
${JSON.stringify(transferPlan, null, 2)}

SUPPORTING INVENTORY DATA:
${JSON.stringify(inventoryData, null, 2)}

Explain this plan according to the rules provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: REDISTRIBUTION_EXPLAINER_SCHEMA,
        temperature: 0.2,
      },
    });

    const explainerOutput = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json(explainerOutput);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Redistribution Explainer error:", error);
    return NextResponse.json(
      {
        plan_summary: "Error processing redistribution plan.",
        transfers: [],
        data_issues: `Internal system error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

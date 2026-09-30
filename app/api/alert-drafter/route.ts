import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

const ALERT_DRAFTER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    alert_id: { type: Type.STRING },
    severity: { type: Type.STRING, description: "Must match the supplied risk_level exactly." },
    title: { type: Type.STRING },
    full_message: { type: Type.STRING },
    sms_text: { type: Type.STRING, description: "Must be under 300 characters." },
    short_text_local: { type: Type.STRING, description: "Required only if a language is requested.", nullable: true },
    affected_phcs: { type: Type.ARRAY, items: { type: Type.STRING } },
    days_of_cover: { type: Type.NUMBER },
    is_projection: { type: Type.BOOLEAN },
    recommended_action: { type: Type.STRING, description: "Recommended officer action; do not claim actions were taken." },
  },
  required: [
    "alert_id", "severity", "title", "full_message", "sms_text",
    "affected_phcs", "days_of_cover", "is_projection", "recommended_action"
  ],
};

const SYSTEM_INSTRUCTION = `You are the PHC Pulse Alert Drafter. Write early-warning messages from the supplied forecast and risk data.
- Use only supplied data; never invent figures.
- Severity must match the supplied risk_level exactly.
- Structure: what is at risk, where, how soon, recommended action.
- Produce a full_message and an sms_text under 300 characters.
- Add short_text_local only if a language is requested.
- If the trigger is an outbreak scenario, state it is a projection, not a confirmed event.
- Tone: calm, factual, no blame.
- Recommend officer actions; never claim actions were taken.
Output JSON only.`;

export async function POST(req: NextRequest) {
  try {
    const { forecastData, riskData, language } = await req.json();

    if (!forecastData || !riskData) {
      return NextResponse.json(
        { error: "Missing required input: forecastData or riskData." },
        { status: 400 }
      );
    }

    const prompt = `FORECAST DATA:
${JSON.stringify(forecastData, null, 2)}

RISK DATA:
${JSON.stringify(riskData, null, 2)}

${language ? `Translate the short_text_local into: ${language}` : ""}

Draft an alert according to the rules.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ALERT_DRAFTER_SCHEMA,
        temperature: 0.3,
      },
    });

    const alertOutput = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json(alertOutput);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Alert Drafter error:", error);
    return NextResponse.json(
      { error: `System error: ${error.message}` },
      { status: 500 }
    );
  }
}

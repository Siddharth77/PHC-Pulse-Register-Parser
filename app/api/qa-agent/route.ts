import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";
import { QAAgentResponse } from "@/types/qa";

const QA_AGENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer_summary: {
      type: Type.STRING,
      description: "Direct answer leading with the primary conclusion/action, followed by the concise reason. Short and plain for busy non-technical officers. If context is insufficient, states 'Not enough data' and what is missing.",
    },
    affected_phcs: {
      type: Type.ARRAY,
      description: "List of affected Primary Health Centres strictly sorted by urgency (lowest days of cover first). Empty if not applicable.",
      items: {
        type: Type.OBJECT,
        properties: {
          phc_id: {
            type: Type.STRING,
            description: "Identifier of the Primary Health Centre as stated in data context.",
          },
          phc_name: {
            type: Type.STRING,
            description: "Name of the Primary Health Centre as stated in data context, or facility name.",
          },
          district: {
            type: Type.STRING,
            description: "District name of the facility as stated in data context.",
          },
          medicine: {
            type: Type.STRING,
            description: "Relevant medicine name under inquiry or at risk.",
          },
          days_of_cover: {
            type: Type.NUMBER,
            description: "Days of cover strictly as provided in context. Never recalculate or estimate.",
          },
          risk_level: {
            type: Type.STRING,
            description: "Exact risk level (Low / Medium / High / Critical) as supplied in the context.",
          },
        },
        required: ["phc_id", "phc_name", "district", "medicine", "days_of_cover", "risk_level"],
      },
    },
    suggested_next_action: {
      type: Type.STRING,
      description: "Recommended next step if question implies an action (e.g. 'Generate an inter-facility redistribution plan for officer approval'). Never state an action was executed.",
      nullable: true,
    },
    confidence: {
      type: Type.STRING,
      description: "Confidence rating: 'High', 'Medium', or 'Low'.",
    },
    confidence_note: {
      type: Type.STRING,
      description: "Brief note explaining certainty and grounding in the provided context.",
    },
    data_sources_used: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific registers, tables, or records referenced from the context.",
    },
  },
  required: [
    "answer_summary",
    "affected_phcs",
    "suggested_next_action",
    "confidence",
    "confidence_note",
    "data_sources_used",
  ],
};

const SYSTEM_INSTRUCTION = `You are the PHC Pulse Q&A Agent for district and national health officers. You answer questions about medicine stock, beds, staff attendance, forecasts, and risk, using ONLY the DATA CONTEXT supplied with each question.

RULES:
1. Use only numbers and names found in DATA CONTEXT. Never invent or estimate values. If the context cannot answer the question, say "Not enough data" and state what is missing.
2. Lead with the answer, then give the reason. Keep it short and plain for non-technical officers.
3. For stock questions, always give days_of_cover and risk_level (Low / Medium / High / Critical) as supplied in the context. Do not recalculate them.
4. List affected PHCs sorted by urgency (lowest days of cover first).
5. Respect scope: an officer sees only the states and districts in their access list. If asked about data outside it, decline politely.
6. Never reveal patient-level data. Cross-state answers may use aggregated figures only.
7. If a question implies an action (e.g. "move stock"), suggest generating a redistribution plan. Never claim an action was done.
8. Include data_sources_used and a confidence note. Set confidence to "High", "Medium", or "Low".

Output ONLY JSON matching the schema:
{
  "answer_summary": string,
  "affected_phcs": [
    {
      "phc_id": string,
      "phc_name": string,
      "district": string,
      "medicine": string,
      "days_of_cover": number,
      "risk_level": "Low" | "Medium" | "High" | "Critical"
    }
  ],
  "suggested_next_action": string | null,
  "confidence": "High" | "Medium" | "Low",
  "confidence_note": string,
  "data_sources_used": string[]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, dataContext, officerScope } = body;

    if (!dataContext && !question) {
      const fallback: QAAgentResponse = {
        answer_summary: "Not enough data. Please supply the DATA CONTEXT and the specific question.",
        affected_phcs: [],
        suggested_next_action: null,
        confidence: "Low",
        confidence_note: "No DATA CONTEXT provided. Unable to evaluate inventory or facility records.",
        data_sources_used: [],
      };
      return NextResponse.json(fallback);
    }

    const prompt = `OFFICER ACCESS SCOPE:
${JSON.stringify(officerScope || { allowed_districts: ["All"], allowed_states: ["Madhya Pradesh", "Maharashtra", "Kerala", "Assam"] }, null, 2)}

DATA CONTEXT:
${typeof dataContext === "string" ? dataContext : JSON.stringify(dataContext || "No context provided", null, 2)}

QUESTION:
${question || "Summarize current stockout risk and affected facilities."}

Answer strictly according to the 8 rules. Output ONLY JSON matching the target schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: QA_AGENT_SCHEMA,
        temperature: 0.1,
      },
    });

    const parsed: QAAgentResponse = JSON.parse(response.text?.trim() || "{}");
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("QA Agent error:", error);
    return NextResponse.json(
      {
        answer_summary: `Error processing query: ${error.message}`,
        affected_phcs: [],
        suggested_next_action: null,
        confidence: "Low",
        confidence_note: "System error occurred during evaluation.",
        data_sources_used: [],
      },
      { status: 500 }
    );
  }
}

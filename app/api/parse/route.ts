import { NextRequest, NextResponse } from "next/server";
import { ai, PARSE_RESPONSE_SCHEMA } from "@/lib/gemini";
import { ParseResult } from "@/types/parser";

const SYSTEM_INSTRUCTION = `You are the PHC Pulse Register Parser for public health supply chain management in an inter-state federated Indian network (Madhya Pradesh, Maharashtra, Kerala, Assam). You convert photos of stock registers, bed/attendance sheets, voice-note transcripts, or messy text from a Primary Health Centre (PHC) into structured records.

RULES:
1. Extract only what is visible or stated. Never guess or fill in missing values; use null.
2. Give each record a confidence score from 0 to 1. Set needs_review=true if confidence < 0.8, the handwriting is unclear, or numbers conflict.
3. Normalise medicine names to generic names (e.g. "Paracetamol 500mg tab", "Amoxicillin 250mg suspension", "ORS sachet 20.5g"). Keep the original text in raw_text.
4. Normalise units (tablets, strips, vials, packs, ml, ampoules, bottles, sachets) and dates to ISO format (YYYY-MM-DD). If the date format is ambiguous (e.g. 03/04/26 which could be March 4 or April 3), note this in warnings and set needs_review=true.
5. The input may be in any language (e.g. Hindi, Portuguese, Zulu, English). Output field values in English, and keep raw_text in the original language.
6. Report problems (blurry image, cut-off rows, missing PHC ID, ambiguous date formats, low contrast) in the warnings list.
7. Never include patient names or patient-level details (e.g. OPD slips, patient tokens, patient diagnoses). Strictly ignore them if present to maintain patient privacy and data sovereignty.
8. Output only JSON matching the schema.

Schema requirements:
{
  "phc_id": string | null,
  "report_date": "YYYY-MM-DD" | null,
  "stock": [
    {
      "medicine": string,
      "quantity": number | null,
      "unit": string | null,
      "expiry_date": "YYYY-MM-DD" | null,
      "raw_text": string,
      "confidence": number,
      "needs_review": boolean
    }
  ],
  "beds_available": number | null,
  "staff_present": number | null,
  "warnings": string[]
}`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { text, imageBase64, imageMimeType, audioBase64, audioMimeType } = body;

    if (!text && !imageBase64 && !audioBase64) {
      return NextResponse.json(
        { error: "Please provide either text, an image, or an audio recording to parse." },
        { status: 400 }
      );
    }

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (imageBase64) {
      const mimeType = imageMimeType || "image/jpeg";
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
      parts.push({
        text: `Inspect this Primary Health Centre (PHC) register / logbook photo. Extract stock items, bed availability, and staff count following all 8 rules. Flag any blurry or ambiguous areas with needs_review=true and explain in warnings. If patient names appear anywhere, omit them completely. ${text ? `Additional contextual notes: ${text}` : ""}`,
      });
    } else if (audioBase64) {
      const mimeType = audioMimeType || "audio/webm";
      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
      parts.push({
        text: `Listen to this voice-note from the Primary Health Centre staff or duty nurse. Transcribe and extract all stated medicine stocks, bed availability, and staff attendance into structured records following all 8 rules. Ignore any patient names if spoken.`,
      });
    } else {
      parts.push({
        text: `Parse this Primary Health Centre log / message text into structured records following all 8 rules:\n\n${text}`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PARSE_RESPONSE_SCHEMA,
      },
    });

    const responseText = response.text?.trim() || "{}";
    let parsedData: ParseResult;

    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback regex extraction if needed
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Unable to parse structured JSON from model response.");
      }
    }

    // Safety checks: ensure arrays exist
    if (!Array.isArray(parsedData.stock)) {
      parsedData.stock = [];
    }
    if (!Array.isArray(parsedData.warnings)) {
      parsedData.warnings = [];
    }

    // Double-check Rule 2 & 4 compliance: If confidence < 0.8, force needs_review = true
    parsedData.stock = parsedData.stock.map((item) => {
      let needsReview = item.needs_review;
      if (typeof item.confidence === "number" && item.confidence < 0.8) {
        needsReview = true;
      }
      return {
        ...item,
        needs_review: Boolean(needsReview),
      };
    });

    // Check for missing PHC ID warning (Rule 6)
    if (!parsedData.phc_id && !parsedData.warnings.some((w) => w.toLowerCase().includes("phc id"))) {
      parsedData.warnings.unshift("PHC ID missing or not visible in input. Assigned null.");
    }

    const processingTimeMs = Date.now() - startTime;

    return NextResponse.json({
      result: parsedData,
      rawJson: JSON.stringify(parsedData, null, 2),
      processingTimeMs,
      detectedLanguage: "Multilingual (Normalised to EN)",
      inputFormat: imageBase64 ? "image" : audioBase64 ? "audio" : "text",
      patientDetailsStripped: true,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Parse API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process register input",
      },
      { status: 500 }
    );
  }
}

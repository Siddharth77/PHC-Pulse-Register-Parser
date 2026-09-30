import { GoogleGenAI, Type } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const PARSE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    phc_id: {
      type: Type.STRING,
      description: "Identifier of the Primary Health Centre if explicitly visible or stated (e.g. 'PHC-MH-204'), otherwise null.",
      nullable: true,
    },
    report_date: {
      type: Type.STRING,
      description: "Date of the report or log in ISO format YYYY-MM-DD if stated, otherwise null.",
      nullable: true,
    },
    stock: {
      type: Type.ARRAY,
      description: "List of medicine and medical supply inventory records extracted strictly from the input.",
      items: {
        type: Type.OBJECT,
        properties: {
          medicine: {
            type: Type.STRING,
            description: "Normalised generic name in English (e.g. 'Paracetamol 500mg tab', 'Amoxicillin 250mg vial').",
          },
          quantity: {
            type: Type.NUMBER,
            description: "Visible or stated numeric quantity. Never guess; use null if unreadable or absent.",
            nullable: true,
          },
          unit: {
            type: Type.STRING,
            description: "Normalised unit (tablets, strips, vials, packs, ml, ampoules, bottles, sachets), or null.",
            nullable: true,
          },
          expiry_date: {
            type: Type.STRING,
            description: "Expiry date normalised to ISO format YYYY-MM-DD, or null if missing or not stated.",
            nullable: true,
          },
          raw_text: {
            type: Type.STRING,
            description: "Original verbatim text in the source language (Hindi, Portuguese, Zulu, English, etc.).",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0.0 and 1.0 reflecting handwriting clarity, completeness, and certainty.",
          },
          needs_review: {
            type: Type.BOOLEAN,
            description: "Set to true if confidence < 0.8, handwriting is unclear, numbers conflict, or date format is ambiguous.",
          },
        },
        required: ["medicine", "raw_text", "confidence", "needs_review"],
      },
    },
    beds_available: {
      type: Type.NUMBER,
      description: "Stated number of free/available patient beds. Null if not mentioned.",
      nullable: true,
    },
    staff_present: {
      type: Type.NUMBER,
      description: "Stated number of duty staff/officers present. Null if not mentioned.",
      nullable: true,
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of issues observed: blurry image, cut-off rows, ambiguous dates (e.g. 03/04/26), missing PHC ID, low contrast, torn register.",
    },
  },
  required: ["phc_id", "report_date", "stock", "beds_available", "staff_present", "warnings"],
};

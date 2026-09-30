import { ParseResult } from "@/types/parser";

export interface PresetSample {
  id: string;
  title: string;
  state: string;
  language: string;
  sourceType: 'photo_register' | 'voice_note' | 'messy_text';
  description: string;
  rawInputText: string;
  imagePromptDescription?: string;
  sampleSvgCanvas?: string;
  audioTranscript?: string;
  precomputedParseResult: ParseResult;
}

export const STATE_NODE_PRESETS: PresetSample[] = [
  {
    id: "sample_rampur_voice_ledger",
    title: "Madhya Pradesh: PHC Rampur (User Test Input)",
    state: "Madhya Pradesh",
    language: "Hindi",
    sourceType: "voice_note",
    description: "Voice-note dispatch and handwritten log: 'Namaste, PHC Rampur, aaj paracetamol paanch sau goli bachi hain, ORS ke bees packet, do bed khaali hain, teen staff aaye hain.'",
    rawInputText: `[Voice-Note Transcript + Register Log]
"Namaste, PHC Rampur, aaj paracetamol paanch sau goli bachi hain, ORS ke bees packet, do bed khaali hain, teen staff aaye hain."

Facility ID: PHC-MP-001 (PHC Rampur)
Date: 2026-09-29 (aaj / today)
1. Paracetamol (paanch sau goli bachi hain)
2. ORS (bees packet)
3. Available Beds: do bed khaali hain
4. Staff on Duty: teen staff aaye hain`,
    precomputedParseResult: {
      phc_id: "PHC-MP-001",
      report_date: "2026-09-29",
      stock: [
        {
          medicine: "Paracetamol 500mg tab",
          quantity: 500,
          unit: "tablets",
          expiry_date: null,
          raw_text: "paracetamol paanch sau goli bachi hain",
          confidence: 0.96,
          needs_review: false,
        },
        {
          medicine: "Oral Rehydration Salts sachet",
          quantity: 20,
          unit: "packs",
          expiry_date: null,
          raw_text: "ORS ke bees packet",
          confidence: 0.95,
          needs_review: false,
        },
      ],
      beds_available: 2,
      staff_present: 3,
      warnings: [
        "Expiry dates for Paracetamol and ORS were not stated in the voice dispatch. Assigned null without guessing per Rule 1.",
      ],
    },
  },
  {
    id: "sample_india_phc",
    title: "Maharashtra: PHC Satara Rural Logbook",
    state: "Maharashtra",
    language: "Hindi & English",
    sourceType: "photo_register",
    description: "Handwritten daily stock ledger with mixed Hindi/English text, ambiguous date (03/04/26), and a confidential patient OPD slip entry that must be stripped.",
    rawInputText: `PHC-MH-204 | प्राथमिक स्वास्थ्य केंद्र सातारा
तारीख: 03/04/26 (Report Date)
१. Paracetamol 500 tab (पैरासिटामोल) - 120 strips, exp: 2027-08-31
२. Amoxicillin 250mg vial - 45 vials, exp: 03/04/26
३. ORS oral rehydration sachet - 350 sachets, exp: 2028-01-15
४. Inj. Dextrose 5% 500ml - 18 bottles, exp: unreadable blur
५. Co-trimoxazole suspension 50ml - 22 bottles, exp: 2026-11-30
[CONFIDENTIAL OPD NOTE: Token #42 Patient Ramesh Kumar, fever & cough, prescribe paracetamol]
Available Beds: 4 general beds vacant
Duty Staff Present: 3 (Dr. Kulkarni MO, Staff Nurse Sunita, Pharmacist Patil)`,
    precomputedParseResult: {
      phc_id: "PHC-MH-204",
      report_date: "2026-04-03",
      stock: [
        {
          medicine: "Paracetamol 500mg tab",
          quantity: 120,
          unit: "strips",
          expiry_date: "2027-08-31",
          raw_text: "Paracetamol 500 tab (पैरासिटामोल) - 120 strips, exp: 2027-08-31",
          confidence: 0.95,
          needs_review: false,
        },
        {
          medicine: "Amoxicillin 250mg vial",
          quantity: 45,
          unit: "vials",
          expiry_date: "2026-04-03",
          raw_text: "Amoxicillin 250mg vial - 45 vials, exp: 03/04/26",
          confidence: 0.72,
          needs_review: true,
          review_reason: "Ambiguous date format (03/04/26): interpreted as 2026-04-03, verify if March 4 or April 3.",
        },
        {
          medicine: "Oral Rehydration Salts 20.5g sachet",
          quantity: 350,
          unit: "packs",
          expiry_date: "2028-01-15",
          raw_text: "ORS oral rehydration sachet - 350 sachets, exp: 2028-01-15",
          confidence: 0.96,
          needs_review: false,
        },
        {
          medicine: "Dextrose 5% IV infusion 500ml",
          quantity: 18,
          unit: "bottles",
          expiry_date: null,
          raw_text: "Inj. Dextrose 5% 500ml - 18 bottles, exp: unreadable blur",
          confidence: 0.65,
          needs_review: true,
          review_reason: "Unreadable/blurred expiry date field.",
        },
        {
          medicine: "Co-trimoxazole 240mg/5ml suspension",
          quantity: 22,
          unit: "bottles",
          expiry_date: "2026-11-30",
          raw_text: "Co-trimoxazole suspension 50ml - 22 bottles, exp: 2026-11-30",
          confidence: 0.91,
          needs_review: false,
        },
      ],
      beds_available: 4,
      staff_present: 3,
      warnings: [
        "Ambiguous date '03/04/26' detected for Amoxicillin and Report Date. Set needs_review=true.",
        "Row 4 expiry date blurred/unreadable. Set to null and marked for human verification.",
        "Patient-level details detected in input ('Patient Ramesh Kumar OPD #42') and automatically stripped per Privacy Rule 7.",
      ],
    },
  },
  {
    id: "sample_kerala_phc",
    title: "Kerala: PHC Wayanad Rural Clinic",
    state: "Kerala",
    language: "Malayalam & English",
    sourceType: "photo_register",
    description: "Primary Health Centre inventory ledger with cold-chain insulin, metformin stock for chronic disease load, and observation bed tracking.",
    rawInputText: `PHC-KL-WYN-012 | Wayanad Community Health Centre
Report Date: 2026-09-28
Active Pharmaceutical Stock:
- Metformin 500mg tab: 320 strips, expiry: 2027-10-15
- Amoxicillin 250mg/5ml suspension: 35 bottles, expiry: 2026-12-20
- Insulin human NPH 10ml vial (Cold Chain 2°C to 8°C): 60 vials, expiry: 2027-02-28
- ORS oral rehydration sachet: 180 packets, expiry: 2028-05-10
- Paracetamol syrup 200mg/ml: 40 bottles, expiry: 2027-06-30
Observation Beds Available: 2 free beds of 6 total
Duty Staff Present: 4 (1 Medical Officer, 2 Staff Nurses, 1 Pharmacist)`,
    precomputedParseResult: {
      phc_id: "PHC-KL-WYN-012",
      report_date: "2026-09-28",
      stock: [
        {
          medicine: "Metformin 500mg tab",
          quantity: 320,
          unit: "strips",
          expiry_date: "2027-10-15",
          raw_text: "Metformin 500mg tab: 320 strips, expiry: 2027-10-15",
          confidence: 0.97,
          needs_review: false,
        },
        {
          medicine: "Amoxicillin 250mg/5ml suspension",
          quantity: 35,
          unit: "bottles",
          expiry_date: "2026-12-20",
          raw_text: "Amoxicillin 250mg/5ml suspension: 35 bottles, expiry: 2026-12-20",
          confidence: 0.94,
          needs_review: false,
        },
        {
          medicine: "Insulin Human NPH 10ml vial",
          quantity: 60,
          unit: "vials",
          expiry_date: "2027-02-28",
          raw_text: "Insulin human NPH 10ml vial (Cold Chain 2°C to 8°C): 60 vials, expiry: 2027-02-28",
          confidence: 0.96,
          needs_review: false,
        },
        {
          medicine: "Oral Rehydration Salts sachet",
          quantity: 180,
          unit: "packs",
          expiry_date: "2028-05-10",
          raw_text: "ORS oral rehydration sachet: 180 packets, expiry: 2028-05-10",
          confidence: 0.95,
          needs_review: false,
        },
        {
          medicine: "Paracetamol 200mg/ml oral syrup",
          quantity: 40,
          unit: "bottles",
          expiry_date: "2027-06-30",
          raw_text: "Paracetamol syrup 200mg/ml: 40 bottles, expiry: 2027-06-30",
          confidence: 0.93,
          needs_review: false,
        },
      ],
      beds_available: 2,
      staff_present: 4,
      warnings: [
        "Cold chain protocol verified for Insulin Human NPH vials.",
      ],
    },
  },
  {
    id: "sample_assam_clinic",
    title: "Assam: Cachar Rural State Dispensary",
    state: "Assam",
    language: "Assamese & English",
    sourceType: "voice_note",
    description: "Voice-note dispatch reporting flood-season vector and snakebite supplies, anti-snake venom cold-chain stock, and urgent oral rehydration levels.",
    rawInputText: `[VOICE TRANSCRIPT - Dr. Borah, Cachar Rural Dispensary PHC-AS-CC-089]
"Namaskar, this is Dr. Borah reporting from Cachar Rural PHC in Assam on 29 September 2026.
Stock count for today:
Anti-snake venom (ASV) vials stored in cold-chain: only 12 vials left, expiry 2026-11-15. We are critically low due to flood season snakebite surges.
Artemether Lumefantrine malaria packs: 90 packs, expiry 2027-05-20.
Paracetamol 500mg tablets: 450 packs, expiry 2027-12-31.
Amoxicillin 500mg capsules: 70 strips, expiry 2027-04-10.
ORS hydration packets: 220 sachets, expiry 2028-03-30.
Beds available: 5 general beds free.
Staff on duty: 5 nurses and 2 medical officers present today.
Dhanyabad."`,
    precomputedParseResult: {
      phc_id: "PHC-AS-CC-089",
      report_date: "2026-09-29",
      stock: [
        {
          medicine: "Anti-snake venom vial",
          quantity: 12,
          unit: "vials",
          expiry_date: "2026-11-15",
          raw_text: "Anti-snake venom (ASV) vials stored in cold-chain: only 12 vials left, expiry 2026-11-15",
          confidence: 0.94,
          needs_review: false,
        },
        {
          medicine: "Artemether + Lumefantrine 20mg/120mg tab",
          quantity: 90,
          unit: "packs",
          expiry_date: "2027-05-20",
          raw_text: "Artemether Lumefantrine malaria packs: 90 packs, expiry 2027-05-20",
          confidence: 0.95,
          needs_review: false,
        },
        {
          medicine: "Paracetamol 500mg tab",
          quantity: 450,
          unit: "packs",
          expiry_date: "2027-12-31",
          raw_text: "Paracetamol 500mg tablets: 450 packs, expiry 2027-12-31",
          confidence: 0.98,
          needs_review: false,
        },
        {
          medicine: "Amoxicillin 500mg cap",
          quantity: 70,
          unit: "strips",
          expiry_date: "2027-04-10",
          raw_text: "Amoxicillin 500mg capsules: 70 strips, expiry 2027-04-10",
          confidence: 0.92,
          needs_review: false,
        },
        {
          medicine: "Oral Rehydration Salts sachet",
          quantity: 220,
          unit: "packs",
          expiry_date: "2028-03-30",
          raw_text: "ORS hydration packets: 220 sachets, expiry 2028-03-30",
          confidence: 0.97,
          needs_review: false,
        },
      ],
      beds_available: 5,
      staff_present: 7,
      warnings: [
        "Voice dispatch transcribed and parsed.",
        "Critical stock alert: Anti-snake venom cold-chain vials have < 5 days of cover during flood season.",
      ],
    },
  },
  {
    id: "sample_messy_sms",
    title: "Edge Case: Damaged Register & Missing ID",
    state: "Madhya Pradesh",
    language: "English",
    sourceType: "messy_text",
    description: "Torn paper ledger with blurry handwriting, missing PHC identifier, conflicting digits, and ambiguous date formatting (11/12/26).",
    rawInputText: `[Ledger header torn off - no facility code visible]
Log recorded: 11/12/26
1. Paracetamol 500: ~15 or 75?? strips (ink smudge), exp 11/12/26
2. Ciprofloxacin 500mg tab: 200 tabs, exp 2027-09-15
3. Ceftriaxone 1g vial: 8 vials (cut off on right margin...)
4. ORS powder: boxes stacked in corner, count omitted
5. Beds: 1 available? 3 occupied?
6. Sister Anita on duty`,
    precomputedParseResult: {
      phc_id: null,
      report_date: null,
      stock: [
        {
          medicine: "Paracetamol 500mg tab",
          quantity: null,
          unit: "strips",
          expiry_date: "2026-11-12",
          raw_text: "Paracetamol 500: ~15 or 75?? strips (ink smudge), exp 11/12/26",
          confidence: 0.38,
          needs_review: true,
          review_reason: "Conflicting quantity (15 vs 75 due to ink smudge). Value set to null per Rule 1.",
        },
        {
          medicine: "Ciprofloxacin 500mg tab",
          quantity: 200,
          unit: "tablets",
          expiry_date: "2027-09-15",
          raw_text: "Ciprofloxacin 500mg tab: 200 tabs, exp 2027-09-15",
          confidence: 0.92,
          needs_review: false,
        },
        {
          medicine: "Ceftriaxone 1g vial",
          quantity: 8,
          unit: "vials",
          expiry_date: null,
          raw_text: "Ceftriaxone 1g vial: 8 vials (cut off on right margin...)",
          confidence: 0.74,
          needs_review: true,
          review_reason: "Right margin cut off; expiry date missing or clipped.",
        },
        {
          medicine: "Oral Rehydration Salts sachet",
          quantity: null,
          unit: "packs",
          expiry_date: null,
          raw_text: "ORS powder: boxes stacked in corner, count omitted",
          confidence: 0.45,
          needs_review: true,
          review_reason: "Quantity not stated. Set to null per Rule 1.",
        },
      ],
      beds_available: null,
      staff_present: 1,
      warnings: [
        "PHC ID missing or not visible in input. Assigned null.",
        "Report date '11/12/26' is ambiguous (could be 2026-11-12 or 2026-12-11). Assigned null and marked for review.",
        "Ink smudge on Paracetamol row 1; quantity numbers conflict (~15 vs 75).",
        "Row 3 cut off on right margin.",
        "Row 4 ORS count omitted; set to null without guessing.",
      ],
    },
  },
];

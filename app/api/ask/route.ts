import { NextRequest, NextResponse } from "next/server";
import { AskQuestionParams, AskQuestionResponse } from "@/types/supply-chain";
import { INITIAL_SNAPSHOT_RECORDS, PHC_MASTERS } from "@/lib/mock-database";

export async function POST(req: NextRequest) {
  try {
    const body: AskQuestionParams = await req.json();
    const { question, role, scope, language, scenario } = body;

    const q = (question || "").toLowerCase().trim();

    // 1. Check for unanswerable questions (e.g. historical retrospective queries, patient personal info, missing database fields)
    if (
      q.includes("last year") ||
      q.includes("malaria last year") ||
      q.includes("patient name") ||
      q.includes("phone number") ||
      q.includes("budget for 2024") ||
      q.includes("past decade")
    ) {
      const unanswerableResponse: AskQuestionResponse = {
        answer_summary: "Not enough data in current public health inventory registry to answer historical epidemiological trends.",
        affected_phcs: [],
        suggested_next_action: null,
        confidence: "Low",
        confidence_note: "Historical retrospective disease registries are not part of the active supply chain snapshot.",
        data_sources_used: ["National Health Supply Snapshot 2026-09-30 (real-time telemetry only)"],
        not_enough_data: true,
        missing_data_reason: "Historical retrospective patient records from previous calendar years are not stored in the live stockout prediction ledger.",
      };
      return NextResponse.json(unanswerableResponse);
    }

    // 2. Role Clearance & Scope Verification
    // PHC Staff: Only allowed to query their own facility (PHC Rampur / PHC-MP-001)
    if (role === "phc_staff") {
      const isAboutOtherPhcs =
        q.includes("dhemaji") ||
        q.includes("kerala") ||
        q.includes("all district") ||
        q.includes("other phc") ||
        q.includes("pune") ||
        q.includes("wayanad");

      if (isAboutOtherPhcs) {
        const outOfScopeResponse: AskQuestionResponse = {
          answer_summary: "Access restricted: As PHC Staff, you have authorization to query inventory and staffing for PHC Rampur (Dewas) only.",
          affected_phcs: [],
          suggested_next_action: null,
          confidence: "High",
          confidence_note: "Role-based access control (RBAC) enforced in compliance with Public Health Data Sovereignty protocols.",
          data_sources_used: ["Role-Based Clearance Protocol (PHC Level)"],
          out_of_scope: true,
          scope_explanation: "To inspect multi-facility district allocations or cross-district forecasts, switch role to District Health Officer or State Officer in the top bar.",
        };
        return NextResponse.json(outOfScopeResponse);
      }
    }

    // District Officer: Scoped to their district (Dewas / Madhya Pradesh)
    if (role === "district_officer") {
      const isOutOfState = q.includes("dhemaji") || q.includes("assam") || q.includes("wayanad") || q.includes("kerala") || q.includes("pune");
      if (isOutOfState && !q.includes("dewas") && !q.includes("indore")) {
        const outOfScopeResponse: AskQuestionResponse = {
          answer_summary: "Access restricted: As District Health Officer (Dewas), your authorized scope is facilities within Dewas and adjoining supply hubs.",
          affected_phcs: [],
          suggested_next_action: null,
          confidence: "High",
          confidence_note: "District-level jurisdiction barrier applied.",
          data_sources_used: ["District Administrative Boundary Policy"],
          out_of_scope: true,
          scope_explanation: "For state-wide or multi-state network visibility, switch to 'State / National Officer' in the top bar.",
        };
        return NextResponse.json(outOfScopeResponse);
      }
    }

    // 3. Keyword Matchers against Mock Snapshot
    // Query A: Paracetamol ("Which districts will run out of paracetamol next week?", "paracetamol")
    if (q.includes("paracetamol") || q.includes("fever") || q.includes("antipyretic")) {
      const records = INITIAL_SNAPSHOT_RECORDS.filter(
        (r) => r.medicine.toLowerCase().includes("paracetamol") && r.days_of_cover <= 7.0
      ).sort((a, b) => a.days_of_cover - b.days_of_cover);

      const affected = records.map((r) => ({
        phc_id: r.phc_id,
        phc_name: r.phc_name,
        district: r.district,
        medicine: r.medicine,
        days_of_cover: scenario ? Math.max(1.0, +(r.days_of_cover * 0.6).toFixed(1)) : r.days_of_cover,
        risk_level: r.days_of_cover <= 3.0 ? ("Critical" as const) : ("High" as const),
      }));

      const summary = scenario
        ? "Dewas and Ujjain face acute Paracetamol stockouts within 1.5 to 3.5 days under the active +40% fever outbreak surge."
        : "Dewas, Ujjain, and Nandurbar districts are projected to exhaust Paracetamol 500mg within 2.5 to 4.2 days.";

      const response: AskQuestionResponse = {
        answer_summary: summary,
        affected_phcs: affected.slice(0, 5),
        suggested_next_action: "Open redistribution plan",
        confidence: "High",
        confidence_note: "Grounded in 24-hour PHC stock register sync and 7-day moving consumption burn rate.",
        data_sources_used: [
          "Daily Facility Stock Registers (2026-09-30)",
          "7-Day Moving Burn Rate Regression",
          "District Warehouse Surplus Balances (FEFO)",
        ],
      };
      return NextResponse.json(response);
    }

    // Query B: Insulin ("Where is insulin low?", "insulin")
    if (q.includes("insulin") || q.includes("diabetes") || q.includes("cold chain")) {
      const records = INITIAL_SNAPSHOT_RECORDS.filter(
        (r) => r.medicine.toLowerCase().includes("insulin") && r.days_of_cover <= 8.0
      ).sort((a, b) => a.days_of_cover - b.days_of_cover);

      const affected = records.map((r) => ({
        phc_id: r.phc_id,
        phc_name: r.phc_name,
        district: r.district,
        medicine: r.medicine,
        days_of_cover: r.days_of_cover,
        risk_level: r.days_of_cover <= 3.0 ? ("Critical" as const) : ("High" as const),
      }));

      const response: AskQuestionResponse = {
        answer_summary: "Insulin Human NPH is critically depleted at PHC Meppadi in Wayanad (2.5 days cover) and PHC Dhadgaon in Nandurbar (3.0 days cover).",
        affected_phcs: affected.length > 0 ? affected : [
          {
            phc_id: "PHC-KL-001",
            phc_name: "PHC Meppadi",
            district: "Wayanad",
            medicine: "Insulin Human NPH 10ml",
            days_of_cover: 2.5,
            risk_level: "Critical",
          },
          {
            phc_id: "PHC-MH-003",
            phc_name: "PHC Dhadgaon",
            district: "Nandurbar",
            medicine: "Insulin Human NPH 10ml",
            days_of_cover: 3.0,
            risk_level: "Critical",
          },
        ],
        suggested_next_action: "Open redistribution plan",
        confidence: "High",
        confidence_note: "Verified via cold-chain temperature telemetry (2°C–8°C compliance intact).",
        data_sources_used: [
          "District Cold Chain Equipment (ILR) Telemetry",
          "Chronic Disease NCD Patient Register",
        ],
      };
      return NextResponse.json(response);
    }

    // Query C: What should I move to Dhemaji? / Move stock
    if (q.includes("dhemaji") || q.includes("move") || q.includes("transfer") || q.includes("silapathar") || q.includes("anti-snake")) {
      const response: AskQuestionResponse = {
        answer_summary: "Recommend generating an emergency redistribution plan to route 20 vials of Anti-snake venom from PHC Hajo (Kamrup) to PHC Silapathar (Dhemaji). No physical transfer has been executed.",
        affected_phcs: [
          {
            phc_id: "PHC-AS-005",
            phc_name: "PHC Silapathar",
            district: "Dhemaji",
            medicine: "Anti-snake venom vial",
            days_of_cover: 1.7,
            risk_level: "Critical",
          },
          {
            phc_id: "PHC-AS-001",
            phc_name: "PHC Hajo (Surplus Depot)",
            district: "Kamrup",
            medicine: "Anti-snake venom vial",
            days_of_cover: 42.5,
            risk_level: "Low",
          },
        ],
        suggested_next_action: "Open redistribution plan",
        confidence: "High",
        confidence_note: "Route validated via State GIS Road Matrix (74 km flood-safe transit corridor).",
        data_sources_used: [
          "Brahmaputra Flood Risk Alert Model",
          "Kamrup District Central Vaccine & Serum Depot",
          "Facility Consumption Forecast Engine",
        ],
      };
      return NextResponse.json(response);
    }

    // Query D: Staff shortage ("Which PHCs are short of staff?", "staff", "attendance")
    if (q.includes("staff") || q.includes("doctor") || q.includes("nurse") || q.includes("attendance")) {
      const response: AskQuestionResponse = {
        answer_summary: "PHC Silapathar in Dhemaji and PHC Dhadgaon in Nandurbar report severe staffing deficits with only 33% sanctioned personnel present on duty.",
        affected_phcs: [
          {
            phc_id: "PHC-AS-005",
            phc_name: "PHC Silapathar",
            district: "Dhemaji",
            medicine: "Duty Staff Sanction",
            days_of_cover: 2.0,
            risk_level: "Critical",
          },
          {
            phc_id: "PHC-MH-003",
            phc_name: "PHC Dhadgaon",
            district: "Nandurbar",
            medicine: "Duty Staff Sanction",
            days_of_cover: 2.0,
            risk_level: "High",
          },
          {
            phc_id: "PHC-MP-001",
            phc_name: "PHC Rampur",
            district: "Dewas",
            medicine: "Duty Staff Sanction",
            days_of_cover: 3.0,
            risk_level: "Medium",
          },
        ],
        suggested_next_action: "Draft alert",
        confidence: "High",
        confidence_note: "Synchronized with daily morning biometric & attendance rosters as of 08:00 AM.",
        data_sources_used: [
          "National Health Mission Staff Attendance Roster",
          "District Human Resource Allocation Register",
        ],
      };
      return NextResponse.json(response);
    }

    // Generic Fallback: Grounded in lowest days of cover from current snapshot
    const sortedCritical = [...INITIAL_SNAPSHOT_RECORDS]
      .sort((a, b) => a.days_of_cover - b.days_of_cover)
      .slice(0, 4);

    const fallbackResponse: AskQuestionResponse = {
      answer_summary: `Across reporting health centres, ${sortedCritical[0].medicine} at ${sortedCritical[0].phc_name} (${sortedCritical[0].district}) requires immediate attention with only ${sortedCritical[0].days_of_cover} days of cover remaining.`,
      affected_phcs: sortedCritical.map((r) => ({
        phc_id: r.phc_id,
        phc_name: r.phc_name,
        district: r.district,
        medicine: r.medicine,
        days_of_cover: r.days_of_cover,
        risk_level: r.days_of_cover <= 3.0 ? ("Critical" as const) : ("High" as const),
      })),
      suggested_next_action: "Open redistribution plan",
      confidence: "Medium",
      confidence_note: "Grounded in latest multi-facility stock snapshot.",
      data_sources_used: [
        "Primary Health Centre Inventory Snapshot 2026-09-30",
        "National Health Mission Standard Formularies",
      ],
    };

    return NextResponse.json(fallbackResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process conversational query" },
      { status: 500 }
    );
  }
}

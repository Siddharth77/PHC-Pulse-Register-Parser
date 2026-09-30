import { NextRequest, NextResponse } from "next/server";
import { StockReportSubmitPayload, StockReportSubmitResponse } from "@/types/supply-chain";
import { INITIAL_SNAPSHOT_RECORDS, PHC_MASTERS } from "@/lib/mock-database";

export async function POST(req: NextRequest) {
  try {
    const body: StockReportSubmitPayload = await req.json();
    const { phc_id, confirmed_rows, beds_available, staff_present, timestamp, idempotency_key } = body;

    if (!phc_id || !confirmed_rows || !Array.isArray(confirmed_rows)) {
      return NextResponse.json(
        { error: "Invalid payload: phc_id and confirmed_rows are required." },
        { status: 400 }
      );
    }

    const phc = PHC_MASTERS.find((p) => p.phc_id === phc_id);
    const phcName = phc?.phc_name || "PHC Facility";
    const phcDistrict = phc?.district || "Dewas";
    const phcState = phc?.state || "Madhya Pradesh";

    // Update the live in-memory mock records for this PHC
    confirmed_rows.forEach((row) => {
      if (!row.medicine || row.quantity === null || row.quantity === undefined) return;

      const existingRecordIndex = INITIAL_SNAPSHOT_RECORDS.findIndex(
        (r) => r.phc_id === phc_id && r.medicine.toLowerCase() === row.medicine.toLowerCase()
      );

      const dailyDemand = existingRecordIndex >= 0 ? INITIAL_SNAPSHOT_RECORDS[existingRecordIndex].daily_demand : 15;
      const daysOfCover = +(row.quantity / Math.max(1, dailyDemand)).toFixed(1);

      let riskLevel: "Critical" | "High" | "Medium" | "Low" = "Low";
      if (daysOfCover <= 3.0) riskLevel = "Critical";
      else if (daysOfCover <= 7.0) riskLevel = "High";
      else if (daysOfCover <= 14.0) riskLevel = "Medium";

      if (existingRecordIndex >= 0) {
        INITIAL_SNAPSHOT_RECORDS[existingRecordIndex] = {
          ...INITIAL_SNAPSHOT_RECORDS[existingRecordIndex],
          stock: row.quantity,
          unit: row.unit || INITIAL_SNAPSHOT_RECORDS[existingRecordIndex].unit,
          nearest_expiry: row.expiry_date || INITIAL_SNAPSHOT_RECORDS[existingRecordIndex].nearest_expiry,
          days_of_cover: daysOfCover,
          risk_level: riskLevel,
          beds_available: typeof beds_available === "number" ? beds_available : INITIAL_SNAPSHOT_RECORDS[existingRecordIndex].beds_available,
          staff_present: typeof staff_present === "number" ? staff_present : INITIAL_SNAPSHOT_RECORDS[existingRecordIndex].staff_present,
          reporting_status: 'reported_today',
          last_updated: 'Just now',
        };
      } else {
        // Create new medicine record for this PHC
        INITIAL_SNAPSHOT_RECORDS.unshift({
          phc_id,
          phc_name: phcName,
          state: phcState as any,
          district: phcDistrict,
          medicine: row.medicine,
          disease_class: "respiratory",
          stock: row.quantity,
          unit: row.unit || 'tablets',
          daily_demand: dailyDemand,
          days_of_cover: daysOfCover,
          risk_level: riskLevel,
          nearest_expiry: row.expiry_date || "2027-08-30",
          cold_chain: false,
          beds_available: typeof beds_available === "number" ? beds_available : 4,
          total_beds: 6,
          staff_present: typeof staff_present === "number" ? staff_present : 3,
          staff_sanctioned: 5,
          reporting_status: 'reported_today',
          last_updated: 'Just now',
        });
      }
    });

    const reportId = `REP-${Date.now().toString().slice(-6)}`;

    const response: StockReportSubmitResponse = {
      status: "success",
      report_id: reportId,
      message: `Stock update with ${confirmed_rows.length} records verified and synced for ${phcName}.`,
      timestamp: timestamp || new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process stock submission" },
      { status: 500 }
    );
  }
}

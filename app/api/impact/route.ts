import { NextRequest, NextResponse } from "next/server";
import { ImpactMetricsResponse } from "@/types/supply-chain";

const IMPACT_DATA: Record<string, ImpactMetricsResponse> = {
  All: {
    period: "Simulated 90-day seasonal surge window",
    is_simulation: true,
    methodology_note:
      "Calculated across synthetic facility registers in 4 state nodes comparing unassisted static procurement against real-time federated optimization and redistribution.",
    metrics: {
      stockout_days_per_100_pairs: {
        without: 42.6,
        with: 8.4,
        note: "Total days where medicine inventory was zero per 100 PHC-medicine pairs across all districts.",
      },
      expired_stock_avoided_inr: {
        without: 1420000,
        with: 210000,
        note: "Illustrative estimated cost of medicines saved from expiry via timely inter-district surplus redistribution.",
      },
      patient_trips_saved: {
        value: 18450,
        note: "Estimated outpatient visits where prescribed medicines were in stock on the patient's first arrival.",
      },
      hours_warning_to_transfer: {
        without: 168.0,
        with: 28.5,
        note: "Average latency from deficit emergence to district health officer transfer order approval.",
      },
      critical_stockouts_in_outbreak: {
        without: 38,
        with: 5,
        note: "Emergency zero-stock occurrences during the simulated 2.5x flood/fever outbreak surge.",
      },
    },
    by_state: [
      { state: "Assam", stockout_days_without: 48.2, stockout_days_with: 9.1 },
      { state: "Kerala", stockout_days_without: 36.4, stockout_days_with: 6.8 },
      { state: "Maharashtra", stockout_days_without: 41.5, stockout_days_with: 8.5 },
      { state: "Madhya Pradesh", stockout_days_without: 44.3, stockout_days_with: 9.2 },
    ],
    story_steps: [
      {
        title: "1. The Surge Starts",
        text: "Early monsoon floods in Dewas district double daily fever presentations. Paracetamol and ORS consumption jumps from 15 to 42 packs per day.",
      },
      {
        title: "2. Early Warning Appears",
        text: "PHC Pulse detects days-of-cover dropping below 3.0 days and raises an automated Critical Stock-Out Alert 11 days before physical exhaustion.",
      },
      {
        title: "3. Transfer is Approved",
        text: "The redistribution optimizer identifies a 65-day surplus in neighboring Ujjain district. The District Health Officer approves the transfer order in one click.",
      },
      {
        title: "4. The Shelf Stays Stocked",
        text: "Emergency stock arrives at PHC Rampur 36 hours later. Outpatient stockouts are completely avoided, and all 350 attending villagers receive treatment.",
      },
    ],
    who_benefits: {
      patients:
        "Receive vital antibiotics, ORS, and antivenom on their first visit without costly multi-kilometer journeys to district civil hospitals.",
      staff:
        "Eliminates manual paper register tallying and panic emergency requisitioning with instant phone-based camera reporting.",
      officers:
        "Gain proactive multi-district supply chain visibility, catching stockout risks 10–14 days in advance with pre-calculated transfer orders.",
    },
  },
  "Madhya Pradesh": {
    period: "Simulated 90-day seasonal surge window (Madhya Pradesh)",
    is_simulation: true,
    methodology_note:
      "Telemetry across 4 PHC facilities in Dewas, Ujjain, Indore, and Dhar tribal districts.",
    metrics: {
      stockout_days_per_100_pairs: {
        without: 44.3,
        with: 9.2,
        note: "Days where medicine inventory was zero per 100 PHC-medicine pairs in MP districts.",
      },
      expired_stock_avoided_inr: {
        without: 480000,
        with: 65000,
        note: "Illustrative value of medicines saved from expiry via Dewas-Ujjain redistribution.",
      },
      patient_trips_saved: {
        value: 5200,
        note: "Estimated outpatient visits where tribal villagers received medication without referral.",
      },
      hours_warning_to_transfer: {
        without: 172.0,
        with: 26.0,
        note: "Average latency from deficit detection to district officer approval in MP.",
      },
      critical_stockouts_in_outbreak: {
        without: 12,
        with: 1,
        note: "Critical stockouts during simulated vector-borne outbreak in Dewas.",
      },
    },
    by_state: [
      { state: "Madhya Pradesh", stockout_days_without: 44.3, stockout_days_with: 9.2 },
    ],
    story_steps: [
      {
        title: "1. The Surge Starts",
        text: "Seasonal malaria uptick in Dewas rural belt doubles paracetamol and artemisinin demand.",
      },
      {
        title: "2. Early Warning Appears",
        text: "PHC Pulse flags 2.1 days of cover at PHC Rampur and issues automated high-priority alert.",
      },
      {
        title: "3. Transfer is Approved",
        text: "District officer routes 1,400 surplus tablets from Ujjain Civil Dispensary.",
      },
      {
        title: "4. The Shelf Stays Stocked",
        text: "Stock arrives next morning; tribal patients receive malaria treatment immediately.",
      },
    ],
    who_benefits: {
      patients: "Tribal outpatients receive fever medications locally without traveling 35 km to Indore.",
      staff: "ANM nurses log stock in 30 seconds via mobile register photo.",
      officers: "District Health Officer monitors Dewas-Ujjain balance on a unified dashboard.",
    },
  },
  Maharashtra: {
    period: "Simulated 90-day seasonal surge window (Maharashtra)",
    is_simulation: true,
    methodology_note: "Telemetry across 4 PHC facilities in Pune, Nashik, and Satara districts.",
    metrics: {
      stockout_days_per_100_pairs: {
        without: 41.5,
        with: 8.5,
        note: "Days where medicine inventory was zero per 100 PHC-medicine pairs in Maharashtra.",
      },
      expired_stock_avoided_inr: {
        without: 390000,
        with: 52000,
        note: "Illustrative value of insulin and NCD drugs saved from batch expiry in Western Ghats PHCs.",
      },
      patient_trips_saved: {
        value: 4800,
        note: "Estimated outpatient visits where chronic diabetic patients received insulin without stock-outs.",
      },
      hours_warning_to_transfer: {
        without: 160.0,
        with: 24.0,
        note: "Average latency from warning to transfer approval in Pune district.",
      },
      critical_stockouts_in_outbreak: {
        without: 9,
        with: 1,
        note: "Critical stockouts during simulated diarrhoeal spike in Junnar.",
      },
    },
    by_state: [
      { state: "Maharashtra", stockout_days_without: 41.5, stockout_days_with: 8.5 },
    ],
    story_steps: [
      {
        title: "1. The Surge Starts",
        text: "Gastroenteritis surge in Junnar taluka creates sudden demand for ORS and zinc sachets.",
      },
      {
        title: "2. Early Warning Appears",
        text: "System detects 3.4 days of cover remaining and drafts early transfer recommendation.",
      },
      {
        title: "3. Transfer is Approved",
        text: "Chief Medical Officer in Pune approves 800 ORS packs from Baramati hub.",
      },
      {
        title: "4. The Shelf Stays Stocked",
        text: "Pediatric dehydration cases are treated on site without hospital admissions.",
      },
    ],
    who_benefits: {
      patients: "Rural farming families receive immediate ORS and pediatric antibiotics.",
      staff: "Pharmacists avoid manual tally registers during high-intake monsoon hours.",
      officers: "State Health Directorate tracks rural-urban drug distribution balance.",
    },
  },
  Kerala: {
    period: "Simulated 90-day seasonal surge window (Kerala)",
    is_simulation: true,
    methodology_note: "Telemetry across 3 PHC facilities in Wayanad, Palakkad, and Ernakulam.",
    metrics: {
      stockout_days_per_100_pairs: {
        without: 36.4,
        with: 6.8,
        note: "Days where medicine inventory was zero per 100 PHC-medicine pairs in Kerala.",
      },
      expired_stock_avoided_inr: {
        without: 260000,
        with: 38000,
        note: "Illustrative value of anti-snake venom and insulin batches saved from expiry.",
      },
      patient_trips_saved: {
        value: 3900,
        note: "Estimated outpatient visits where highland plantation workers received urgent medication.",
      },
      hours_warning_to_transfer: {
        without: 144.0,
        with: 22.0,
        note: "Average latency from warning to cold-chain transfer in Wayanad.",
      },
      critical_stockouts_in_outbreak: {
        without: 7,
        with: 1,
        note: "Critical stockouts during early monsoon vector surge.",
      },
    },
    by_state: [
      { state: "Kerala", stockout_days_without: 36.4, stockout_days_with: 6.8 },
    ],
    story_steps: [
      {
        title: "1. The Surge Starts",
        text: "Early southwest monsoon in Wayanad causes vector-borne fever and snakebite emergency calls.",
      },
      {
        title: "2. Early Warning Appears",
        text: "Cold-chain monitor warns antivenom stock is at 2 vials against projected 6-day need.",
      },
      {
        title: "3. Transfer is Approved",
        text: "District officer triggers cold-box transfer of 10 vials from Kozhikode supply depot.",
      },
      {
        title: "4. The Shelf Stays Stocked",
        text: "Two plantation workers treated safely in under 40 minutes of snakebite presentation.",
      },
    ],
    who_benefits: {
      patients: "Highland plantation laborers receive antivenom locally within the critical golden hour.",
      staff: "Duty nurses verify temperature-controlled medicine stocks on mobile.",
      officers: "District Medical Officer manages real-time cold-chain routing across hill tracts.",
    },
  },
  Assam: {
    period: "Simulated 90-day seasonal surge window (Assam)",
    is_simulation: true,
    methodology_note: "Telemetry across 5 PHC facilities in Kamrup, Nagaon, and Majuli river island.",
    metrics: {
      stockout_days_per_100_pairs: {
        without: 48.2,
        with: 9.1,
        note: "Days where medicine inventory was zero per 100 PHC-medicine pairs across Brahmaputra basin.",
      },
      expired_stock_avoided_inr: {
        without: 290000,
        with: 55000,
        note: "Illustrative value of flood-prone riverine medicine stocks preserved from damage and expiry.",
      },
      patient_trips_saved: {
        value: 4550,
        note: "Estimated visits where flood-affected island residents received antibiotics without boat travel.",
      },
      hours_warning_to_transfer: {
        without: 196.0,
        with: 32.0,
        note: "Average latency from flood warning to boat-dispatched transfer order.",
      },
      critical_stockouts_in_outbreak: {
        without: 10,
        with: 2,
        note: "Critical stockouts during Brahmaputra flood wave.",
      },
    },
    by_state: [
      { state: "Assam", stockout_days_without: 48.2, stockout_days_with: 9.1 },
    ],
    story_steps: [
      {
        title: "1. The Surge Starts",
        text: "Brahmaputra river swells, cutting off Majuli island road transport and doubling waterborne diarrhea cases.",
      },
      {
        title: "2. Early Warning Appears",
        text: "Federated model anticipates waterborne infection spike 12 days early based on prior Kerala flood curves.",
      },
      {
        title: "3. Transfer is Approved",
        text: "Preemptive boat dispatch of 2,000 ORS sachets and halogen tablets approved from Jorhat hub.",
      },
      {
        title: "4. The Shelf Stays Stocked",
        text: "River island clinic maintains full stock throughout 14 days of transport isolation.",
      },
    ],
    who_benefits: {
      patients: "River island communities receive life-saving rehydration without hazardous river crossings.",
      staff: "Island pharmacists log registers offline with automatic sync once cellular signal connects.",
      officers: "State Health Mission coordinates emergency riverine boat-depot distribution.",
    },
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stateParam = searchParams.get("state") || "All";

    const data = IMPACT_DATA[stateParam] || IMPACT_DATA["All"];
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load impact metrics" },
      { status: 500 }
    );
  }
}

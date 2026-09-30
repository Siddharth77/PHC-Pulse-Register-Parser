import { TransferPlanItem, PlanSummary, TransferActivityLog } from '@/types/supply-chain';
import { scenarioStore } from './scenario-state';
import fs from 'fs';
import path from 'path';

// Unit price reference for INR value calculation (illustrative)
const UNIT_VALUE_INR: Record<string, number> = {
  'Paracetamol 500mg tab': 1.5,
  'ORS sachet': 20.0,
  'Amoxicillin 500mg cap': 6.0,
  'Salbutamol inhaler': 180.0,
  'Metformin 500mg tab': 3.0,
  'Insulin Human NPH 10ml': 450.0,
  'Artemether + Lumefantrine 20/120 tab': 85.0,
  'Anti-snake venom vial': 1200.0,
  'Dextrose 5% 500ml IV': 45.0,
};

// Base initial transfer plans across the 4 state nodes
const BASE_TRANSFERS: TransferPlanItem[] = [
  // 1. Madhya Pradesh (Dewas - Indore)
  {
    id: 'TR-MP-001',
    state: 'Madhya Pradesh',
    from_id: 'PHC-MP-003',
    from_name: 'PHC Kanadia',
    from_district: 'Indore',
    from_type: 'PHC',
    from_lat: 22.7196,
    from_lon: 75.9242,
    to_id: 'PHC-MP-001',
    to_name: 'PHC Rampur',
    to_district: 'Dewas',
    to_lat: 22.9676,
    to_lon: 76.0534,
    medicine: 'Paracetamol 500mg tab',
    quantity: 1200,
    unit: 'tablets',
    road_distance_km: 42.0,
    urgency: 'Critical',
    one_line_reason: 'PHC Rampur drops below 2.5 days of cover during fever surge; PHC Kanadia holds 61 days with surplus batch expiring in 65 days.',
    watch_out_chips: ['Near Expiry (65d)', 'Ambient Transit', 'Source left with 53d cover'],
    from_days_before: 61.3,
    from_days_after: 53.3,
    to_days_before: 2.5,
    to_days_after: 8.5,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 6,
    estimated_value_inr: 1800,
    activity_logs: [
      {
        id: 'LOG-001',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Initial min-cost-flow allocation pairing Dewas deficit with Indore near-expiry surplus.',
      },
    ],
  },
  {
    id: 'TR-MP-002',
    state: 'Madhya Pradesh',
    from_id: 'PHC-MP-003',
    from_name: 'PHC Kanadia',
    from_district: 'Indore',
    from_type: 'PHC',
    from_lat: 22.7196,
    from_lon: 75.9242,
    to_id: 'PHC-MP-001',
    to_name: 'PHC Rampur',
    to_district: 'Dewas',
    to_lat: 22.9676,
    to_lon: 76.0534,
    medicine: 'ORS sachet',
    quantity: 300,
    unit: 'packs',
    road_distance_km: 42.0,
    urgency: 'Critical',
    one_line_reason: 'PHC Rampur has only 1.8 days of ORS left; PHC Kanadia has 2,800 packs expiring in Nov 2026.',
    watch_out_chips: ['Near Expiry (52d)', 'Moisture-proof packing', 'Source left with 62.5d buffer'],
    from_days_before: 70.0,
    from_days_after: 62.5,
    to_days_before: 1.8,
    to_days_after: 13.8,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 12,
    estimated_value_inr: 6000,
    activity_logs: [
      {
        id: 'LOG-002',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'FEFO priority transfer.',
      },
    ],
  },
  {
    id: 'TR-MP-003',
    state: 'Madhya Pradesh',
    from_id: 'PHC-MP-004',
    from_name: 'PHC Sanwer',
    from_district: 'Indore',
    from_type: 'PHC',
    from_lat: 22.9774,
    from_lon: 75.8282,
    to_id: 'PHC-MP-005',
    to_name: 'PHC Badnagar',
    to_district: 'Ujjain',
    to_lat: 23.0645,
    to_lon: 75.3814,
    medicine: 'ORS sachet',
    quantity: 150,
    unit: 'packs',
    road_distance_km: 38.0,
    urgency: 'High',
    one_line_reason: 'Badnagar has 5.0 days of cover remaining; Sanwer has sufficient 18-day buffer for redistribution.',
    watch_out_chips: ['Short Distance (38km)', 'Source left with 12d cover'],
    from_days_before: 18.0,
    from_days_after: 12.0,
    to_days_before: 5.0,
    to_days_after: 12.5,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 7,
    estimated_value_inr: 3000,
    activity_logs: [
      {
        id: 'LOG-003',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Inter-district routine buffer balancing.',
      },
    ],
  },

  // 2. Maharashtra (Pune - Satara)
  {
    id: 'TR-MH-001',
    state: 'Maharashtra',
    from_id: 'PHC-MH-002',
    from_name: 'PHC Junnar',
    from_district: 'Pune',
    from_type: 'PHC',
    from_lat: 19.2000,
    from_lon: 73.8800,
    to_id: 'PHC-MH-001',
    to_name: 'PHC Khed',
    to_district: 'Pune',
    to_lat: 18.8500,
    to_lon: 73.9100,
    medicine: 'Amoxicillin 500mg cap',
    quantity: 400,
    unit: 'capsules',
    road_distance_km: 46.5,
    urgency: 'Critical',
    one_line_reason: 'PHC Khed antibiotic stock at 3.1 days cover; PHC Junnar holds 1,800 caps with 60 days surplus.',
    watch_out_chips: ['Near Expiry (45d)', 'Same District Transfer', 'Source left with 46d cover'],
    from_days_before: 60.0,
    from_days_after: 46.6,
    to_days_before: 3.1,
    to_days_after: 12.0,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 9,
    estimated_value_inr: 2400,
    activity_logs: [
      {
        id: 'LOG-004',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Antibiotic surge protection.',
      },
    ],
  },
  {
    id: 'TR-MH-002',
    state: 'Maharashtra',
    from_id: 'PHC-MH-004',
    from_name: 'PHC Wai',
    from_district: 'Satara',
    from_type: 'PHC',
    from_lat: 17.9500,
    from_lon: 73.8900,
    to_id: 'PHC-MH-003',
    to_name: 'PHC Karad Rural',
    to_district: 'Satara',
    to_lat: 17.2889,
    to_lon: 74.2000,
    medicine: 'Paracetamol 500mg tab',
    quantity: 1500,
    unit: 'tablets',
    road_distance_km: 58.0,
    urgency: 'Critical',
    one_line_reason: 'Karad Rural down to 2.5 days of fever medication; Wai holds 3,500 surplus tablets (43.7 days buffer).',
    watch_out_chips: ['Direct Highway Route (NH-48)', 'Source left with 25d cover'],
    from_days_before: 43.7,
    from_days_after: 25.0,
    to_days_before: 2.5,
    to_days_after: 10.8,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 8,
    estimated_value_inr: 2250,
    activity_logs: [
      {
        id: 'LOG-005',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Satara district southern corridor balancing.',
      },
    ],
  },

  // 3. Kerala (Wayanad - TVM)
  {
    id: 'TR-KL-001',
    state: 'Kerala',
    from_id: 'PHC-KL-002',
    from_name: 'PHC Sultan Bathery',
    from_district: 'Wayanad',
    from_type: 'PHC',
    from_lat: 11.6600,
    from_lon: 76.2600,
    to_id: 'PHC-KL-001',
    to_name: 'PHC Meppadi',
    to_district: 'Wayanad',
    to_lat: 11.5500,
    to_lon: 76.1200,
    medicine: 'Insulin Human NPH 10ml',
    quantity: 40,
    unit: 'vials',
    road_distance_km: 26.5,
    urgency: 'Critical',
    one_line_reason: 'Meppadi down to 15 vials (2.5 days cover) with 48 registered diabetic patients; Sultan Bathery has 48 days surplus buffer.',
    watch_out_chips: ['Cold Chain Required (2°C–8°C)', 'Vaccine Carrier + Temp Logger', 'Short Distance (26.5km)'],
    from_days_before: 48.0,
    from_days_after: 40.0,
    to_days_before: 2.5,
    to_days_after: 9.1,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 7,
    estimated_value_inr: 18000,
    activity_logs: [
      {
        id: 'LOG-006',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Cold-chain priority redistribution with IoT temperature tracker requirement.',
      },
    ],
  },

  // 4. Assam (Kamrup - Dhemaji)
  {
    id: 'TR-AS-001',
    state: 'Assam',
    from_id: 'PHC-AS-001',
    from_name: 'PHC Hajo',
    from_district: 'Kamrup',
    from_type: 'PHC',
    from_lat: 26.2400,
    from_lon: 91.5300,
    to_id: 'PHC-AS-005',
    to_name: 'PHC Silapathar',
    to_district: 'Dhemaji',
    to_lat: 27.5900,
    to_lon: 94.7200,
    medicine: 'Anti-snake venom vial',
    quantity: 20,
    unit: 'vials',
    road_distance_km: 74.0,
    urgency: 'Critical',
    one_line_reason: 'Silapathar flood surge has 5 vials left (1.7d cover); Hajo holds 85 surplus vials in central cold depot.',
    watch_out_chips: ['Cold Box Required', 'Flood Corridor Route', 'Source left with 32.5d cover'],
    from_days_before: 42.5,
    from_days_after: 32.5,
    to_days_before: 1.7,
    to_days_after: 8.3,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 7,
    estimated_value_inr: 24000,
    activity_logs: [
      {
        id: 'LOG-007',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Emergency pre-flood anti-venom positioning.',
      },
    ],
  },
  {
    id: 'TR-AS-002',
    state: 'Assam',
    from_id: 'PHC-AS-004',
    from_name: 'PHC Dholai',
    from_district: 'Cachar',
    from_type: 'PHC',
    from_lat: 24.6000,
    from_lon: 92.8500,
    to_id: 'PHC-AS-003',
    to_name: 'PHC Lakhipur',
    to_district: 'Cachar',
    to_lat: 24.8000,
    to_lon: 93.0100,
    medicine: 'Artemether + Lumefantrine 20/120 tab',
    quantity: 300,
    unit: 'packs',
    road_distance_km: 34.0,
    urgency: 'Critical',
    one_line_reason: 'PHC Lakhipur has 3.0 days malaria treatment left; PHC Dholai holds 950 surplus packs expiring in Nov 2026.',
    watch_out_chips: ['Near Expiry (56d)', 'Vector Surge Response', 'Short Distance (34km)'],
    from_days_before: 63.3,
    from_days_after: 43.3,
    to_days_before: 3.0,
    to_days_after: 18.0,
    status: 'PENDING_APPROVAL',
    estimated_stockout_days_avoided: 15,
    estimated_value_inr: 25500,
    activity_logs: [
      {
        id: 'LOG-008',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Endemic malaria block stock-balancing.',
      },
    ],
  },
];

// In-memory mutable plan store
interface PlanState {
  planId: string;
  generatedAt: string;
  transfers: TransferPlanItem[];
  activityHistory: TransferActivityLog[];
}

const globalForPlan = globalThis as unknown as {
  planStore: PlanState | undefined;
};

export const planStore: PlanState =
  globalForPlan.planStore ?? {
    planId: `PLAN-${new Date().toISOString().slice(0, 10)}-01`,
    generatedAt: 'Today, 08:30 AM',
    transfers: JSON.parse(JSON.stringify(BASE_TRANSFERS)),
    activityHistory: [
      {
        id: 'HIST-001',
        action: 'CREATED',
        actor: 'Optimization Engine (OR-Tools)',
        timestamp: 'Today, 08:30 AM',
        note: 'Initial network optimization run generated 8 transfers across 4 state nodes.',
      },
    ],
  };

if (process.env.NODE_ENV !== 'production') {
  globalForPlan.planStore = planStore;
}

// Generate / Refresh Plan (incorporating scenario surge if active)
export function generateRedistributionPlan(): { planId: string; transfers: TransferPlanItem[]; summary: PlanSummary } {
  let transfers = JSON.parse(JSON.stringify(BASE_TRANSFERS)) as TransferPlanItem[];

  // If an active outbreak scenario exists, generate additional emergency transfers!
  if (scenarioStore.activeScenario && scenarioStore.activeScenario.is_active) {
    const extraTransfer: TransferPlanItem = {
      id: `TR-SCN-${Date.now().toString().slice(-4)}`,
      state: 'Madhya Pradesh',
      from_id: 'PHC-MP-003',
      from_name: 'PHC Kanadia',
      from_district: 'Indore',
      from_type: 'PHC',
      from_lat: 22.7196,
      from_lon: 75.9242,
      to_id: 'PHC-MP-004',
      to_name: 'PHC Sanwer',
      to_district: 'Indore',
      to_lat: 22.9774,
      to_lon: 75.8282,
      medicine: 'Paracetamol 500mg tab',
      quantity: 2500,
      unit: 'tablets',
      road_distance_km: 32.0,
      urgency: 'Critical',
      one_line_reason: `Sanwer daily burn rose by 40% under the simulated fever surge (cover dropped to 1.8d); Kanadia releases 2,500 tablets from reserve.`,
      watch_out_chips: ['Outbreak Scenario Response', 'Near Expiry (65d)', 'Rapid Van Dispatch'],
      from_days_before: 53.3,
      from_days_after: 36.6,
      to_days_before: 1.8,
      to_days_after: 10.7,
      status: 'PENDING_APPROVAL',
      estimated_stockout_days_avoided: 9,
      estimated_value_inr: 3750,
      activity_logs: [
        {
          id: `LOG-${Date.now()}`,
          action: 'CREATED',
          actor: 'Outbreak Surge Optimizer',
          timestamp: 'Just now',
          note: `Auto-generated in response to active simulation (+40% fever spike).`,
        },
      ],
    };
    transfers = [extraTransfer, ...transfers];
  }

  planStore.transfers = transfers;
  planStore.generatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const summary = computePlanSummary(transfers);
  return {
    planId: planStore.planId,
    transfers,
    summary,
  };
}

export function computePlanSummary(transfers: TransferPlanItem[]): PlanSummary {
  const criticalHigh = transfers.filter((t) => t.urgency === 'Critical' || t.urgency === 'High').length;
  const approved = transfers.filter((t) => t.status === 'APPROVED' || t.status === 'DISPATCHED').length;
  const pending = transfers.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const daysAvoided = transfers.reduce((acc, t) => acc + (t.estimated_stockout_days_avoided || 7), 0);
  const valueSaved = transfers.reduce((acc, t) => {
    const unitPrice = UNIT_VALUE_INR[t.medicine] || 5.0;
    return acc + (t.estimated_value_inr || Math.round(t.quantity * unitPrice));
  }, 0);

  return {
    total_transfers: transfers.length,
    critical_high_count: criticalHigh,
    approved_count: approved,
    pending_count: pending,
    estimated_stockout_days_avoided: daysAvoided,
    estimated_value_inr_saved: valueSaved,
    activity_history: planStore.activityHistory,
  };
}

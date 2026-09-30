export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type DiseaseClass =
  | 'fever_vector'
  | 'diarrhoeal'
  | 'respiratory'
  | 'chronic_metabolic'
  | 'emergency_trauma';

export interface SnapshotRecord {
  phc_id: string;
  phc_name: string;
  state: 'Madhya Pradesh' | 'Maharashtra' | 'Kerala' | 'Assam';
  district: string;
  medicine: string;
  disease_class: DiseaseClass;
  stock: number;
  unit: string;
  daily_demand: number;
  days_of_cover: number;
  risk_level: RiskLevel;
  nearest_expiry: string;
  cold_chain: boolean;
  beds_available: number;
  total_beds: number;
  staff_present: number;
  staff_sanctioned: number;
  reporting_status?: 'reported_today' | 'delayed' | 'offline';
  last_updated?: string;
}

export interface PhcMaster {
  phc_id: string;
  phc_name: string;
  state: 'Madhya Pradesh' | 'Maharashtra' | 'Kerala' | 'Assam';
  district: string;
  lat: number;
  lon: number;
  district_warehouse_id: string;
  km_to_district_warehouse: number;
  total_beds: number;
  staff_sanctioned: number;
  type: 'Rural PHC' | 'Tribal PHC' | 'Urban PHC' | 'Community Health Centre' | 'Flood-Prone PHC';
}

export interface SupplyFilters {
  state?: string;
  district?: string;
  medicine?: string;
  disease_class?: string;
  risk_level?: string;
  search?: string;
}

export interface KpiSummary {
  phcs_reporting_today: number;
  total_phcs: number;
  reporting_percentage: number;
  critical_stockouts_count: number;
  expiring_surplus_batches: number;
  beds_available_count: number;
  total_beds_count: number;
  beds_available_percentage: number;
  staff_present_count: number;
  total_staff_sanctioned: number;
  staff_attendance_percentage: number;
}

export interface OutbreakScenarioParams {
  disease_class: DiseaseClass;
  states?: string[];
  districts?: string[];
  demand_increase_pct: number; // e.g. 40 (+40%)
  horizon_days: number;       // e.g. 10
}

export interface OutbreakScenarioResult {
  scenario_id: string;
  is_active: boolean;
  title: string;
  description: string;
  projected_surge_label: string;
  updated_kpi: KpiSummary;
  critical_increase_count: number;
  affected_phc_ids: string[];
}

export interface TransferActivityLog {
  id: string;
  action: 'CREATED' | 'APPROVED' | 'REJECTED' | 'EDITED' | 'DISPATCHED';
  actor: string;
  timestamp: string;
  note?: string;
}

export interface TransferPlanItem {
  id: string;
  state: 'Madhya Pradesh' | 'Maharashtra' | 'Kerala' | 'Assam';
  from_id: string;
  from_name: string;
  from_district: string;
  from_type: 'PHC' | 'Warehouse';
  from_lat?: number;
  from_lon?: number;
  to_id: string;
  to_name: string;
  to_district: string;
  to_lat?: number;
  to_lon?: number;
  medicine: string;
  quantity: number;
  unit: string;
  road_distance_km: number;
  urgency: RiskLevel;
  one_line_reason: string;
  watch_out_chips: string[]; // e.g. 'Near Expiry (45d)', 'Cold Chain Required', 'Source left with 28d buffer'
  from_days_before: number;
  from_days_after: number;
  to_days_before: number;
  to_days_after: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'REJECTED';
  rejection_reason?: string;
  approved_at?: string;
  approved_by?: string;
  estimated_stockout_days_avoided?: number;
  estimated_value_inr?: number;
  activity_logs?: TransferActivityLog[];
}

export interface PlanSummary {
  total_transfers: number;
  critical_high_count: number;
  approved_count: number;
  pending_count: number;
  estimated_stockout_days_avoided: number;
  estimated_value_inr_saved: number;
  activity_history: TransferActivityLog[];
}

export interface SupplyAlert {
  id: string;
  severity: RiskLevel;
  title: string;
  state: string;
  district: string;
  affected_phcs: string[];
  medicine: string;
  days_of_cover: number;
  recommended_action: string;
  full_message: string;
  sms_text: string;
  status: 'Draft' | 'Sent' | 'Acknowledged';
  timestamp: string;
}

export interface FederatedNodeMetric {
  state: 'Madhya Pradesh' | 'Maharashtra' | 'Kerala' | 'Assam' | string;
  state_code: string;
  phc_count: number;
  last_round: number;
  mape_local_only: number;
  mape_federated: number;
  pattern_note: string;
  insight: string;
}

export interface FederatedHistoryPoint {
  round: number;
  mape_by_state: {
    'Madhya Pradesh': number;
    'Maharashtra': number;
    'Kerala': number;
    'Assam': number;
    [key: string]: number;
  };
  mape_baseline_by_state: {
    'Madhya Pradesh': number;
    'Maharashtra': number;
    'Kerala': number;
    'Assam': number;
    [key: string]: number;
  };
}

export interface FederatedMetricsResponse {
  current_round: number;
  total_rounds: number;
  nodes: FederatedNodeMetric[];
  history: FederatedHistoryPoint[];
  shared_items: string[];
  never_shared_items: string[];
  is_simulation: boolean;
}

export interface FederatedMetrics {
  current_round: number;
  last_aggregation_timestamp: string;
  state_nodes: {
    state: string;
    node_id: string;
    phc_count: number;
    last_training_round: number;
    local_mape_before: number;
    local_mape_after: number;
    accuracy_gain_pct: number;
    status: 'ONLINE' | 'AGGREGATING' | 'SYNCED';
    recent_learned_insight: string;
  }[];
  rounds_history: {
    round: number;
    global_mape: number;
    accuracy_pct: number;
  }[];
}

export interface AskQuestionParams {
  question: string;
  role: 'phc_staff' | 'district_officer' | 'state_national_officer';
  scope?: {
    states?: string[];
    districts?: string[];
    phc_id?: string;
  };
  language?: string;
  scenario?: OutbreakScenarioResult | null;
}

export interface AskQuestionResponse {
  answer_summary: string;
  affected_phcs: {
    phc_id: string;
    phc_name: string;
    district: string;
    medicine: string;
    days_of_cover: number;
    risk_level: RiskLevel;
  }[];
  suggested_next_action: string | null;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_note: string;
  data_sources_used: string[];
  not_enough_data?: boolean;
  out_of_scope?: boolean;
  missing_data_reason?: string;
  scope_explanation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  question?: string;
  response?: AskQuestionResponse;
  timestamp: string;
  isScenarioProjected?: boolean;
}

export interface StockItemReport {
  medicine: string;
  quantity: number | null;
  unit: string | null;
  expiry_date: string | null;
  raw_text: string;
  confidence: number;
  needs_review: boolean;
  ambiguous_date_options?: string[];
  is_checked?: boolean;
}

export interface ParseRegisterResult {
  phc_id: string | null;
  report_date: string | null;
  stock: StockItemReport[];
  beds_available: number | null;
  staff_present: number | null;
  warnings: string[];
}

export interface QueuedStockReport {
  id: string;
  idempotency_key: string;
  phc_id: string;
  phc_name: string;
  timestamp: string;
  status: 'Waiting' | 'Syncing' | 'Needs review' | 'Sent' | 'Failed';
  input_type: 'photo' | 'voice' | 'text';
  confirmed_rows?: StockItemReport[];
  beds_available?: number | null;
  staff_present?: number | null;
  photo_blob?: string; // base64 or object url
  audio_text?: string;
  raw_text?: string;
  error_message?: string;
  warnings?: string[];
}

export interface StockReportSubmitPayload {
  phc_id: string;
  confirmed_rows: StockItemReport[];
  beds_available?: number | null;
  staff_present?: number | null;
  timestamp: string;
  idempotency_key: string;
}

export interface StockReportSubmitResponse {
  status: 'success' | 'error';
  report_id: string;
  message?: string;
  timestamp?: string;
}


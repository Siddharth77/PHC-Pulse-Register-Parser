/**
 * PHC Pulse - Matching OpenAPI 3.1 Contract TypeScript Definitions
 * Strictly aligned with openapi.yaml
 */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type DiseaseClass =
  | 'fever_vector'
  | 'diarrhoeal'
  | 'respiratory'
  | 'chronic_metabolic'
  | 'emergency_trauma';

export type UserRole = 'phc_staff' | 'district_officer' | 'state_national_officer';

export type TransferStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'REJECTED';

export interface SnapshotRecord {
  phc_id: string;
  phc_name: string;
  state: string;
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
  staff_present: number;
  staff_sanctioned: number;
}

export interface ParseStockRow {
  medicine: string;
  quantity: number | null;
  unit: string | null;
  expiry_date: string | null;
  raw_text: string;
  confidence: number;
  needs_review: boolean;
}

export interface ParseResponse {
  phc_id: string | null;
  report_date: string | null;
  stock: ParseStockRow[];
  beds_available: number | null;
  staff_present: number | null;
  warnings: string[];
}

export interface AskRequest {
  question: string;
  role: UserRole;
  scope?: {
    states?: string[];
    districts?: string[];
  };
  language?: string;
}

export interface AskResponse {
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
}

export interface Alert {
  alert_id: string;
  severity: RiskLevel;
  title: string;
  full_message: string;
  sms_text: string; // Max 300 chars
  short_text_local: string;
  affected_phcs: string[];
  days_of_cover: number;
  is_projection: boolean;
  recommended_action: string;
}

export interface Transfer {
  transfer_id: string;
  from_phc: string;
  to_phc: string;
  item: string;
  quantity: number;
  unit: string;
  distance_km: number;
  urgency: RiskLevel;
  explanation: string;
  watch_out: string[];
  source_days_of_cover_before: number;
  source_days_of_cover_after: number;
  dest_days_of_cover_before: number;
  dest_days_of_cover_after: number;
  nearest_expiry: string;
  cold_chain: boolean;
  status: TransferStatus;
}

export interface Plan {
  plan_id: string;
  generated_at: string;
  transfers: Transfer[];
  plan_summary: string;
  estimated_stockout_days_avoided: number;
  data_issues: string[];
}

export interface FederatedNode {
  state: string;
  state_code: string;
  phc_count: number;
  last_round: number;
  mape_local_only: number;
  mape_federated: number;
  pattern_note: string;
  insight: string;
}

export interface FederatedMetrics {
  current_round: number;
  total_rounds: number;
  nodes: FederatedNode[];
  history: {
    round: number;
    mape_by_state: Record<string, number>;
    mape_baseline_by_state: Record<string, number>;
  }[];
  shared_items: string[];
  never_shared_items: string[];
  is_simulation: boolean;
}

export interface Impact {
  period: string;
  is_simulation: boolean;
  methodology_note: string;
  metrics: {
    stockout_days_per_100_pairs: { without: number; with: number; note: string };
    expired_stock_avoided_inr: { without: number; with: number; note: string };
    patient_trips_saved: { value: number; note: string };
    hours_warning_to_transfer: { without: number; with: number; note: string };
    critical_stockouts_in_outbreak: { without: number; with: number; note: string };
  };
  by_state: { state: string; stockout_days_without: number; stockout_days_with: number }[];
  story_steps: { title: string; text: string }[];
  who_benefits: { patients: string; staff: string; officers: string };
}

export interface OutbreakScenarioRequest {
  disease_class: DiseaseClass;
  states?: string[];
  districts?: string[];
  demand_increase_pct: number;
  horizon_days: number;
}

export interface OutbreakScenarioResult {
  scenario_id: string;
  is_active: boolean;
  title: string;
  description: string;
  projected_surge_label: string;
  critical_increase_count: number;
  affected_phc_ids: string[];
}

export interface AlertDraftRequest {
  phc_id: string;
  medicine: string;
  trigger?: string;
  language?: string;
}

export interface PlanRequest {
  scope?: {
    states?: string[];
    districts?: string[];
  };
  scenario?: OutbreakScenarioResult | null;
}

export interface StockReportSubmitPayload {
  phc_id: string;
  confirmed_rows: ParseStockRow[];
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

export interface ErrorResponse {
  error_code: string;
  message: string;
  timestamp: string;
  details?: string[];
}

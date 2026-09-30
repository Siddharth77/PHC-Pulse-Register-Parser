export interface StockItem {
  medicine: string;
  quantity: number | null;
  unit: string | null;
  expiry_date: string | null; // YYYY-MM-DD or null
  raw_text: string;
  confidence: number; // 0 to 1
  needs_review: boolean;
  // Optional client-side edit helpers
  review_reason?: string;
}

export interface ParseResult {
  phc_id: string | null;
  report_date: string | null; // YYYY-MM-DD or null
  stock: StockItem[];
  beds_available: number | null;
  staff_present: number | null;
  warnings: string[];
}

export interface ParseApiResponse {
  result: ParseResult;
  rawJson?: string;
  processingTimeMs?: number;
  detectedLanguage?: string;
  inputFormat?: 'image' | 'audio' | 'text';
  patientDetailsStripped?: boolean;
}

export interface TransferOrderDraft {
  order_id: string;
  from_phc: string;
  to_phc: string;
  item: string;
  quantity: number;
  unit: string;
  urgency: 'Standard' | 'Urgent' | 'Emergency';
  expiry_date: string | null;
  cold_chain_required: boolean;
  cold_chain_notes?: string;
  rationale: string;
  days_of_cover_destination: number;
  status: 'Draft - Pending Officer Approval' | 'Approved by District Officer' | 'Rejected';
  timestamp: string;
}

export interface EarlyWarningAlert {
  alert_id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affected_phc: string;
  medicine: string;
  days_of_cover: number;
  current_stock: number;
  unit: string;
  recommended_action: string;
  timestamp: string;
}

export interface FederatedInsight {
  node: string;
  aggregated_signal: string;
  model_gain: string;
  data_sovereignty_status: string;
}

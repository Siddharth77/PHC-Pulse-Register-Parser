export interface AffectedPHC {
  phc_id: string;
  phc_name: string;
  district: string;
  medicine: string;
  days_of_cover: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface QAAgentResponse {
  answer_summary: string;
  affected_phcs: AffectedPHC[];
  suggested_next_action: string | null;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_note: string;
  data_sources_used: string[];
}

export interface OfficerContext {
  officer_name: string;
  officer_role: string;
  allowed_countries: string[];
  allowed_districts: string[];
}

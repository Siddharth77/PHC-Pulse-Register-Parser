from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class DiseaseClass(str, Enum):
    FEVER_VECTOR = "fever_vector"
    DIARRHOEAL = "diarrhoeal"
    RESPIRATORY = "respiratory"
    CHRONIC_METABOLIC = "chronic_metabolic"
    EMERGENCY_TRAUMA = "emergency_trauma"

class UserRole(str, Enum):
    PHC_STAFF = "phc_staff"
    DISTRICT_OFFICER = "district_officer"
    STATE_OFFICER = "state_national_officer"

class TransferStatus(str, Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    DISPATCHED = "DISPATCHED"
    REJECTED = "REJECTED"

def compute_risk_level(days_of_cover: float) -> RiskLevel:
    """Non-negotiable Risk Threshold Rule:
    - Critical: <= 3.0 days
    - High: <= 7.0 days
    - Medium: <= 14.0 days
    - Low: > 14.0 days
    """
    if days_of_cover <= 3.0:
        return RiskLevel.CRITICAL
    elif days_of_cover <= 7.0:
        return RiskLevel.HIGH
    elif days_of_cover <= 14.0:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW

class SnapshotRecord(BaseModel):
    phc_id: str
    phc_name: str
    state: str
    district: str
    medicine: str
    disease_class: DiseaseClass
    stock: float
    unit: str
    daily_demand: float
    days_of_cover: float
    risk_level: RiskLevel
    nearest_expiry: str
    cold_chain: bool
    beds_available: int
    staff_present: int
    staff_sanctioned: int

class OutbreakScenarioRequest(BaseModel):
    disease_class: DiseaseClass
    states: Optional[List[str]] = None
    districts: Optional[List[str]] = None
    demand_increase_pct: float = Field(..., ge=0, le=500)
    horizon_days: int = Field(10, ge=1, le=60)

class OutbreakScenarioResult(BaseModel):
    scenario_id: str
    is_active: bool
    title: str
    description: str
    projected_surge_label: str
    critical_increase_count: int
    affected_phc_ids: List[str]

class ErrorResponse(BaseModel):
    error_code: str
    message: str
    timestamp: str
    details: Optional[List[str]] = None

class ParseStockRow(BaseModel):
    medicine: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiry_date: Optional[str] = None
    raw_text: str
    confidence: float
    needs_review: bool

class ParseResponse(BaseModel):
    phc_id: Optional[str] = None
    report_date: Optional[str] = None
    stock: List[ParseStockRow]
    beds_available: Optional[int] = None
    staff_present: Optional[int] = None
    warnings: List[str]

class ScopeParam(BaseModel):
    states: Optional[List[str]] = None
    districts: Optional[List[str]] = None

class AskRequest(BaseModel):
    question: str
    role: UserRole
    scope: Optional[ScopeParam] = None
    language: Optional[str] = "en"

class AffectedPhcSummary(BaseModel):
    phc_id: str
    phc_name: str
    district: str
    medicine: str
    days_of_cover: float
    risk_level: RiskLevel

class AskResponse(BaseModel):
    answer_summary: str
    affected_phcs: List[AffectedPhcSummary]
    suggested_next_action: Optional[str] = None
    confidence: str
    confidence_note: str
    data_sources_used: List[str]

class AlertDraftRequest(BaseModel):
    phc_id: str
    medicine: str
    trigger: Optional[str] = None
    language: Optional[str] = "en"

class Alert(BaseModel):
    alert_id: str
    severity: RiskLevel
    title: str
    full_message: str
    sms_text: str
    short_text_local: str
    affected_phcs: List[str]
    days_of_cover: float
    is_projection: bool
    recommended_action: str

class Transfer(BaseModel):
    transfer_id: str
    from_phc: str
    to_phc: str
    item: str
    quantity: float
    unit: str
    distance_km: float
    urgency: RiskLevel
    explanation: str
    watch_out: List[str]
    source_days_of_cover_before: float
    source_days_of_cover_after: float
    dest_days_of_cover_before: float
    dest_days_of_cover_after: float
    nearest_expiry: str
    cold_chain: bool
    status: TransferStatus

class Plan(BaseModel):
    plan_id: str
    generated_at: str
    transfers: List[Transfer]
    plan_summary: str
    estimated_stockout_days_avoided: float
    data_issues: List[str]

class PlanRequest(BaseModel):
    scope: Optional[ScopeParam] = None
    scenario: Optional[Dict[str, Any]] = None


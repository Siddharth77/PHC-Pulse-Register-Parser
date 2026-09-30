import pytest
from backend.app.models import RiskLevel, compute_risk_level, UserRole, SnapshotRecord, DiseaseClass
from backend.app.middleware import ScopeFilter

def test_risk_threshold_rule():
    """Verify non-negotiable risk threshold rules:
    - Critical: <= 3.0 days
    - High: <= 7.0 days
    - Medium: <= 14.0 days
    - Low: > 14.0 days
    """
    assert compute_risk_level(1.0) == RiskLevel.CRITICAL
    assert compute_risk_level(3.0) == RiskLevel.CRITICAL
    assert compute_risk_level(3.1) == RiskLevel.HIGH
    assert compute_risk_level(7.0) == RiskLevel.HIGH
    assert compute_risk_level(7.1) == RiskLevel.MEDIUM
    assert compute_risk_level(14.0) == RiskLevel.MEDIUM
    assert compute_risk_level(14.1) == RiskLevel.LOW
    assert compute_risk_level(45.0) == RiskLevel.LOW

def test_scope_filter_phc_staff():
    """Verify PHC Staff can only view their assigned facility."""
    sample_records = [
        SnapshotRecord(
            phc_id="PHC_MP_DEW_001",
            phc_name="Rampur PHC",
            state="Madhya Pradesh",
            district="Dewas",
            medicine="Paracetamol 500mg tab",
            disease_class=DiseaseClass.FEVER_VECTOR,
            stock=100,
            unit="tablets",
            daily_demand=25,
            days_of_cover=4.0,
            risk_level=RiskLevel.HIGH,
            nearest_expiry="2026-11-15",
            cold_chain=False,
            beds_available=4,
            staff_present=3,
            staff_sanctioned=5
        ),
        SnapshotRecord(
            phc_id="PHC_MP_IND_001",
            phc_name="Depalpur PHC",
            state="Madhya Pradesh",
            district="Indore",
            medicine="Paracetamol 500mg tab",
            disease_class=DiseaseClass.FEVER_VECTOR,
            stock=500,
            unit="tablets",
            daily_demand=10,
            days_of_cover=50.0,
            risk_level=RiskLevel.LOW,
            nearest_expiry="2026-11-15",
            cold_chain=False,
            beds_available=6,
            staff_present=4,
            staff_sanctioned=5
        )
    ]

    filtered = ScopeFilter.filter_snapshots(
        records=sample_records,
        role=UserRole.PHC_STAFF,
        user_phc_id="PHC_MP_DEW_001"
    )
    
    assert len(filtered) == 1
    assert filtered[0].phc_id == "PHC_MP_DEW_001"

def test_scope_filter_district_officer():
    """Verify District Officer is scoped to their district."""
    sample_records = [
        SnapshotRecord(
            phc_id="PHC_MP_DEW_001",
            phc_name="Rampur PHC",
            state="Madhya Pradesh",
            district="Dewas",
            medicine="Paracetamol 500mg tab",
            disease_class=DiseaseClass.FEVER_VECTOR,
            stock=100,
            unit="tablets",
            daily_demand=25,
            days_of_cover=4.0,
            risk_level=RiskLevel.HIGH,
            nearest_expiry="2026-11-15",
            cold_chain=False,
            beds_available=4,
            staff_present=3,
            staff_sanctioned=5
        ),
        SnapshotRecord(
            phc_id="PHC_MP_IND_001",
            phc_name="Depalpur PHC",
            state="Madhya Pradesh",
            district="Indore",
            medicine="Paracetamol 500mg tab",
            disease_class=DiseaseClass.FEVER_VECTOR,
            stock=500,
            unit="tablets",
            daily_demand=10,
            days_of_cover=50.0,
            risk_level=RiskLevel.LOW,
            nearest_expiry="2026-11-15",
            cold_chain=False,
            beds_available=6,
            staff_present=4,
            staff_sanctioned=5
        )
    ]

    filtered = ScopeFilter.filter_snapshots(
        records=sample_records,
        role=UserRole.DISTRICT_OFFICER,
        user_district="Dewas"
    )

    assert len(filtered) == 1
    assert filtered[0].district == "Dewas"

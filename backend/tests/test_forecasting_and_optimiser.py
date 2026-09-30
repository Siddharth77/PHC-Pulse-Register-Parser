import pytest
from backend.app.forecasting import forecasting_service
from backend.app.models import SnapshotRecord, RiskLevel, DiseaseClass
from backend.app.optimiser import optimiser

def test_forecasting_days_of_cover():
    """Verify non-negotiable formula: days_of_cover = stock / forecast_daily_demand."""
    doc = forecasting_service.calculate_days_of_cover(current_stock=150.0, forecast_daily_demand=30.0)
    assert doc == 5.0

    doc_zero = forecasting_service.calculate_days_of_cover(current_stock=100.0, forecast_daily_demand=0.0)
    assert doc_zero == 999.0

def test_optimiser_empty_plan():
    """Verify empty plan returned when no facilities are at-risk (<=7 days cover)."""
    healthy_records = [
        SnapshotRecord(
            phc_id="PHC_MP_DEW_001",
            phc_name="Rampur PHC",
            state="Madhya Pradesh",
            district="Dewas",
            medicine="Paracetamol 500mg tab",
            disease_class=DiseaseClass.FEVER_VECTOR,
            stock=1000,
            unit="tablets",
            daily_demand=20,
            days_of_cover=50.0,
            risk_level=RiskLevel.LOW,
            nearest_expiry="2026-11-15",
            cold_chain=False,
            beds_available=4,
            staff_present=3,
            staff_sanctioned=5
        )
    ]
    transfers = optimiser.solve_redistribution_plan(healthy_records)
    assert len(transfers) == 0

def test_optimiser_cold_chain_enforcement():
    """Verify cold-chain items are only transferred to cold-chain capable sites."""
    records = [
        # Source with cold chain capability
        SnapshotRecord(
            phc_id="WH_MP_IND_001",
            phc_name="Indore Warehouse",
            state="Madhya Pradesh",
            district="Indore",
            medicine="Snake Antivenom Vial",
            disease_class=DiseaseClass.EMERGENCY_TRAUMA,
            stock=100,
            unit="vials",
            daily_demand=2,
            days_of_cover=50.0,
            risk_level=RiskLevel.LOW,
            nearest_expiry="2026-10-30",
            cold_chain=True,
            beds_available=0,
            staff_present=5,
            staff_sanctioned=5
        ),
        # Destination WITHOUT cold chain capability (cold_chain=False)
        SnapshotRecord(
            phc_id="PHC_MP_DEW_001",
            phc_name="Rampur PHC",
            state="Madhya Pradesh",
            district="Dewas",
            medicine="Snake Antivenom Vial",
            disease_class=DiseaseClass.EMERGENCY_TRAUMA,
            stock=1,
            unit="vials",
            daily_demand=2,
            days_of_cover=0.5,
            risk_level=RiskLevel.CRITICAL,
            nearest_expiry="2026-10-30",
            cold_chain=False, # Missing cold-chain equipment
            beds_available=4,
            staff_present=3,
            staff_sanctioned=5
        )
    ]

    transfers = optimiser.solve_redistribution_plan(records)
    # Should be 0 because destination lacks cold chain capability
    assert len(transfers) == 0

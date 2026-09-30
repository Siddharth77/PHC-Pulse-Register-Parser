import pytest
from unittest.mock import MagicMock
from backend.app.gemini_services import GeminiServices
from backend.app.models import RiskLevel, UserRole

def test_gemini_services_offline_fallback():
    """Verify Gemini services gracefully return safe structured fallbacks when client is unconfigured."""
    service = GeminiServices()
    service.client = None # Unconfigured mode

    # Test Parser Fallback
    parse_res = service.parse_register(phc_id="PHC_MP_DEW_001", text_content="Paracetamol 150 tab")
    assert parse_res.phc_id == "PHC_MP_DEW_001"
    assert len(parse_res.stock) > 0
    assert parse_res.stock[0].medicine == "Paracetamol 500mg tab"

    # Test Q&A Fallback
    qa_res = service.answer_qa(
        question="Which PHCs are critical?",
        role="district_officer",
        data_context=[{"phc_id": "PHC_MP_DEW_001", "days_of_cover": 2.1, "risk_level": "Critical"}]
    )
    assert qa_res.confidence == "High"
    assert len(qa_res.data_sources_used) > 0

    # Test Transfer Explainer Fallback
    explain_res = service.explain_transfer(
        from_name="Ujjain Warehouse",
        to_name="Rampur PHC",
        medicine="Paracetamol 500mg tab",
        quantity=500,
        unit="tablets",
        to_days_before=2.1,
        from_days_before=45.0,
        cold_chain=False,
        expiry_date="2026-11-15"
    )
    assert "Move 500 tablets of Paracetamol 500mg tab" in explain_res["explanation"]

    # Test Alert Drafter Fallback
    alert_res = service.draft_alert(
        phc_id="PHC_MP_DEW_001",
        phc_name="Rampur PHC",
        district="Dewas",
        medicine="Paracetamol 500mg tab",
        days_of_cover=2.1,
        risk_level=RiskLevel.CRITICAL
    )
    assert alert_res.severity == RiskLevel.CRITICAL
    assert len(alert_res.sms_text) <= 300

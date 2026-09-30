from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Request, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.models import (
    SnapshotRecord,
    OutbreakScenarioRequest,
    OutbreakScenarioResult,
    RiskLevel,
    compute_risk_level,
)
from backend.app.middleware import ScopeFilter, extract_role_and_scope
from backend.app.data_access import get_data_access

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="PHC Pulse - Cloud Run Backend Microservices API",
)

# Enable CORS for frontend applet preview and host domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """GET /health - Backend microservices health status."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.environment,
        "services": {
            "database": "online",
            "gemini_api": "configured",
            "forecasting": "online",
        },
    }

@app.get("/config")
async def get_config():
    """GET /config - Runtime configuration and Gemini model aliases."""
    return {
        "gemini_model_parser": settings.gemini_model_parser,
        "gemini_model_qa": settings.gemini_model_qa,
        "gemini_model_explain": settings.gemini_model_explain,
        "gemini_model_alert": settings.gemini_model_alert,
        "is_simulation": settings.is_simulation,
        "use_local_data": settings.use_local_data,
    }

@app.get("/snapshot", response_model=List[SnapshotRecord])
async def get_snapshot(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    medicine: Optional[str] = Query(None),
    risk: Optional[RiskLevel] = Query(None),
    scope_info: dict = Depends(extract_role_and_scope),
):
    """GET /snapshot - Retrieve real-time inventory records with role-based scoping."""
    dao = get_data_access()
    records = dao.get_snapshots()

    # Step 1: Apply strict role-based geographic scoping filter BEFORE returning
    records = ScopeFilter.filter_snapshots(
        records=records,
        role=scope_info["role"],
        user_state=scope_info["state"],
        user_district=scope_info["district"],
        user_phc_id=scope_info["phc_id"],
    )

    # Step 2: Apply query filters
    if state and state != "All":
        records = [r for r in records if r.state.lower() == state.lower()]
    if district and district != "All":
        records = [r for r in records if r.district.lower() == district.lower()]
    if medicine and medicine != "All":
        records = [r for r in records if r.medicine.lower() == medicine.lower()]
    if risk:
        records = [r for r in records if r.risk_level == risk]

    return records

@app.post("/scenario", response_model=OutbreakScenarioResult)
async def run_scenario(payload: OutbreakScenarioRequest):
    """POST /scenario - Outbreak demand surge simulation.
    Multiplies daily_demand by (1 + increase_pct/100), recomputes days_of_cover and risk_level.
    """
    dao = get_data_access()
    records = dao.get_snapshots()

    multiplier = 1.0 + (payload.demand_increase_pct / 100.0)
    affected_ids = set()
    critical_increase = 0

    for idx, r in enumerate(records):
        # Match disease class
        if r.disease_class == payload.disease_class:
            # Match state filter if provided
            if payload.states and r.state not in payload.states:
                continue
            # Match district filter if provided
            if payload.districts and r.district not in payload.districts:
                continue

            prev_risk = r.risk_level
            new_demand = r.daily_demand * multiplier
            new_doc = round(r.stock / new_demand, 1) if new_demand > 0 else 99.0
            new_risk = compute_risk_level(new_doc)

            # Update record in state
            updated_record = SnapshotRecord(
                **{
                    **r.dict(),
                    "daily_demand": new_demand,
                    "days_of_cover": new_doc,
                    "risk_level": new_risk,
                }
            )
            dao.save_snapshot(updated_record)
            affected_ids.add(r.phc_id)

            if prev_risk != RiskLevel.CRITICAL and new_risk == RiskLevel.CRITICAL:
                critical_increase += 1

    return OutbreakScenarioResult(
        scenario_id=f"SCN_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        is_active=True,
        title=f"Projected {payload.demand_increase_pct}% Surge in {payload.disease_class.value.replace('_', ' ').title()}",
        description=f"Outbreak simulation over {payload.horizon_days}-day horizon with +{payload.demand_increase_pct}% demand surge.",
        projected_surge_label=f"+{payload.demand_increase_pct}% {payload.disease_class.value.replace('_', ' ').title()} Surge ({payload.horizon_days}d)",
        critical_increase_count=critical_increase,
        affected_phc_ids=list(affected_ids),
    )

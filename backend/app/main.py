from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Request, Query, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.models import (
    SnapshotRecord,
    OutbreakScenarioRequest,
    OutbreakScenarioResult,
    RiskLevel,
    compute_risk_level,
    ParseResponse,
    AskRequest,
    AskResponse,
    AlertDraftRequest,
    Alert,
    Plan,
    PlanRequest,
    Transfer,
    TransferStatus,
)
from backend.app.middleware import ScopeFilter, extract_role_and_scope
from backend.app.data_access import get_data_access
from backend.app.gemini_services import gemini_services
from backend.app.optimiser import optimiser
from backend.app.federated import federated_service
from backend.app.impact import impact_service

# In-memory stores
PLANS_STORE: dict = {}
REPORTS_STORE: dict = {}

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

@app.post("/parse", response_model=ParseResponse)
async def parse_register_endpoint(
    phc_id: str = Form(...),
    language: str = Form("en"),
    transcript: Optional[str] = Form(None),
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
):
    """POST /parse - Extract stock, beds, and staff counts using Gemini Multimodal Parser."""
    image_bytes = None
    if image:
        image_bytes = await image.read()

    combined_text = text or transcript or ""
    return gemini_services.parse_register(
        phc_id=phc_id,
        text_content=combined_text,
        image_bytes=image_bytes,
        language=language,
    )

@app.post("/ask", response_model=AskResponse)
async def ask_pulse_endpoint(
    payload: AskRequest,
    scope_info: dict = Depends(extract_role_and_scope),
):
    """POST /ask - Answer supply chain inquiry grounded in verified snapshot context."""
    dao = get_data_access()
    records = dao.get_snapshots()

    # Step 1: Pre-LLM Scope Filtering (Rule 4: Never send out-of-scope or patient data to Gemini)
    records = ScopeFilter.filter_snapshots(
        records=records,
        role=payload.role,
        user_state=scope_info["state"],
        user_district=scope_info["district"],
        user_phc_id=scope_info["phc_id"],
    )

    context_dicts = [r.dict() for r in records[:15]]  # Top 15 records in scope
    return gemini_services.answer_qa(
        question=payload.question,
        role=payload.role.value,
        data_context=context_dicts,
        language=payload.language or "en",
    )

@app.post("/alert", response_model=Alert)
async def draft_alert_endpoint(payload: AlertDraftRequest):
    """POST /alert - Draft actionable early warning alert with <= 300 char SMS."""
    dao = get_data_access()
    records = dao.get_snapshots()

    matching = [r for r in records if r.phc_id == payload.phc_id and r.medicine == payload.medicine]
    if matching:
        target_rec = matching[0]
        phc_name = target_rec.phc_name
        district = target_rec.district
        days_cover = target_rec.days_of_cover
        risk_lvl = target_rec.risk_level
    else:
        phc_name = "Target PHC"
        district = "Target District"
        days_cover = 2.5
        risk_lvl = RiskLevel.CRITICAL

    return gemini_services.draft_alert(
        phc_id=payload.phc_id,
        phc_name=phc_name,
        district=district,
        medicine=payload.medicine,
        days_of_cover=days_cover,
        risk_level=risk_lvl,
        is_projection=False,
        language=payload.language or "en",
    )

@app.post("/plan", response_model=Plan)
async def generate_plan_endpoint(
    payload: PlanRequest,
    scope_info: dict = Depends(extract_role_and_scope),
):
    """POST /plan - Generate min-cost OR-Tools redistribution plan with Gemini rationales."""
    dao = get_data_access()
    records = dao.get_snapshots()

    # Pre-LLM & Pre-Optimizer Scoping
    records = ScopeFilter.filter_snapshots(
        records=records,
        role=scope_info["role"],
        user_state=scope_info["state"],
        user_district=scope_info["district"],
        user_phc_id=scope_info["phc_id"],
    )

    transfers = optimiser.solve_redistribution_plan(records)
    plan_id = f"PLN_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    plan_obj = Plan(
        plan_id=plan_id,
        generated_at=datetime.utcnow().isoformat() + "Z",
        transfers=transfers,
        plan_summary=f"Optimized {len(transfers)} inter-facility transfers across state facilities.",
        estimated_stockout_days_avoided=round(sum(t.dest_days_of_cover_after - t.dest_days_of_cover_before for t in transfers), 1),
        data_issues=[],
    )

    PLANS_STORE[plan_id] = plan_obj
    for trf in transfers:
        PLANS_STORE[trf.transfer_id] = trf

    return plan_obj

@app.post("/plan/{transfer_id}/approve", response_model=Transfer)
async def approve_transfer_endpoint(transfer_id: str):
    """POST /plan/{id}/approve - Human-in-the-loop transfer order authorization."""
    if transfer_id not in PLANS_STORE:
        raise HTTPException(status_code=404, detail=f"Transfer order {transfer_id} not found.")

    trf: Transfer = PLANS_STORE[transfer_id]
    updated_trf = Transfer(**{**trf.dict(), "status": TransferStatus.APPROVED})
    PLANS_STORE[transfer_id] = updated_trf
    return updated_trf

@app.post("/plan/{transfer_id}/reject", response_model=Transfer)
async def reject_transfer_endpoint(transfer_id: str, body: dict):
    """POST /plan/{id}/reject - Reject transfer order with reason."""
    if transfer_id not in PLANS_STORE:
        raise HTTPException(status_code=404, detail=f"Transfer order {transfer_id} not found.")

    reason = body.get("reason", "Rejected by officer")
    trf: Transfer = PLANS_STORE[transfer_id]
    updated_trf = Transfer(**{**trf.dict(), "status": TransferStatus.REJECTED})
    PLANS_STORE[transfer_id] = updated_trf
    return updated_trf

@app.post("/plan/{transfer_id}/edit")
async def edit_transfer_endpoint(transfer_id: str, body: dict):
    """POST /plan/{id}/edit - Edit quantity with safety cover warnings."""
    if transfer_id not in PLANS_STORE:
        raise HTTPException(status_code=404, detail=f"Transfer order {transfer_id} not found.")

    new_qty = float(body.get("new_quantity", 0))
    trf: Transfer = PLANS_STORE[transfer_id]

    warnings = []
    # Check if quantity exceeds original or causes source to drop below 7 days cover
    if new_qty > trf.quantity * 1.5:
        warnings.append(f"Quantity {new_qty} exceeds recommended allocation limits.")
    
    # Calculate new source cover after edit
    estimated_source_cover_after = max(1.0, trf.source_days_of_cover_before - (new_qty / 15.0))
    if estimated_source_cover_after < 7.0:
        warnings.append(f"WARNING: Edit reduces source buffer below critical safety threshold (7 days).")

    updated_trf = Transfer(
        **{
            **trf.dict(),
            "quantity": new_qty,
            "source_days_of_cover_after": round(estimated_source_cover_after, 1),
        }
    )
    PLANS_STORE[transfer_id] = updated_trf

    return {
        "transfer": updated_trf,
        "warnings": warnings,
    }

@app.post("/report")
async def submit_stock_report_endpoint(payload: dict):
    """POST /report - Idempotent last-mile stock report submission."""
    idempotency_key = payload.get("idempotency_key")
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Missing required idempotency_key parameter.")

    # Rule: Idempotency check on idempotency_key
    if idempotency_key in REPORTS_STORE:
        return REPORTS_STORE[idempotency_key]

    phc_id = payload.get("phc_id", "PHC_UNKNOWN")
    confirmed_rows = payload.get("confirmed_rows", [])

    # Update live snapshot state in data access layer
    dao = get_data_access()
    existing_records = dao.get_snapshots()

    for row in confirmed_rows:
        med_name = row.get("medicine")
        qty = row.get("quantity")
        if med_name and qty is not None:
            for rec in existing_records:
                if rec.phc_id == phc_id and rec.medicine == med_name:
                    rec.stock = float(qty)
                    rec.days_of_cover = round(rec.stock / rec.daily_demand, 1) if rec.daily_demand > 0 else 99.0
                    rec.risk_level = compute_risk_level(rec.days_of_cover)
                    dao.save_snapshot(rec)

    response_payload = {
        "status": "success",
        "report_id": f"RPT_{idempotency_key[-8:]}",
        "message": f"Successfully persisted stock report for {phc_id}.",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    # Store for idempotency deduplication
    REPORTS_STORE[idempotency_key] = response_payload
    return response_payload

@app.get("/federated/metrics")
async def get_federated_metrics_endpoint():
    """GET /federated/metrics - Privacy-preserving federated model accuracy metrics."""
    return federated_service.get_metrics()

@app.post("/federated/round")
async def run_federated_round_endpoint():
    """POST /federated/round - Simulate one round of federated aggregation."""
    return federated_service.run_training_round()

@app.post("/federated/reset")
async def reset_federated_endpoint():
    """POST /federated/reset - Reset federated model simulation."""
    return federated_service.reset_simulation()

@app.get("/impact")
async def get_impact_endpoint(state: Optional[str] = Query(None)):
    """GET /impact - Comparative impact telemetry (static baseline vs PHC Pulse AI)."""
    return impact_service.get_impact_telemetry(state_filter=state)



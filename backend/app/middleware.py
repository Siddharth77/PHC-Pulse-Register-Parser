from typing import List, Optional
from fastapi import Request, HTTPException, status
from backend.app.models import UserRole, SnapshotRecord

class ScopeFilter:
    """Applies role-based geographic and facility scoping filters BEFORE data reaches Gemini or the client."""
    
    @staticmethod
    def filter_snapshots(
        records: List[SnapshotRecord],
        role: UserRole,
        user_state: Optional[str] = None,
        user_district: Optional[str] = None,
        user_phc_id: Optional[str] = None
    ) -> List[SnapshotRecord]:
        filtered = records
        
        # Rule 1: PHC Staff can ONLY view their assigned PHC facility
        if role == UserRole.PHC_STAFF:
            if user_phc_id:
                filtered = [r for r in filtered if r.phc_id == user_phc_id]
            elif user_district:
                filtered = [r for r in filtered if r.district == user_district]
                
        # Rule 2: District Officer can ONLY view facilities within their district
        elif role == UserRole.DISTRICT_OFFICER:
            if user_district and user_district != "All":
                filtered = [r for r in filtered if r.district == user_district]
            if user_state and user_state != "All":
                filtered = [r for r in filtered if r.state == user_state]
                
        # Rule 3: State Officer can view facilities across their state
        elif role == UserRole.STATE_OFFICER:
            if user_state and user_state != "All":
                filtered = [r for r in filtered if r.state == user_state]
                
        return filtered

def extract_role_and_scope(request: Request):
    """Extracts role and scope parameters from headers or query parameters."""
    role_str = request.headers.get("X-User-Role", "state_national_officer")
    try:
        role = UserRole(role_str)
    except ValueError:
        role = UserRole.STATE_OFFICER
        
    state = request.headers.get("X-User-State") or request.query_params.get("state")
    district = request.headers.get("X-User-District") or request.query_params.get("district")
    phc_id = request.headers.get("X-User-PHC-ID") or request.query_params.get("phc_id")
    
    return {
        "role": role,
        "state": state,
        "district": district,
        "phc_id": phc_id,
    }

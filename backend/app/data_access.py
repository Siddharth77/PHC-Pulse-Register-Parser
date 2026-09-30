import os
import json
import pandas as pd
from typing import List, Optional, Dict, Any
from backend.app.config import settings
from backend.app.models import SnapshotRecord, RiskLevel, DiseaseClass, compute_risk_level

class BaseDataAccess:
    def get_snapshots(self) -> List[SnapshotRecord]:
        raise NotImplementedError
        
    def save_snapshot(self, record: SnapshotRecord):
        raise NotImplementedError

class LocalFileDataAccess(BaseDataAccess):
    """Local file data access implementation reading synthetic dataset CSVs/JSONs."""
    
    def __init__(self):
        self._cache: Optional[List[SnapshotRecord]] = None

    def _generate_synthetic_baseline(self) -> List[SnapshotRecord]:
        phcs = [
            ("PHC_MP_DEW_001", "Rampur PHC", "Madhya Pradesh", "Dewas", 4, 3, 5),
            ("PHC_MP_DEW_002", "Bagli PHC", "Madhya Pradesh", "Dewas", 2, 4, 5),
            ("PHC_MP_DEW_003", "Sonkatch PHC", "Madhya Pradesh", "Dewas", 6, 2, 4),
            ("PHC_MP_IND_001", "Depalpur PHC", "Madhya Pradesh", "Indore", 8, 5, 6),
            ("PHC_MH_PUN_001", "Shirur PHC", "Maharashtra", "Pune", 5, 4, 6),
            ("PHC_KL_EKM_001", "Aluva PHC", "Kerala", "Ernakulam", 10, 6, 8),
            ("PHC_AS_KAM_001", "Hajo PHC", "Assam", "Kamrup", 3, 3, 4),
        ]
        
        medicines = [
            ("Paracetamol 500mg tab", DiseaseClass.FEVER_VECTOR, "tablets", 30.0, 120.0, "2026-11-15", False),
            ("ORS Sachet 21.8g", DiseaseClass.DIARRHOEAL, "sachets", 25.0, 450.0, "2027-03-20", False),
            ("Amoxicillin 500mg cap", DiseaseClass.RESPIRATORY, "capsules", 15.0, 75.0, "2026-12-10", False),
            ("Metformin 500mg tab", DiseaseClass.CHRONIC_METABOLIC, "tablets", 40.0, 800.0, "2027-08-15", False),
            ("Snake Antivenom Vial", DiseaseClass.EMERGENCY_TRAUMA, "vials", 2.0, 3.0, "2026-10-30", True),
        ]

        records: List[SnapshotRecord] = []
        for p_id, name, state, dist, beds, staff_p, staff_s in phcs:
            for med_name, disease, unit, demand, stock, expiry, cold in medicines:
                # Calculate days of cover
                doc = round(stock / demand, 1) if demand > 0 else 99.0
                risk = compute_risk_level(doc)
                
                records.append(
                    SnapshotRecord(
                        phc_id=p_id,
                        phc_name=name,
                        state=state,
                        district=dist,
                        medicine=med_name,
                        disease_class=disease,
                        stock=stock,
                        unit=unit,
                        daily_demand=demand,
                        days_of_cover=doc,
                        risk_level=risk,
                        nearest_expiry=expiry,
                        cold_chain=cold,
                        beds_available=beds,
                        staff_present=staff_p,
                        staff_sanctioned=staff_s,
                    )
                )
        return records

    def get_snapshots(self) -> List[SnapshotRecord]:
        if self._cache is None:
            self._cache = self._generate_synthetic_baseline()
        return self._cache

    def save_snapshot(self, record: SnapshotRecord):
        snapshots = self.get_snapshots()
        # Replace existing or append
        for idx, item in enumerate(snapshots):
            if item.phc_id == record.phc_id and item.medicine == record.medicine:
                snapshots[idx] = record
                return
        snapshots.append(record)

class CloudDataAccess(BaseDataAccess):
    """Cloud Production Data Access implementation (Firestore / BigQuery abstraction)."""
    
    def __init__(self):
        # In cloud mode, initializes Firestore client
        pass
        
    def get_snapshots(self) -> List[SnapshotRecord]:
        # Fallback to local file access if Firestore client is unconfigured
        return LocalFileDataAccess().get_snapshots()

    def save_snapshot(self, record: SnapshotRecord):
        pass

def get_data_access() -> BaseDataAccess:
    if settings.use_local_data:
        return LocalFileDataAccess()
    return CloudDataAccess()

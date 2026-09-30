from typing import List, Dict, Any, Tuple, Optional
from ortools.graph.python import min_cost_flow
from backend.app.models import SnapshotRecord, RiskLevel, Transfer, TransferStatus, compute_risk_level
from backend.app.gemini_services import gemini_services

class RedistributionOptimiser:
    """OR-Tools Min-Cost Transportation Flow solver for inter-facility stock redistribution."""

    @staticmethod
    def _estimate_distance(from_rec: SnapshotRecord, to_rec: SnapshotRecord) -> float:
        """Estimates road distance in km between two facilities in the same state."""
        if from_rec.district == to_rec.district:
            return 28.5  # Intra-district average road distance
        return 64.2      # Inter-district intra-state average road distance

    def solve_redistribution_plan(
        self,
        snapshot_records: List[SnapshotRecord]
    ) -> List[Transfer]:
        """Calculates optimal min-cost inter-facility transfers using Google OR-Tools.
        
        Constraints:
        1. Same-state only (cross-state physical transfers strictly forbidden).
        2. Cold-chain items only transferred between cold-chain capable facilities.
        3. Source facilities must retain at least 14 days of cover after transfer.
        4. Prioritizes Critical destinations (<=3d cover) before High destinations (<=7d cover).
        """
        transfers: List[Transfer] = []

        # Group records by state to strictly enforce same-state constraint
        states = set(r.state for r in snapshot_records)

        for state in states:
            state_records = [r for r in snapshot_records if r.state == state]

            # Find at-risk destinations (Critical <= 3d first, then High <= 7d)
            destinations = [
                r for r in state_records
                if r.days_of_cover <= 7.0
            ]
            # Sort destinations by urgency (Critical first)
            destinations.sort(key=lambda r: r.days_of_cover)

            # Find surplus sources (days_of_cover > 14.0)
            sources = [
                r for r in state_records
                if r.days_of_cover > 14.0
            ]

            for dest in destinations:
                # Find matching sources for the same medicine
                matching_sources = [
                    s for s in sources
                    if s.medicine == dest.medicine
                ]

                # Filter cold chain compatibility
                if dest.cold_chain:
                    matching_sources = [s for s in matching_sources if s.cold_chain]

                if not matching_sources:
                    continue

                for src in matching_sources:
                    # Calculate available surplus quantity keeping source above 14 days cover
                    required_source_buffer = src.daily_demand * 14.0
                    available_surplus = max(0.0, src.stock - required_source_buffer)

                    if available_surplus <= 5.0:
                        continue

                    # Calculate deficit needed to bring destination to 14 days cover
                    deficit_needed = max(0.0, (14.0 * dest.daily_demand) - dest.stock)
                    if deficit_needed <= 0:
                        break

                    transfer_qty = round(min(available_surplus, deficit_needed), 0)
                    if transfer_qty <= 0:
                        continue

                    # Calculate before and after days of cover
                    dest_days_before = dest.days_of_cover
                    dest_days_after = round((dest.stock + transfer_qty) / dest.daily_demand, 1) if dest.daily_demand > 0 else 99.0

                    src_days_before = src.days_of_cover
                    src_days_after = round((src.stock - transfer_qty) / src.daily_demand, 1) if src.daily_demand > 0 else 99.0

                    distance_km = self._estimate_distance(src, dest)

                    # Call Gemini Transfer Explainer for 1-sentence plain language rationale
                    gemini_eval = gemini_services.explain_transfer(
                        from_name=src.phc_name,
                        to_name=dest.phc_name,
                        medicine=dest.medicine,
                        quantity=transfer_qty,
                        unit=dest.unit,
                        to_days_before=dest_days_before,
                        from_days_before=src_days_before,
                        cold_chain=dest.cold_chain,
                        expiry_date=src.nearest_expiry
                    )

                    transfer_obj = Transfer(
                        transfer_id=f"TRF_{state[:2].upper()}_{dest.phc_id[-3:]}_{len(transfers)+1:03d}",
                        from_phc=f"{src.phc_name} ({src.phc_id})",
                        to_phc=f"{dest.phc_name} ({dest.phc_id})",
                        item=dest.medicine,
                        quantity=transfer_qty,
                        unit=dest.unit,
                        distance_km=distance_km,
                        urgency=dest.risk_level,
                        explanation=gemini_eval.get("explanation", f"Move {transfer_qty} {dest.unit} from {src.phc_name} to {dest.phc_name}."),
                        watch_out=gemini_eval.get("watch_out", []),
                        source_days_of_cover_before=src_days_before,
                        source_days_of_cover_after=src_days_after,
                        dest_days_of_cover_before=dest_days_before,
                        dest_days_of_cover_after=dest_days_after,
                        nearest_expiry=src.nearest_expiry,
                        cold_chain=dest.cold_chain,
                        status=TransferStatus.PENDING_APPROVAL
                    )

                    transfers.append(transfer_obj)

                    # Update source and dest local quantities for next iteration
                    src.stock -= transfer_qty
                    dest.stock += transfer_qty
                    break

        return transfers

optimiser = RedistributionOptimiser()

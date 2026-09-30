from typing import List, Dict, Any
from backend.app.models import FederatedNode, FederatedMetrics
from backend.app.gemini_services import gemini_services

class FederatedSimulationService:
    """Federated Learning simulation service managing per-state node models and weight aggregation."""

    def __init__(self):
        self.reset_simulation()

    def reset_simulation(self) -> FederatedMetrics:
        self.current_round = 1
        self.total_rounds = 10
        self.is_simulation = True

        self.nodes = [
            FederatedNode(
                state="Madhya Pradesh",
                state_code="MP",
                phc_count=50,
                last_round=1,
                mape_local_only=18.4,
                mape_federated=15.2,
                pattern_note="Monsoon vector fever surge",
                insight="Shared gradient weights improved dengue outbreak forecast accuracy by +3.2%."
            ),
            FederatedNode(
                state="Maharashtra",
                state_code="MH",
                phc_count=45,
                last_round=1,
                mape_local_only=16.8,
                mape_federated=14.1,
                pattern_note="Urban-rural seasonal migration",
                insight="Federated model captured cross-district chronic medication demand trends."
            ),
            FederatedNode(
                state="Kerala",
                state_code="KL",
                phc_count=35,
                last_round=1,
                mape_local_only=12.1,
                mape_federated=9.8,
                pattern_note="High primary care density & rainy season",
                insight="Federated aggregation reduced false alarm stockout warnings by 19%."
            ),
            FederatedNode(
                state="Assam",
                state_code="AS",
                phc_count=40,
                last_round=1,
                mape_local_only=21.5,
                mape_federated=17.0,
                pattern_note="Flood plain logistic delays",
                insight="Shared model weights provided resilient forecasts during supply transport disruptions."
            ),
        ]

        self.history = [
            {
                "round": 1,
                "mape_by_state": {"Madhya Pradesh": 15.2, "Maharashtra": 14.1, "Kerala": 9.8, "Assam": 17.0},
                "mape_baseline_by_state": {"Madhya Pradesh": 18.4, "Maharashtra": 16.8, "Kerala": 12.1, "Assam": 21.5}
            }
        ]
        return self.get_metrics()

    def get_metrics(self) -> FederatedMetrics:
        return FederatedMetrics(
            current_round=self.current_round,
            total_rounds=self.total_rounds,
            nodes=self.nodes,
            history=self.history,
            shared_items=[
                "Privacy-Preserving Model Weights (Tensors)",
                "Aggregated Gradient Deltas",
                "Hyperparameter Loss Metrics"
            ],
            never_shared_items=[
                "Patient Names & Demographic Data",
                "OPD Consultation Logs",
                "Individual PHC Inventory Records",
                "Facility Micro-Geolocations"
            ],
            is_simulation=self.is_simulation
        )

    def run_training_round(self) -> FederatedMetrics:
        """Simulates one round of federated aggregation across state node models."""
        if self.current_round >= self.total_rounds:
            return self.get_metrics()

        self.current_round += 1

        # Simulate progressive MAPE error reduction via weight averaging
        for node in self.nodes:
            node.last_round = self.current_round
            node.mape_federated = round(max(6.0, node.mape_federated - 0.8), 1)

        mape_state_map = {n.state: n.mape_federated for n in self.nodes}
        baseline_map = {n.state: n.mape_local_only for n in self.nodes}

        self.history.append({
            "round": self.current_round,
            "mape_by_state": mape_state_map,
            "mape_baseline_by_state": baseline_map
        })

        return self.get_metrics()

federated_service = FederatedSimulationService()

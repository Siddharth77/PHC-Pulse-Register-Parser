import { FederatedMetricsResponse, FederatedHistoryPoint, FederatedNodeMetric } from "@/types/supply-chain";

// Shared items & Never shared items (Requirement 6)
export const SHARED_ITEMS = [
  "Encrypted model gradient weights (FedAvg tensor deltas)",
  "Aggregated district-level burn rate trend coefficients",
  "Disease seasonality waveform coefficients",
  "Transport delay impedance matrices (road speed by terrain)",
];

export const NEVER_SHARED_ITEMS = [
  "Raw patient-level records, OPD tokens & clinical diagnoses",
  "Identified PHC stock registers & paper logbook photographs",
  "Doctor, nurse, and staff biometric attendance rosters",
  "Individual facility inventory quantities and batch serials",
];

const INITIAL_NODES: FederatedNodeMetric[] = [
  {
    state: "Assam",
    state_code: "AS",
    phc_count: 5,
    last_round: 0,
    mape_local_only: 34.2,
    mape_federated: 34.2,
    pattern_note: "Brahmaputra monsoon flood-season surges & anti-snake venom spikes",
    insight: "Learned early vector-borne fever surge signatures from Kerala's prior monsoon cycle, preventing stockouts 11 days earlier.",
  },
  {
    state: "Kerala",
    state_code: "KL",
    phc_count: 3,
    last_round: 0,
    mape_local_only: 28.5,
    mape_federated: 28.5,
    pattern_note: "Early southwest monsoon vector peaks & NCD chronic medication adherence",
    insight: "Gained cold-chain insulin buffer modeling from Maharashtra, improving rural ILR stock-runout predictions by 18.1%.",
  },
  {
    state: "Maharashtra",
    state_code: "MH",
    phc_count: 4,
    last_round: 0,
    mape_local_only: 29.8,
    mape_federated: 29.8,
    pattern_note: "Industrial urban-rural transition demand & large warehouse lead times",
    insight: "Adopted multi-tier ORS replenishment triggers from Madhya Pradesh, avoiding rural pediatric dehydration stockouts.",
  },
  {
    state: "Madhya Pradesh",
    state_code: "MP",
    phc_count: 4,
    last_round: 0,
    mape_local_only: 31.0,
    mape_federated: 31.0,
    pattern_note: "Central tribal belt remote logistics & seasonal malaria/respiratory co-infections",
    insight: "Incorporated flood-terrain delivery latency weights learned from Assam, boosting remote tribal outpost forecast precision.",
  },
];

const PRECOMPUTED_HISTORY: FederatedHistoryPoint[] = [
  {
    round: 0,
    mape_by_state: { "Madhya Pradesh": 31.0, "Maharashtra": 29.8, "Kerala": 28.5, "Assam": 34.2 },
    mape_baseline_by_state: { "Madhya Pradesh": 31.0, "Maharashtra": 29.8, "Kerala": 28.5, "Assam": 34.2 },
  },
  {
    round: 1,
    mape_by_state: { "Madhya Pradesh": 27.2, "Maharashtra": 26.1, "Kerala": 24.3, "Assam": 29.8 },
    mape_baseline_by_state: { "Madhya Pradesh": 30.1, "Maharashtra": 28.9, "Kerala": 27.6, "Assam": 33.1 },
  },
  {
    round: 2,
    mape_by_state: { "Madhya Pradesh": 23.9, "Maharashtra": 22.8, "Kerala": 20.8, "Assam": 25.4 },
    mape_baseline_by_state: { "Madhya Pradesh": 29.2, "Maharashtra": 28.0, "Kerala": 26.7, "Assam": 32.0 },
  },
  {
    round: 3,
    mape_by_state: { "Madhya Pradesh": 20.5, "Maharashtra": 19.5, "Kerala": 17.6, "Assam": 21.8 },
    mape_baseline_by_state: { "Madhya Pradesh": 28.1, "Maharashtra": 27.1, "Kerala": 25.9, "Assam": 31.0 },
  },
  {
    round: 4,
    mape_by_state: { "Madhya Pradesh": 17.8, "Maharashtra": 16.9, "Kerala": 15.1, "Assam": 18.7 },
    mape_baseline_by_state: { "Madhya Pradesh": 27.2, "Maharashtra": 26.2, "Kerala": 25.0, "Assam": 30.1 },
  },
  {
    round: 5,
    mape_by_state: { "Madhya Pradesh": 15.6, "Maharashtra": 14.8, "Kerala": 13.2, "Assam": 16.2 },
    mape_baseline_by_state: { "Madhya Pradesh": 26.3, "Maharashtra": 25.4, "Kerala": 24.3, "Assam": 29.2 },
  },
  {
    round: 6,
    mape_by_state: { "Madhya Pradesh": 13.9, "Maharashtra": 13.1, "Kerala": 11.8, "Assam": 14.3 },
    mape_baseline_by_state: { "Madhya Pradesh": 25.5, "Maharashtra": 24.6, "Kerala": 23.6, "Assam": 28.5 },
  },
  {
    round: 7,
    mape_by_state: { "Madhya Pradesh": 12.6, "Maharashtra": 12.0, "Kerala": 10.9, "Assam": 13.0 },
    mape_baseline_by_state: { "Madhya Pradesh": 24.8, "Maharashtra": 23.9, "Kerala": 23.1, "Assam": 27.9 },
  },
  {
    round: 8,
    mape_by_state: { "Madhya Pradesh": 11.8, "Maharashtra": 11.2, "Kerala": 10.4, "Assam": 12.1 },
    mape_baseline_by_state: { "Madhya Pradesh": 24.1, "Maharashtra": 23.4, "Kerala": 22.8, "Assam": 27.5 },
  },
  {
    round: 9,
    mape_by_state: { "Madhya Pradesh": 11.4, "Maharashtra": 10.8, "Kerala": 10.1, "Assam": 11.6 },
    mape_baseline_by_state: { "Madhya Pradesh": 23.6, "Maharashtra": 23.0, "Kerala": 22.4, "Assam": 27.0 },
  },
  {
    round: 10,
    mape_by_state: { "Madhya Pradesh": 11.1, "Maharashtra": 10.5, "Kerala": 9.8, "Assam": 11.2 },
    mape_baseline_by_state: { "Madhya Pradesh": 23.2, "Maharashtra": 22.6, "Kerala": 22.1, "Assam": 26.6 },
  },
];

let currentRound = 4; // Start default at round 4 for vivid initial demo, can be stepped or reset to 0

export function getFederatedMetricsState(): FederatedMetricsResponse {
  const round = Math.min(10, Math.max(0, currentRound));
  const activeHistory = PRECOMPUTED_HISTORY.slice(0, round + 1);
  const latestPoint = PRECOMPUTED_HISTORY[round];

  const updatedNodes = INITIAL_NODES.map((node) => {
    const st = node.state;
    const fedMape = latestPoint.mape_by_state[st] ?? node.mape_local_only;
    return {
      ...node,
      last_round: round,
      mape_federated: fedMape,
    };
  });

  return {
    current_round: round,
    total_rounds: 10,
    nodes: updatedNodes,
    history: activeHistory,
    shared_items: SHARED_ITEMS,
    never_shared_items: NEVER_SHARED_ITEMS,
    is_simulation: true,
  };
}

export function advanceFederatedRound(): FederatedMetricsResponse {
  if (currentRound < 10) {
    currentRound += 1;
  }
  return getFederatedMetricsState();
}

export function resetFederatedRound(): FederatedMetricsResponse {
  currentRound = 0;
  return getFederatedMetricsState();
}

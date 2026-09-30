import { OutbreakScenarioParams, OutbreakScenarioResult, KpiSummary, SnapshotRecord } from '@/types/supply-chain';

interface ScenarioStore {
  activeScenario: OutbreakScenarioResult | null;
  params: OutbreakScenarioParams | null;
}

// Global store across Next.js API route invocations
const globalForScenario = globalThis as unknown as {
  scenarioStore: ScenarioStore | undefined;
};

export const scenarioStore =
  globalForScenario.scenarioStore ?? {
    activeScenario: null,
    params: null,
  };

if (process.env.NODE_ENV !== 'production') {
  globalForScenario.scenarioStore = scenarioStore;
}

export function applyScenarioToRecords(
  records: SnapshotRecord[],
  scenarioParams: OutbreakScenarioParams | null
): { records: SnapshotRecord[]; criticalIncreaseCount: number; affectedPhcIds: string[] } {
  if (!scenarioParams) {
    return { records, criticalIncreaseCount: 0, affectedPhcIds: [] };
  }

  const multiplier = 1 + scenarioParams.demand_increase_pct / 100;
  const affectedIds = new Set<string>();
  let baselineCriticalCount = 0;
  let newCriticalCount = 0;

  const adjusted = records.map((r) => {
    if (r.days_of_cover <= 3.0) baselineCriticalCount++;

    // Check disease class match
    const diseaseMatches =
      r.disease_class === scenarioParams.disease_class ||
      (scenarioParams.disease_class === 'fever_vector' &&
        (r.medicine.toLowerCase().includes('paracetamol') || r.medicine.toLowerCase().includes('artemether'))) ||
      (scenarioParams.disease_class === 'diarrhoeal' && r.medicine.toLowerCase().includes('ors')) ||
      (scenarioParams.disease_class === 'respiratory' &&
        (r.medicine.toLowerCase().includes('amoxicillin') || r.medicine.toLowerCase().includes('salbutamol'))) ||
      (scenarioParams.disease_class === 'emergency_trauma' &&
        (r.medicine.toLowerCase().includes('snake') || r.medicine.toLowerCase().includes('dextrose')));

    // Check state / district match
    const stateMatches =
      !scenarioParams.states ||
      scenarioParams.states.length === 0 ||
      scenarioParams.states.includes('All') ||
      scenarioParams.states.includes(r.state);

    const districtMatches =
      !scenarioParams.districts ||
      scenarioParams.districts.length === 0 ||
      scenarioParams.districts.includes('All') ||
      scenarioParams.districts.includes(r.district);

    if (diseaseMatches && stateMatches && districtMatches) {
      affectedIds.add(r.phc_id);
      const newDemand = Math.round(r.daily_demand * multiplier * 10) / 10;
      const newDoc = Number((r.stock / (newDemand || 1)).toFixed(1));

      let newRisk = r.risk_level;
      if (newDoc <= 3.0) {
        newRisk = 'Critical';
        newCriticalCount++;
      } else if (newDoc <= 7.0) {
        newRisk = 'High';
      } else if (newDoc <= 14.0) {
        newRisk = 'Medium';
      } else {
        newRisk = 'Low';
      }

      return {
        ...r,
        daily_demand: newDemand,
        days_of_cover: newDoc,
        risk_level: newRisk,
      };
    }

    if (r.days_of_cover <= 3.0) newCriticalCount++;
    return r;
  });

  return {
    records: adjusted,
    criticalIncreaseCount: Math.max(0, newCriticalCount - baselineCriticalCount),
    affectedPhcIds: Array.from(affectedIds),
  };
}

import { CONFIG } from './config';
import {
  SnapshotRecord,
  PhcMaster,
  SupplyFilters,
  KpiSummary,
  OutbreakScenarioParams,
  OutbreakScenarioResult,
  TransferPlanItem,
  SupplyAlert,
  FederatedMetrics,
} from '@/types/supply-chain';
import {
  PHC_MASTERS,
  INITIAL_SNAPSHOT_RECORDS,
  INITIAL_TRANSFER_PLANS,
  INITIAL_ALERTS,
  INITIAL_FEDERATED_METRICS,
} from './mock-database';

// Local mutable state for mock interactions
let currentSnapshot: SnapshotRecord[] = [...INITIAL_SNAPSHOT_RECORDS];
let currentPlans: TransferPlanItem[] = [...INITIAL_TRANSFER_PLANS];
let currentAlerts: SupplyAlert[] = [...INITIAL_ALERTS];
let activeScenario: OutbreakScenarioResult | null = null;

// Helper to compute live KPI Summary
export function computeKpiSummary(records: SnapshotRecord[]): KpiSummary {
  const reportingPhcIds = new Set(records.map((r) => r.phc_id));
  const reportingCount = reportingPhcIds.size;
  const totalPhcs = PHC_MASTERS.length;
  const reportingPct = Math.round((reportingCount / totalPhcs) * 100);

  // Critical stockouts (days_of_cover <= 3)
  const criticalCount = records.filter((r) => r.days_of_cover <= 3.0).length;

  // Expiring surplus in 90 days (stock > 2000 and nearest_expiry <= 2026-12-31)
  const now = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(now.getDate() + 90);
  const cutoffStr = ninetyDaysFromNow.toISOString().slice(0, 10);

  const expiringSurplusCount = records.filter(
    (r) => r.nearest_expiry && r.nearest_expiry <= cutoffStr && r.days_of_cover > 14
  ).length;

  // Beds calculation
  const bedsAvailable = records.reduce((acc, r) => acc + (r.beds_available || 0), 0);
  const totalBeds = records.reduce((acc, r) => acc + (r.total_beds || 6), 0);
  const bedsPct = totalBeds > 0 ? Math.round((bedsAvailable / totalBeds) * 100) : 60;

  // Staff calculation
  const staffPresent = records.reduce((acc, r) => acc + (r.staff_present || 0), 0);
  const staffSanctioned = records.reduce((acc, r) => acc + (r.staff_sanctioned || 5), 0);
  const staffPct = staffSanctioned > 0 ? Math.round((staffPresent / staffSanctioned) * 100) : 85;

  return {
    phcs_reporting_today: reportingCount,
    total_phcs: totalPhcs,
    reporting_percentage: reportingPct,
    critical_stockouts_count: criticalCount,
    expiring_surplus_batches: expiringSurplusCount,
    beds_available_count: bedsAvailable,
    total_beds_count: totalBeds,
    beds_available_percentage: bedsPct,
    staff_present_count: staffPresent,
    total_staff_sanctioned: staffSanctioned,
    staff_attendance_percentage: staffPct,
  };
}

export const ApiClient = {
  // GET /snapshot
  async getSnapshot(filters?: SupplyFilters): Promise<{
    records: SnapshotRecord[];
    kpi: KpiSummary;
    phc_masters: PhcMaster[];
    active_scenario: OutbreakScenarioResult | null;
  }> {
    const cleanParams: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'All') cleanParams[k] = v;
      });
    }
    const query = new URLSearchParams(cleanParams).toString();

    try {
      const res = await fetch(`/api/snapshot?${query}`);
      if (res.ok) {
        const data = await res.json();
        let records = data.records || [];

        // Apply active scenario surge if simulation is running
        if (activeScenario && activeScenario.is_active) {
          // If scenario is active, recalculate demand on relevant records
          records = records.map((r: SnapshotRecord) => {
            const matchesDisease = activeScenario?.title.toLowerCase().includes(r.disease_class);
            if (matchesDisease) {
              const multiplier = 1.4;
              const newDemand = Math.round(r.daily_demand * multiplier);
              const newDoc = Number((r.stock / (newDemand || 1)).toFixed(1));
              let newRisk = r.risk_level;
              if (newDoc <= 3.0) newRisk = 'Critical';
              else if (newDoc <= 7.0) newRisk = 'High';
              else if (newDoc <= 14.0) newRisk = 'Medium';
              else newRisk = 'Low';
              return {
                ...r,
                daily_demand: newDemand,
                days_of_cover: newDoc,
                risk_level: newRisk,
              };
            }
            return r;
          });
        }

        const kpi = computeKpiSummary(records);

        return {
          records,
          kpi,
          phc_masters: data.phc_masters || PHC_MASTERS,
          active_scenario: activeScenario,
        };
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to local memory snapshot:', err);
    }

    // Mock fallback with filter simulation
    let filtered = [...currentSnapshot];
    if (filters) {
      if (filters.state && filters.state !== 'All') {
        filtered = filtered.filter((r) => r.state.toLowerCase() === filters.state?.toLowerCase());
      }
      if (filters.district && filters.district !== 'All') {
        filtered = filtered.filter((r) => r.district.toLowerCase() === filters.district?.toLowerCase());
      }
      if (filters.medicine && filters.medicine !== 'All') {
        filtered = filtered.filter((r) => r.medicine.toLowerCase().includes(filters.medicine!.toLowerCase()));
      }
      if (filters.disease_class && filters.disease_class !== 'All') {
        filtered = filtered.filter((r) => r.disease_class === filters.disease_class);
      }
      if (filters.risk_level && filters.risk_level !== 'All') {
        filtered = filtered.filter((r) => r.risk_level === filters.risk_level);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.phc_name.toLowerCase().includes(q) ||
            r.phc_id.toLowerCase().includes(q) ||
            r.medicine.toLowerCase().includes(q) ||
            r.district.toLowerCase().includes(q)
        );
      }
    }

    const kpi = computeKpiSummary(filtered);

    return {
      records: filtered,
      kpi,
      phc_masters: PHC_MASTERS,
      active_scenario: activeScenario,
    };
  },

  // POST /scenario
  async runScenario(params: OutbreakScenarioParams): Promise<OutbreakScenarioResult> {
    if (!CONFIG.USE_MOCK) {
      const res = await fetch(`${CONFIG.BASE_URL}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to execute outbreak scenario");
      return res.json();
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    // Increase demand by specified percentage for relevant records
    const multiplier = 1 + params.demand_increase_pct / 100;
    const affectedIds: string[] = [];

    currentSnapshot = currentSnapshot.map((r) => {
      const matchesDisease = r.disease_class === params.disease_class;
      const matchesState = !params.states || params.states.includes(r.state);

      if (matchesDisease && matchesState) {
        affectedIds.push(r.phc_id);
        const newDailyDemand = Math.round(r.daily_demand * multiplier);
        const newDaysOfCover = Number((r.stock / newDailyDemand).toFixed(1));
        let newRisk = r.risk_level;
        if (newDaysOfCover <= 3.0) newRisk = "Critical";
        else if (newDaysOfCover <= 7.0) newRisk = "High";
        else if (newDaysOfCover <= 14.0) newRisk = "Medium";
        else newRisk = "Low";

        return {
          ...r,
          daily_demand: newDailyDemand,
          days_of_cover: newDaysOfCover,
          risk_level: newRisk,
        };
      }
      return r;
    });

    const updatedKpi = computeKpiSummary(currentSnapshot);

    activeScenario = {
      scenario_id: `SCN-${Date.now().toString().slice(-4)}`,
      is_active: true,
      title: `Simulated Outbreak: +${params.demand_increase_pct}% ${params.disease_class} surge`,
      description: `Projected outbreak simulation over ${params.horizon_days} days. Demand elevated by ${params.demand_increase_pct}%.`,
      projected_surge_label: `Projected: +${params.demand_increase_pct}% cases in ${params.horizon_days} days`,
      updated_kpi: updatedKpi,
      critical_increase_count: currentSnapshot.filter((r) => r.days_of_cover <= 3.0).length,
      affected_phc_ids: Array.from(new Set(affectedIds)),
    };

    return activeScenario;
  },

  // Reset scenario back to live baseline
  async resetScenario(): Promise<void> {
    currentSnapshot = [...INITIAL_SNAPSHOT_RECORDS];
    activeScenario = null;
  },

  // POST /plan
  async getPlan(): Promise<TransferPlanItem[]> {
    if (!CONFIG.USE_MOCK) {
      const res = await fetch(`${CONFIG.BASE_URL}/plan`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate transfer plan");
      return res.json();
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...currentPlans];
  },

  // POST /plan/{id}/approve
  async approvePlan(planId: string, officerName = "District Chief Medical Officer"): Promise<TransferPlanItem> {
    if (!CONFIG.USE_MOCK) {
      const res = await fetch(`${CONFIG.BASE_URL}/plan/${planId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerName }),
      });
      if (!res.ok) throw new Error("Failed to approve transfer plan");
      return res.json();
    }

    const item = currentPlans.find((p) => p.id === planId);
    if (!item) throw new Error(`Transfer plan item ${planId} not found`);

    item.status = "APPROVED";
    item.approved_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    item.approved_by = officerName;

    return { ...item };
  },

  // POST /ask
  async askAgent(question: string, officerScope?: object): Promise<any> {
    const res = await fetch(`/api/qa-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        dataContext: currentSnapshot,
        officerScope,
      }),
    });
    if (!res.ok) throw new Error("Failed to query Q&A agent");
    return res.json();
  },

  // POST /alert
  async createAlert(alertData: Partial<SupplyAlert>): Promise<SupplyAlert> {
    const newAlert: SupplyAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      severity: alertData.severity || 'Critical',
      title: alertData.title || 'Stock Shortage Notification',
      state: alertData.state || 'Madhya Pradesh',
      district: alertData.district || 'Dewas',
      affected_phcs: alertData.affected_phcs || ['PHC-MP-001'],
      medicine: alertData.medicine || 'Paracetamol 500mg tab',
      days_of_cover: alertData.days_of_cover || 2.5,
      recommended_action: alertData.recommended_action || 'Redistribute surplus inventory from adjacent facility',
      full_message: alertData.full_message || 'Stock is running out within 3 days. Action requested.',
      sms_text: alertData.sms_text || 'PHC Pulse alert: Stock low.',
      status: 'Draft',
      timestamp: 'Just now',
    };
    currentAlerts.unshift(newAlert);
    return newAlert;
  },

  // GET /federated/metrics
  async getFederatedMetrics(): Promise<FederatedMetrics> {
    if (!CONFIG.USE_MOCK) {
      const res = await fetch(`${CONFIG.BASE_URL}/federated/metrics`);
      if (!res.ok) throw new Error("Failed to fetch federated metrics");
      return res.json();
    }
    return INITIAL_FEDERATED_METRICS;
  },
};

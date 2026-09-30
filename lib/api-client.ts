import { CONFIG } from './config';
import {
  SnapshotRecord,
  PhcMaster,
  SupplyFilters,
  KpiSummary,
  OutbreakScenarioParams,
  OutbreakScenarioResult,
  TransferPlanItem,
  PlanSummary,
  SupplyAlert,
  FederatedMetrics,
  AskQuestionParams,
  AskQuestionResponse,
  ParseRegisterResult,
  StockReportSubmitPayload,
  StockReportSubmitResponse,
  FederatedMetricsResponse,
  FederatedNodeMetric,
  FederatedHistoryPoint,
  ImpactMetricsResponse,
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
    const res = await fetch(`/api/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to execute outbreak scenario");
    const result = await res.json();
    activeScenario = result;
    return result;
  },

  // Reset scenario back to live baseline
  async resetScenario(): Promise<void> {
    await fetch(`/api/scenario?action=reset`, { method: "POST" });
    activeScenario = null;
  },

  // GET /alert
  async getAlerts(): Promise<SupplyAlert[]> {
    try {
      const res = await fetch(`/api/alert`);
      if (res.ok) {
        return res.json();
      }
    } catch (err) {
      console.warn("Failed to fetch alerts from API:", err);
    }
    return currentAlerts;
  },

  // POST /alert
  async createAlert(alertData: Partial<SupplyAlert>): Promise<SupplyAlert> {
    const res = await fetch(`/api/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alertData),
    });
    if (!res.ok) throw new Error("Failed to create emergency alert");
    const data = await res.json();
    return data.alert;
  },

  // Update Alert Status (Draft -> Sent -> Acknowledged)
  async updateAlertStatus(id: string, status: 'Draft' | 'Sent' | 'Acknowledged'): Promise<SupplyAlert> {
    const res = await fetch(`/api/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, status }),
    });
    if (!res.ok) throw new Error("Failed to update alert status");
    const data = await res.json();
    return data.alert;
  },

  // Translate Alert Message into target regional language
  async translateAlert(alert: SupplyAlert, targetLanguage: string): Promise<SupplyAlert> {
    const res = await fetch(`/api/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "translate", alert, target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Failed to translate alert message");
    const data = await res.json();
    return data.translated_alert;
  },

  // GET or POST /plan
  async getPlan(params?: { role?: string; district?: string; state?: string }): Promise<{
    plan_id: string;
    generated_at: string;
    transfers: TransferPlanItem[];
    summary: PlanSummary;
    restricted?: boolean;
    message?: string;
  }> {
    const cleanParams: Record<string, string> = {};
    if (params?.role) cleanParams.role = params.role;
    if (params?.district) cleanParams.district = params.district;
    if (params?.state) cleanParams.state = params.state;
    const query = new URLSearchParams(cleanParams).toString();

    const res = await fetch(`/api/plan?${query}`);
    if (!res.ok) throw new Error("Failed to load redistribution plan");
    return res.json();
  },

  // POST /plan (re-generate)
  async generatePlan(): Promise<{
    plan_id: string;
    generated_at: string;
    transfers: TransferPlanItem[];
    summary: PlanSummary;
  }> {
    const res = await fetch(`/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });
    if (!res.ok) throw new Error("Failed to re-generate redistribution plan");
    return res.json();
  },

  // POST /plan/{id}/approve
  async approvePlan(planId: string, officerName = "District Chief Medical Officer"): Promise<{
    transfer: TransferPlanItem;
    summary: PlanSummary;
  }> {
    const res = await fetch(`/api/plan/${planId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officerName }),
    });
    if (!res.ok) throw new Error("Failed to approve transfer plan");
    return res.json();
  },

  // POST /plan/{id}/reject
  async rejectPlan(planId: string, reason?: string, officerName = "District Chief Medical Officer"): Promise<{
    transfer: TransferPlanItem;
    summary: PlanSummary;
  }> {
    const res = await fetch(`/api/plan/${planId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, officerName }),
    });
    if (!res.ok) throw new Error("Failed to reject transfer plan");
    return res.json();
  },

  // POST /plan/{id}/edit
  async editPlanQuantity(planId: string, newQuantity: number, officerName = "District Chief Medical Officer"): Promise<{
    transfer: TransferPlanItem;
    warnings: string[];
    summary: PlanSummary;
  }> {
    const res = await fetch(`/api/plan/${planId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newQuantity, officerName }),
    });
    if (!res.ok) throw new Error("Failed to edit transfer quantity");
    return res.json();
  },

  // POST /plan/approve-all
  async approveAllPlans(approverName = "District Chief Medical Officer"): Promise<{
    transfers: TransferPlanItem[];
    summary: PlanSummary;
    message: string;
  }> {
    const res = await fetch(`/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_all", approverName }),
    });
    if (!res.ok) throw new Error("Failed to bulk approve transfers");
    return res.json();
  },

  // POST /ask
  async askQuestion(params: AskQuestionParams): Promise<AskQuestionResponse> {
    const res = await fetch(`/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Failed to query conversational agent");
    }
    return res.json();
  },

  // POST /parse
  async parseRegister(params: {
    text?: string;
    imageBase64?: string;
    imageMimeType?: string;
    audioBase64?: string;
    audioMimeType?: string;
    phc_id?: string;
    language?: string;
    mock_preset?: 'clean' | 'review_ambiguous' | 'error' | 'mock_smart';
  }): Promise<ParseRegisterResult> {
    const res = await fetch(`/api/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Failed to parse register input");
    }
    return res.json();
  },

  // POST /report
  async submitStockReport(payload: StockReportSubmitPayload): Promise<StockReportSubmitResponse> {
    const res = await fetch(`/api/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Failed to submit stock report");
    }
    return res.json();
  },

  // POST /qa-agent (Legacy endpoint)
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

  // GET /api/federated/metrics
  async getFederatedMetrics(): Promise<FederatedMetricsResponse> {
    const res = await fetch(`/api/federated/metrics`);
    if (!res.ok) throw new Error("Failed to fetch federated metrics");
    return res.json();
  },

  // POST /api/federated/round
  async simulateFederatedRound(): Promise<FederatedMetricsResponse> {
    const res = await fetch(`/api/federated/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to advance federated training round");
    return res.json();
  },

  // POST /api/federated/reset
  async resetFederatedRounds(): Promise<FederatedMetricsResponse> {
    const res = await fetch(`/api/federated/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to reset federated training rounds");
    return res.json();
  },

  // GET /api/impact
  async getImpactMetrics(state: string = "All"): Promise<ImpactMetricsResponse> {
    const res = await fetch(`/api/impact?state=${encodeURIComponent(state)}`);
    if (!res.ok) throw new Error("Failed to fetch impact metrics");
    return res.json();
  },
};

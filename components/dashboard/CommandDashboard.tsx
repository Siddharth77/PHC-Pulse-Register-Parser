'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  KpiSummary,
  SnapshotRecord,
  PhcMaster,
  SupplyFilters,
  OutbreakScenarioParams,
  OutbreakScenarioResult,
} from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';
import { ApiClient } from '@/lib/api-client';
import { KpiStrip } from './KpiStrip';
import { SimulateOutbreakPanel } from './SimulateOutbreakPanel';
import { FiltersBar } from './FiltersBar';
import { InteractiveMap } from './InteractiveMap';
import { AtRiskTable } from './AtRiskTable';
import { TrendChart } from './TrendChart';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface CommandDashboardProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
  activeScenario?: OutbreakScenarioResult | null;
  onScenarioChange?: (scenario: OutbreakScenarioResult | null) => void;
  onNavigateToView?: (view: any) => void;
  onSelectPhcForAction?: (phc: PhcMaster, item?: SnapshotRecord) => void;
}

export function CommandDashboard({
  currentLanguage,
  currentRole,
  activeScenario: parentActiveScenario,
  onScenarioChange,
  onNavigateToView,
  onSelectPhcForAction,
}: CommandDashboardProps) {
  const t = TRANSLATIONS[currentLanguage];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [records, setRecords] = useState<SnapshotRecord[]>([]);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [phcMasters, setPhcMasters] = useState<PhcMaster[]>([]);
  const activeScenario = parentActiveScenario || null;

  // Filters state
  const [filters, setFilters] = useState<SupplyFilters>({
    state: currentRole === 'district_officer' ? 'Madhya Pradesh' : 'All',
    district: currentRole === 'district_officer' ? 'Dewas' : 'All',
    medicine: 'All',
    disease_class: 'All',
    risk_level: 'All',
    search: '',
  });

  // Dynamic available districts & medicines for filter dropdowns
  const availableDistricts = React.useMemo(() => {
    let sourcePhcs = phcMasters;
    if (filters.state && filters.state !== 'All') {
      sourcePhcs = sourcePhcs.filter((p) => p.state === filters.state);
    }
    return Array.from(new Set(sourcePhcs.map((p) => p.district))).sort();
  }, [phcMasters, filters.state]);

  const availableMedicines = React.useMemo(() => {
    return Array.from(new Set(records.map((r) => r.medicine))).sort();
  }, [records]);

  // Derive role-based filter constraints cleanly without cascading setState
  const effectiveFilters: SupplyFilters = React.useMemo(() => {
    if (currentRole === 'district_officer') {
      return {
        ...filters,
        state: filters.state && filters.state !== 'All' ? filters.state : 'Madhya Pradesh',
        district: filters.district && filters.district !== 'All' ? filters.district : 'Dewas',
      };
    } else if (currentRole === 'phc_staff') {
      return {
        ...filters,
        state: 'Madhya Pradesh',
        district: 'Dewas',
        search: filters.search || 'PHC Rampur',
      };
    }
    return filters;
  }, [filters, currentRole]);

  // Fetch data via unified API client
  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      try {
        setError(null);
        const res = await ApiClient.getSnapshot(effectiveFilters);
        if (!isCancelled) {
          setRecords(res.records);
          setKpi(res.kpi);
          setPhcMasters(res.phc_masters);
          if (res.active_scenario && !parentActiveScenario) {
            onScenarioChange?.(res.active_scenario);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to load supply chain snapshot');
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [effectiveFilters, retryCount, onScenarioChange, parentActiveScenario]);

  const handleRunScenario = async (params: OutbreakScenarioParams) => {
    const result = await ApiClient.runScenario(params);
    onScenarioChange?.(result);
    setRetryCount((c) => c + 1); // Triggers re-fetch of snapshot from API
  };

  const handleResetScenario = async () => {
    await ApiClient.resetScenario();
    onScenarioChange?.(null);
    setRetryCount((c) => c + 1);
  };

  const handleDraftAlert = (itemOrPhc: any, deficitItem?: SnapshotRecord) => {
    if (onSelectPhcForAction) {
      onSelectPhcForAction(itemOrPhc, deficitItem);
    }
    if (onNavigateToView) {
      onNavigateToView('alerts');
    }
  };

  const handleFindSurplus = (itemOrPhc: any, deficitItem?: SnapshotRecord) => {
    if (onSelectPhcForAction) {
      onSelectPhcForAction(itemOrPhc, deficitItem);
    }
    if (onNavigateToView) {
      onNavigateToView('redistribution');
    }
  };

  if (loading && !kpi) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
        <span className="text-sm font-medium">{t.common.loading}</span>
      </div>
    );
  }

  if (error && !kpi) {
    return (
      <div className="p-8 text-center rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 max-w-lg mx-auto my-12">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-bold">{t.common.error}</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px]"
        >
          {t.common.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Outbreak Scenario Simulation Panel */}
      <SimulateOutbreakPanel
        currentLanguage={currentLanguage}
        activeScenario={activeScenario}
        onRunScenario={handleRunScenario}
        onResetScenario={handleResetScenario}
      />

      {/* 2. KPI Strip */}
      {kpi && (
        <div data-demo-target="kpi-strip">
          <KpiStrip
            kpi={kpi}
            currentLanguage={currentLanguage}
            onFilterCriticalClick={() => setFilters((prev) => ({ ...prev, risk_level: 'Critical' }))}
            onFilterExpiringClick={() => setFilters((prev) => ({ ...prev, risk_level: 'Low' }))}
          />
        </div>
      )}

      {/* 3. Filters Bar */}
      <FiltersBar
        filters={filters}
        onFilterChange={setFilters}
        currentLanguage={currentLanguage}
        availableDistricts={availableDistricts}
        availableMedicines={availableMedicines}
      />

      {/* 3. Interactive Map of India with Side Panel */}
      <div data-demo-target="national-map">
        <InteractiveMap
          phcMasters={phcMasters}
          records={records}
          selectedState={filters.state || 'All'}
          onStateSelect={(st) => setFilters((prev) => ({ ...prev, state: st, district: 'All' }))}
          currentLanguage={currentLanguage}
          onDraftAlertClick={(phc, item) => handleDraftAlert(phc, item)}
          onFindSurplusClick={(phc, item) => handleFindSurplus(phc, item)}
        />
      </div>

      {/* 4. "Will Run Out Soon" Top 10 Acute Stockout List */}
      <AtRiskTable
        records={records}
        currentLanguage={currentLanguage}
        onFindSurplusClick={(rec) => handleFindSurplus(rec)}
        onDraftAlertClick={(rec) => handleDraftAlert(rec)}
      />

      {/* 5. 30-Day Footfall & ARIMA+ Forecast Trend Chart */}
      <TrendChart
        currentLanguage={currentLanguage}
        selectedMedicine={filters.medicine && filters.medicine !== 'All' ? filters.medicine : 'Paracetamol 500mg tab'}
      />
    </div>
  );
}

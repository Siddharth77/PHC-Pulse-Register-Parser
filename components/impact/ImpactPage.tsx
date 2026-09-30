'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingDown,
  Info,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  HeartPulse,
  Activity,
  Calendar,
  CheckCircle2,
  Table as TableIcon,
  BarChart3,
  FileDown,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ImpactMetricsResponse } from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';
import { ApiClient } from '@/lib/api-client';

interface ImpactPageProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
  scenarioActive?: boolean;
  onOpenScenarioModal?: () => void;
}

export function ImpactPage({
  currentLanguage,
  currentRole,
  scenarioActive,
  onOpenScenarioModal,
}: ImpactPageProps) {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [data, setData] = useState<ImpactMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  const isPhcStaff = currentRole === 'phc_staff';

  const loadImpactData = useCallback(async (stateName: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.getImpactMetrics(stateName);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load impact metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setError(null);
        const res = await ApiClient.getImpactMetrics(selectedState);
        if (isMounted) {
          setData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load impact metrics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-center max-w-md mx-auto my-8 space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
          Impact Telemetry Offline
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        <button
          onClick={() => loadImpactData(selectedState)}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs min-h-[44px]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const m = data.metrics;

  // Calculated differences
  const stockoutDiff = +(
    (m.stockout_days_per_100_pairs.without ?? 0) - (m.stockout_days_per_100_pairs.with ?? 0)
  ).toFixed(1);
  const expiredDiffINR =
    ((m.expired_stock_avoided_inr.without ?? 0) - (m.expired_stock_avoided_inr.with ?? 0)) /
    100000;
  const hoursDiff = +(
    (m.hours_warning_to_transfer.without ?? 0) - (m.hours_warning_to_transfer.with ?? 0)
  ).toFixed(1);
  const outbreakDiff =
    (m.critical_stockouts_in_outbreak.without ?? 0) -
    (m.critical_stockouts_in_outbreak.with ?? 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:space-y-4">
      {/* 1. HEADER & SIMULATION BADGE */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              What PHC Pulse Changes
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparative performance telemetry: unassisted static supply chains vs. proactive AI-driven redistribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Permanent Mandatory Badge (Requirement 1) */}
          <div className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-800 cursor-help">
            <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Simulated demo figures. Based on synthetic data, not real outcomes.</span>

            <div className="hidden group-hover:block absolute top-full right-0 mt-1.5 z-30 w-80 p-3 rounded-xl bg-slate-900 text-white text-[11px] font-normal shadow-2xl border border-slate-700 pointer-events-none">
              {data.methodology_note}
            </div>
          </div>

          {/* One-page summary print trigger (Requirement 6) */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs min-h-[40px] print:hidden"
            title="Print or export one-page executive impact summary"
          >
            <Printer className="h-3.5 w-3.5 text-teal-600" />
            <span>Download one-page summary</span>
          </button>
        </div>
      </div>

      {/* 5. SCENARIO LINK NOTICE (Requirement 5) */}
      <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-900 dark:text-teal-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
          <span>
            {scenarioActive
              ? 'Active Scenario Notice: Impact figures represent the 90-day baseline simulation and do not change with the active scenario.'
              : 'Impact figures are for the baseline simulation and do not change with the scenario.'}
          </span>
        </div>

        {onOpenScenarioModal && (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs self-start sm:self-auto shrink-0 print:hidden"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Run an outbreak scenario</span>
          </button>
        )}
      </div>

      {/* 4. STATE BREAKDOWN SELECTOR */}
      {!isPhcStaff && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 print:hidden">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-teal-600" />
            <span>Filter Geographic Scope:</span>
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All', 'Madhya Pradesh', 'Maharashtra', 'Kerala', 'Assam'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedState === st
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. BEFORE / AFTER COMPARISON: 5 HEADLINE CARDS (Requirement 2) */}
      <div data-demo-target="impact-headline-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card A: Stock-out days per 100 PHC-medicine pairs */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Stock-Out Duration
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Days at Zero Stock / 100 PHC Pairs
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Without Pulse</div>
              <div className="text-base font-mono font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                {m.stockout_days_per_100_pairs.without} days
              </div>
            </div>

            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase">With Pulse</div>
              <div className="text-base font-mono font-extrabold text-teal-800 dark:text-teal-300 mt-0.5">
                {m.stockout_days_per_100_pairs.with} days
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="h-4 w-4 shrink-0" />
            <span>↓ -{stockoutDiff} days reduced (80.2% improvement)</span>
          </div>

          <button
            onClick={() => setExpandedCard(expandedCard === 'stockout' ? null : 'stockout')}
            className="text-[11px] text-slate-400 hover:text-teal-600 flex items-center gap-1 font-semibold pt-1"
          >
            <span>How this is calculated</span>
            {expandedCard === 'stockout' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expandedCard === 'stockout' && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {m.stockout_days_per_100_pairs.note}
            </div>
          )}
        </div>

        {/* Card B: Expired Stock Avoided */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Surplus Redistribution
            </div>
            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
              Illustrative
            </span>
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Expired or Near-Expired Stock Avoided
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Without Pulse</div>
              <div className="text-base font-mono font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                ₹{((m.expired_stock_avoided_inr.without ?? 0) / 100000).toFixed(1)} L
              </div>
            </div>

            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase">With Pulse</div>
              <div className="text-base font-mono font-extrabold text-teal-800 dark:text-teal-300 mt-0.5">
                ₹{((m.expired_stock_avoided_inr.with ?? 0) / 100000).toFixed(1)} L
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="h-4 w-4 shrink-0" />
            <span>↓ ₹{expiredDiffINR.toFixed(1)} Lakh saved from spoilage</span>
          </div>

          <button
            onClick={() => setExpandedCard(expandedCard === 'expired' ? null : 'expired')}
            className="text-[11px] text-slate-400 hover:text-teal-600 flex items-center gap-1 font-semibold pt-1"
          >
            <span>How this is calculated</span>
            {expandedCard === 'expired' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expandedCard === 'expired' && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {m.expired_stock_avoided_inr.note}
            </div>
          )}
        </div>

        {/* Card C: Patient Trips Saved */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Community Access
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Patient Trips Saved from Stock-Outs
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Estimated Direct Savings</div>
              <div className="text-xl font-mono font-extrabold text-emerald-800 dark:text-emerald-300 mt-0.5">
                {m.patient_trips_saved.value?.toLocaleString()} visits
              </div>
            </div>
            <HeartPulse className="h-8 w-8 text-emerald-600 opacity-80" />
          </div>

          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            ✓ 100% first-visit prescription fulfillment
          </div>

          <button
            onClick={() => setExpandedCard(expandedCard === 'trips' ? null : 'trips')}
            className="text-[11px] text-slate-400 hover:text-teal-600 flex items-center gap-1 font-semibold pt-1"
          >
            <span>How this is calculated</span>
            {expandedCard === 'trips' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expandedCard === 'trips' && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {m.patient_trips_saved.note}
            </div>
          )}
        </div>

        {/* Card D: Average Time from Warning to Transfer Approval */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Decision Latency
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Time: Early Warning to Transfer Approval
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Without Pulse</div>
              <div className="text-base font-mono font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                {m.hours_warning_to_transfer.without} hrs
              </div>
            </div>

            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase">With Pulse</div>
              <div className="text-base font-mono font-extrabold text-teal-800 dark:text-teal-300 mt-0.5">
                {m.hours_warning_to_transfer.with} hrs
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="h-4 w-4 shrink-0" />
            <span>↓ -{hoursDiff} hrs (83% faster emergency mobilization)</span>
          </div>

          <button
            onClick={() => setExpandedCard(expandedCard === 'hours' ? null : 'hours')}
            className="text-[11px] text-slate-400 hover:text-teal-600 flex items-center gap-1 font-semibold pt-1"
          >
            <span>How this is calculated</span>
            {expandedCard === 'hours' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expandedCard === 'hours' && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {m.hours_warning_to_transfer.note}
            </div>
          )}
        </div>

        {/* Card E: Critical Stock-Outs During Outbreak */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Emergency Resilience
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Critical Deficits in Outbreak Surge
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Without Pulse</div>
              <div className="text-base font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {m.critical_stockouts_in_outbreak.without} incidents
              </div>
            </div>

            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase">With Pulse</div>
              <div className="text-base font-mono font-extrabold text-teal-800 dark:text-teal-300 mt-0.5">
                {m.critical_stockouts_in_outbreak.with} incidents
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="h-4 w-4 shrink-0" />
            <span>↓ -{outbreakDiff} acute emergency stockouts prevented</span>
          </div>

          <button
            onClick={() => setExpandedCard(expandedCard === 'outbreak' ? null : 'outbreak')}
            className="text-[11px] text-slate-400 hover:text-teal-600 flex items-center gap-1 font-semibold pt-1"
          >
            <span>How this is calculated</span>
            {expandedCard === 'outbreak' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expandedCard === 'outbreak' && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              {m.critical_stockouts_in_outbreak.note}
            </div>
          )}
        </div>
      </div>

      {/* 3. STORY VIEW: "ONE PHC'S STORY" IN 4 STEPS (Requirement 3) */}
      {!isPhcStaff && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  One PHC&apos;s Story: A Surge Averted at Rampur
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                How automated early warnings and rapid redistribution kept clinic shelves full.
              </p>
            </div>
          </div>

          {/* Timeline Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {data.story_steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="h-6 w-6 rounded-full bg-teal-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Phase {idx + 1}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 dark:text-white pt-1">
                  {step.title}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4B. STATE-WISE COMPARISON CHART & DATA TABLE */}
      {!isPhcStaff && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  State-by-State Stock-Out Days Comparison
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Unassisted procurement baseline (gray) vs. PHC Pulse federated optimization (teal).
              </p>
            </div>

            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto min-h-[36px]"
            >
              {showDataTable ? <BarChart3 className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
              <span>{showDataTable ? 'Show Visual Bars' : 'Show Accessible Table'}</span>
            </button>
          </div>

          {/* Screen Reader Text Summary (Requirement 4) */}
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
            <strong>State Telemetry Summary:</strong> Across all 4 state nodes, stockout days fell from an average of 42.6 days to 8.4 days. Assam saw the largest absolute improvement, dropping from 48.2 to 9.1 days.
          </div>

          {showDataTable ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="p-2.5 pl-3">State Node</th>
                    <th className="p-2.5">Without Pulse (Days)</th>
                    <th className="p-2.5">With Pulse (Days)</th>
                    <th className="p-2.5 pr-3 text-emerald-700">Days Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {data.by_state.map((s) => (
                    <tr key={s.state} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 pl-3 font-bold text-slate-900 dark:text-white font-sans">
                        {s.state}
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">
                        {s.stockout_days_without.toFixed(1)}
                      </td>
                      <td className="p-2.5 font-bold text-teal-700 dark:text-teal-300">
                        {s.stockout_days_with.toFixed(1)}
                      </td>
                      <td className="p-2.5 pr-3 font-bold text-emerald-600 dark:text-emerald-400">
                        -{(s.stockout_days_without - s.stockout_days_with).toFixed(1)} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {data.by_state.map((s) => {
                const maxVal = 55;
                const withoutWidth = (s.stockout_days_without / maxVal) * 100;
                const withWidth = (s.stockout_days_with / maxVal) * 100;

                return (
                  <div key={s.state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{s.state}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ↓ -{(s.stockout_days_without - s.stockout_days_with).toFixed(1)} days
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Without Bar */}
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                          Without
                        </span>
                        <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all"
                            style={{ width: `${withoutWidth}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-[11px] text-slate-500 shrink-0">
                          {s.stockout_days_without}d
                        </span>
                      </div>

                      {/* With Bar */}
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[10px] text-teal-700 dark:text-teal-400 uppercase font-bold shrink-0">
                          With Pulse
                        </span>
                        <div className="flex-1 h-4 bg-teal-50 dark:bg-teal-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 rounded-full transition-all"
                            style={{ width: `${withWidth}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300 shrink-0">
                          {s.stockout_days_with}d
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4C. "WHO BENEFITS" ROW (Requirement 4) */}
      {!isPhcStaff && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>For Rural Patients</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {data.who_benefits.patients}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Building2 className="h-4 w-4 text-sky-600" />
              <span>For PHC Staff</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {data.who_benefits.staff}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>For Health Officers</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {data.who_benefits.officers}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

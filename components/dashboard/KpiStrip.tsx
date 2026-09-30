'use client';

import React from 'react';
import {
  Building2,
  AlertOctagon,
  CalendarClock,
  Bed,
  UserCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { KpiSummary } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

interface KpiStripProps {
  kpi: KpiSummary;
  currentLanguage: LanguageCode;
  onFilterCriticalClick?: () => void;
  onFilterExpiringClick?: () => void;
}

export function KpiStrip({
  kpi,
  currentLanguage,
  onFilterCriticalClick,
  onFilterExpiringClick,
}: KpiStripProps) {
  const t = TRANSLATIONS[currentLanguage].kpi;

  return (
    <section aria-label="Key Performance Indicators" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: PHCs Reporting Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">{t.reportingToday}</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {kpi.phcs_reporting_today}{' '}
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                / {kpi.total_phcs}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{kpi.reporting_percentage}% {t.facilities}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Critical Stock-Outs (<= 3 Days) */}
        <div
          onClick={onFilterCriticalClick}
          className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            kpi.critical_stockouts_count > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:border-rose-300 dark:hover:border-rose-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
          role="button"
          tabIndex={0}
          title="Click to filter critical facilities"
        >
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">{t.criticalStockouts}</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {kpi.critical_stockouts_count}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>{t.itemsAtRisk}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Expiring Surplus (90 Days) */}
        <div
          onClick={onFilterExpiringClick}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-all"
          role="button"
          tabIndex={0}
          title="Click to view near-expiry surplus"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">{t.expiringSurplus}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {kpi.expiring_surplus_batches}
            </div>
            <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <span>{t.batchesSurplus}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Beds Available */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">{t.bedsAvailable}</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {kpi.beds_available_percentage}%
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{kpi.beds_available_count} {t.availableOfTotal}</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Staff Present On Duty */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">{t.staffPresent}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {kpi.staff_attendance_percentage}%
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{kpi.staff_present_count} / {kpi.total_staff_sanctioned} {t.onDutySanctioned}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

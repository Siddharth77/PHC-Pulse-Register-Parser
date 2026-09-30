'use client';

import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  BellRing,
  Snowflake,
  CalendarClock,
} from 'lucide-react';
import { SnapshotRecord, RiskLevel } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

interface AtRiskTableProps {
  records: SnapshotRecord[];
  currentLanguage: LanguageCode;
  onFindSurplusClick?: (record: SnapshotRecord) => void;
  onDraftAlertClick?: (record: SnapshotRecord) => void;
}

export function AtRiskTable({
  records,
  currentLanguage,
  onFindSurplusClick,
  onDraftAlertClick,
}: AtRiskTableProps) {
  const t = TRANSLATIONS[currentLanguage].table;
  const tRisks = TRANSLATIONS[currentLanguage].risks;

  // Top 10 sorted strictly by days of cover ascending (urgency first)
  const topAtRisk = [...records]
    .sort((a, b) => a.days_of_cover - b.days_of_cover)
    .slice(0, 10);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{tRisks.Critical}</span>
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-800">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <span>{tRisks.High}</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{tRisks.Medium}</span>
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{tRisks.Low}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.title}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
              Top 10 Acute Facilities
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Table */}
      {topAtRisk.length === 0 ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          {t.emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-4">{t.phc}</th>
                <th scope="col" className="py-3 px-4">{t.district}</th>
                <th scope="col" className="py-3 px-4">{t.medicine}</th>
                <th scope="col" className="py-3 px-4 text-right">{t.stock}</th>
                <th scope="col" className="py-3 px-4 text-right">{t.dailyDemand}</th>
                <th scope="col" className="py-3 px-4 text-center">{t.daysOfCover}</th>
                <th scope="col" className="py-3 px-4">{t.risk}</th>
                <th scope="col" className="py-3 px-4">{t.nearestExpiry}</th>
                <th scope="col" className="py-3 px-4 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {topAtRisk.map((item, idx) => {
                const isNearExpiry = item.nearest_expiry && item.nearest_expiry <= "2026-12-31";
                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Facility */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.phc_name}</div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {item.phc_id}
                      </div>
                    </td>

                    {/* District & State */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div>{item.district}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.state}
                      </div>
                    </td>

                    {/* Medicine with Cold-Chain indicator */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.medicine}
                      </div>
                      {item.cold_chain && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-sky-700 dark:text-sky-300 font-semibold mt-0.5">
                          <Snowflake className="h-3 w-3" />
                          <span>Cold Chain (2°C–8°C)</span>
                        </div>
                      )}
                    </td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {item.stock.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                    </td>

                    {/* Daily Demand */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {item.daily_demand} / day
                    </td>

                    {/* Days of Cover */}
                    <td className="py-3.5 px-4 text-center">
                      <div
                        className={`inline-block font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-md ${
                          item.days_of_cover <= 3.0
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            : item.days_of_cover <= 7.0
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
                            : item.days_of_cover <= 14.0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        }`}
                      >
                        {item.days_of_cover}d
                      </div>
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3.5 px-4">
                      {getRiskBadge(item.risk_level)}
                    </td>

                    {/* Nearest Expiry */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        {isNearExpiry && (
                          <span title="Near Expiry (<90d)">
                            <CalendarClock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                        <span>{item.nearest_expiry || "N/A"}</span>
                      </div>
                    </td>

                    {/* Action First: Clear Next Step Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onFindSurplusClick && onFindSurplusClick(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs transition-colors min-h-[44px]"
                          title="Search nearby clinics with surplus stock"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          <span>{t.findSurplus}</span>
                        </button>

                        <button
                          onClick={() => onDraftAlertClick && onDraftAlertClick(item)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors min-h-[44px]"
                          title="Draft SMS alert for district leadership"
                        >
                          <BellRing className="h-3.5 w-3.5" />
                          <span>Alert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

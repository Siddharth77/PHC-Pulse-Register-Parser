'use client';

import React from 'react';
import {
  TrendingDown,
  Building2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowDownRight,
  Info,
  Lock,
} from 'lucide-react';
import { FederatedNodeMetric } from '@/types/supply-chain';
import { UserRole } from '@/lib/config';

interface StateNodeCardsProps {
  nodes: FederatedNodeMetric[];
  selectedState: string;
  onSelectState: (state: string) => void;
  currentRole: UserRole;
}

export function StateNodeCards({
  nodes,
  selectedState,
  onSelectState,
  currentRole,
}: StateNodeCardsProps) {
  // Determine if officer has full drilldown permission for specific state
  const isStateOfficer = currentRole === 'state_national_officer';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            State Node Performance & Error Reductions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Local Forecast Error (Mean Absolute Percentage Error · lower is better)
          </p>
        </div>

        <div className="text-[11px] text-slate-400 font-semibold hidden sm:block">
          {isStateOfficer ? 'Full State Authorization' : 'Aggregate Telemetry View'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map((node) => {
          const isSelected = selectedState === node.state;
          const improvement = +(node.mape_local_only - node.mape_federated).toFixed(1);
          const pctGain = +(
            ((node.mape_local_only - node.mape_federated) / node.mape_local_only) *
            100
          ).toFixed(1);

          return (
            <div
              key={node.state}
              onClick={() => onSelectState(node.state)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 shadow-xs ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              {/* Top Row: State Name & PHC Count */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {node.state}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                      {node.state_code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{node.phc_count} PHC Facilities</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Round {node.last_round}</span>
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              {/* Middle Row: Before vs After Federation Metrics */}
              <div className="grid grid-cols-2 gap-3 my-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Before Federation
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                    {node.mape_local_only.toFixed(1)}% <span className="text-[10px] font-sans">MAPE</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Isolated local model</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400">
                    After Federation
                  </div>
                  <div className="text-base font-mono font-extrabold text-teal-700 dark:text-teal-300 mt-0.5">
                    {node.mape_federated.toFixed(1)}% <span className="text-[10px] font-sans">MAPE</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingDown className="h-3 w-3" />
                    <span>↓ -{improvement.toFixed(1)}% error ({pctGain}% gain)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Note: State Pattern */}
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Epidemiological Profile & Demand Driver:
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 italic">
                  &ldquo;{node.pattern_note}&rdquo;
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Globe2, ShieldCheck, Cpu, ArrowUpRight, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export function FederatedNetworkView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              National Inter-State Federated Health Supply Chain Network
            </h2>
            <p className="text-xs text-slate-400">
              Cross-state public health demand forecasting powered by Privacy-Preserving Federated Aggregation (Madhya Pradesh · Maharashtra · Kerala · Assam)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Node MP */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                <span>🏛️ Madhya Pradesh (MP)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Active Node
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">NHM Madhya Pradesh Hub</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Primary Focus: Central heat & monsoon surge (Dengue, Malaria, Snakebite in Mandla/Balaghat).
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Model Gain: +18.4%</span>
              <span>Encrypted weights</span>
            </div>
          </div>

          {/* Node MH */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                <span>🏙️ Maharashtra (MH)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Active Node
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Public Health Dept Maharashtra</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Primary Focus: Mixed urban-tribal respiratory & vector surveillance (Pune, Nagpur, Nandurbar).
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Model Gain: +15.2%</span>
              <span>Encrypted weights</span>
            </div>
          </div>

          {/* Node KL */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <span>🌴 Kerala (KL)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Active Node
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Department of Health Kerala</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Primary Focus: Dual-monsoon leptospirosis, high chronic disease load (Metformin/Insulin cold-chain).
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Model Gain: +19.1%</span>
              <span>Encrypted weights</span>
            </div>
          </div>

          {/* Node AS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <span>🌊 Assam (AS)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Active Node
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">National Health Mission Assam</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Primary Focus: Brahmaputra flood season diarrhoeal and anti-snake venom emergency dispatch.
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Model Gain: +21.0%</span>
              <span>Encrypted weights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Federated Sovereignty Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-teal-300">
            <Lock className="h-4 w-4 text-teal-400" />
            <span>Absolute State Data Sovereignty Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under PHC Pulse Rule 4, <strong>zero patient-level or individual facility data leaves state boundaries</strong>. Each state trains its local forecasting weights on state health registers (NHM). Only differential mathematical gradients and aggregated seasonal signal vectors are shared with the national federated aggregator.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero raw patient records or OPD tokens exposed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Cryptographic gradient aggregation verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Fully compliant with National Public Health Data Policies</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-teal-300">
            <Cpu className="h-4 w-4 text-teal-400" />
            <span>Recent Inter-State Federated Model Updates</span>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-slate-200">
                Monsoon Vector Gradient Transfer (Cycle 48)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kerala shared dual-monsoon leptospirosis wave gradients. Madhya Pradesh used this to improve rural fever surge stock estimates by 16.8 days earlier notice.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-slate-200">
                Flood Season Anti-Snake Venom Buffer Heuristics
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Assam Brahmaputra flood response heuristics helped optimize cold-chain emergency generator thresholds across tribal district depots in Mandla and Gadchiroli.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

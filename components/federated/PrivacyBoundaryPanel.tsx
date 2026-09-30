'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Share2,
  Info,
  Server,
  HelpCircle,
} from 'lucide-react';

interface PrivacyBoundaryPanelProps {
  sharedItems: string[];
  neverSharedItems: string[];
}

export function PrivacyBoundaryPanel({
  sharedItems,
  neverSharedItems,
}: PrivacyBoundaryPanelProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Header & Simulation Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Data Sovereignty & Privacy Boundary Architecture
          </h3>
        </div>

        {/* Simulation Badge with Tooltip (Requirement 6) */}
        <div className="group relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold border border-slate-200 dark:border-slate-700 cursor-help self-start sm:self-auto">
          <Info className="h-3 w-3 text-teal-600" />
          <span>Interactive Simulation</span>

          <div className="hidden group-hover:block absolute bottom-full right-0 mb-1 z-30 w-72 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-normal shadow-xl border border-slate-700 pointer-events-none">
            This demo simulates federated learning across four state nodes using synthetic data. The training rounds and accuracy values are illustrative.
          </div>
        </div>
      </div>

      {/* Rationale explanation text */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Under constitutional public health frameworks, health facility inventories and patient attendance registers are managed exclusively by each respective state. PHC Pulse is <strong>designed to keep data within state boundaries</strong> while allowing machine learning algorithms to collaboratively improve forecast accuracy.
      </p>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Column 1: Shared between states */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
            <Share2 className="h-4 w-4 text-teal-600" />
            <span>Shared Between States (Model Updates Only)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            {sharedItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Never shared */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
            <Lock className="h-4 w-4 text-rose-600" />
            <span>Never Shared (Strictly State-Bound)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            {neverSharedItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

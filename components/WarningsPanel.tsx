'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, Check } from 'lucide-react';

interface WarningsPanelProps {
  warnings: string[];
  patientDetailsStripped?: boolean;
}

export function WarningsPanel({ warnings, patientDetailsStripped = true }: WarningsPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      {/* Patient Privacy Banner (Rule 7) */}
      <div className="flex items-center justify-between rounded-lg bg-teal-950/30 border border-teal-800/50 px-3.5 py-2.5 text-xs text-teal-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
          <div>
            <span className="font-semibold text-teal-300">Rule 7 Privacy Guardian Active: </span>
            <span className="text-teal-200/90">
              All patient names, OPD tokens, and personal health details are permanently scrubbed from registers prior to processing.
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 font-mono text-[10px] shrink-0">
          <Check className="h-3 w-3" />
          <span>Sovereign Guard</span>
        </div>
      </div>

      {/* Warnings List (Rule 6) */}
      {warnings && warnings.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Inspection Warnings ({warnings.length})</span>
          </div>

          <div className="space-y-1.5">
            {warnings.map((warn, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 px-3 py-2 text-xs text-amber-200/90"
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{warn}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>No legibility warnings detected. Register header and rows are cleanly defined.</span>
        </div>
      )}
    </div>
  );
}

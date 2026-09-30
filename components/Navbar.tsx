'use client';

import React from 'react';
import { ShieldCheck, FileSpreadsheet, Sparkles, RefreshCw, Download, Presentation } from 'lucide-react';

interface NavbarProps {
  activeView: 'parser' | 'review' | 'copilot' | 'qa' | 'federated' | 'deck';
  setActiveView: (view: 'parser' | 'review' | 'copilot' | 'qa' | 'federated' | 'deck') => void;
  onNewScan: () => void;
  onExportJson: () => void;
  recordCount: number;
  reviewCount: number;
}

export function Navbar({
  activeView,
  setActiveView,
  onNewScan,
  onExportJson,
  recordCount,
  reviewCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('parser')}
            className="text-left group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:border-teal-400 transition-colors">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                <span>PHC Pulse</span>
                <span className="text-xs font-normal text-teal-400 px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/50">
                  Register Parser
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Federated Node · Inter-State Network
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean 4–6 text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveView('parser')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'parser'
                ? 'bg-slate-800 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Register Ingestion
          </button>

          <button
            onClick={() => setActiveView('review')}
            className={`relative px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'review'
                ? 'bg-slate-800 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Stock Ledger</span>
            {recordCount > 0 && (
              <span className="text-xs tabular-nums text-slate-400 font-mono">
                ({recordCount})
              </span>
            )}
            {reviewCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                {reviewCount} review
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('copilot')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'copilot'
                ? 'bg-slate-800 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span>Supply Co-Pilot</span>
          </button>

          <button
            onClick={() => setActiveView('qa')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'qa'
                ? 'bg-slate-800 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>Q&A Agent</span>
          </button>

          <button
            onClick={() => setActiveView('federated')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'federated'
                ? 'bg-slate-800 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Federated Network
          </button>

          <button
            onClick={() => setActiveView('deck')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'deck'
                ? 'bg-slate-800 text-teal-300 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Presentation className="h-4 w-4 text-teal-400" />
            <span>Pitch Deck</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportJson}
            disabled={recordCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="View or copy output JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onNewScan}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md shadow-sm transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>New Parse</span>
          </button>
        </div>
      </div>
    </header>
  );
}

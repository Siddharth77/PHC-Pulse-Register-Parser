'use client';

import React from 'react';
import {
  Sparkles,
  Bot,
  HelpCircle,
  Building2,
  Share2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FederatedNodeMetric } from '@/types/supply-chain';

interface StateInsightExplainerProps {
  nodes: FederatedNodeMetric[];
  selectedState: string;
  onSelectState: (state: string) => void;
}

export function StateInsightExplainer({
  nodes,
  selectedState,
  onSelectState,
}: StateInsightExplainerProps) {
  const activeNode = nodes.find((n) => n.state === selectedState) || nodes[0];

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Header & State Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              &ldquo;What Did This State Learn?&rdquo;
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-state epidemiological pattern transfer without raw record sharing
            </p>
          </div>
        </div>

        {/* State Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Select Node:</span>
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="text-xs font-bold p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[40px]"
            aria-label="Select state node to view federated learning insights"
          >
            {nodes.map((n) => (
              <option key={n.state} value={n.state}>
                {n.state} ({n.state_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Insight Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
            <Building2 className="h-4 w-4 text-teal-600" />
            <span>Learned Intelligence for {activeNode.state}:</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
            <Bot className="h-3 w-3" />
            <span>Explained by Federated AI</span>
          </span>
        </div>

        {/* The API-Provided Insight Sentence (Never computed by UI) */}
        <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed pl-2 border-l-3 border-teal-600">
          &ldquo;{activeNode.insight}&rdquo;
        </div>

        {/* Requirement 5: "How to read this" Line */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            <strong>How to read this:</strong> Kerala saw this seasonal pattern first. Assam benefits from updated model weights without ever seeing Kerala&apos;s records.
          </span>
        </div>
      </div>
    </div>
  );
}

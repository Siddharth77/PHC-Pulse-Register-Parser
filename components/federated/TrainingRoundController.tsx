'use client';

import React from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Database,
  Send,
  Cpu,
  DownloadCloud,
  Loader2,
} from 'lucide-react';

interface TrainingRoundControllerProps {
  currentRound: number;
  totalRounds: number;
  isSimulating: boolean;
  activeStepIndex: number;
  onSimulateRound: () => void;
  onResetRounds: () => void;
}

const TRAINING_STEPS = [
  {
    step: 1,
    title: 'Local Training',
    desc: 'Each state trains on its own data',
    icon: Database,
  },
  {
    step: 2,
    title: 'Model Dispatch',
    desc: 'States send model updates',
    icon: Send,
  },
  {
    step: 3,
    title: 'FedAvg Synthesis',
    desc: 'Updates are combined',
    icon: Cpu,
  },
  {
    step: 4,
    title: 'Global Broadcast',
    desc: 'Improved model returns to each state',
    icon: DownloadCloud,
  },
];

export function TrainingRoundController({
  currentRound,
  totalRounds,
  isSimulating,
  activeStepIndex,
  onSimulateRound,
  onResetRounds,
}: TrainingRoundControllerProps) {
  const isMaxRound = currentRound >= totalRounds;

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
      {/* Top Bar: Round Counter & Action Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Federated Training Orchestration
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-extrabold border border-slate-200 dark:border-slate-700">
              Round {currentRound} of {totalRounds}
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            Synchronous Multi-State Learning Cycle
          </h2>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetRounds}
            disabled={isSimulating || currentRound === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors disabled:opacity-40 min-h-[44px]"
            title="Reset training to initial state (Round 0)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Round 0</span>
          </button>

          <button
            type="button"
            onClick={onSimulateRound}
            disabled={isSimulating || isMaxRound}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-40 min-h-[44px] active:scale-[0.98]"
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Simulating Round {currentRound + 1}...</span>
              </>
            ) : isMaxRound ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Max Rounds Reached (10/10)</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Simulate next training round</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4-Step Sequence Progress Visualizer (Requirement 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {TRAINING_STEPS.map((stepItem, idx) => {
          const StepIcon = stepItem.icon;
          const isActive = isSimulating && activeStepIndex === idx;
          const isCompleted = currentRound > 0 && (!isSimulating || activeStepIndex > idx);

          return (
            <div
              key={stepItem.step}
              className={`p-3 rounded-xl border transition-all relative overflow-hidden ${
                isActive
                  ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/60 shadow-xs ring-2 ring-teal-500/20'
                  : isCompleted
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
              }`}
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-teal-600 text-white animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepItem.step}
                </span>

                <StepIcon
                  className={`h-4 w-4 ${
                    isActive
                      ? 'text-teal-600 animate-bounce'
                      : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                />
              </div>

              <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                {stepItem.title}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {stepItem.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

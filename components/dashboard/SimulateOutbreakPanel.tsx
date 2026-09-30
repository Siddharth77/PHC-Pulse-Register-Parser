'use client';

import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { OutbreakScenarioParams, OutbreakScenarioResult, DiseaseClass } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

interface SimulateOutbreakPanelProps {
  currentLanguage: LanguageCode;
  activeScenario: OutbreakScenarioResult | null;
  onRunScenario: (params: OutbreakScenarioParams) => Promise<void>;
  onResetScenario: () => Promise<void>;
}

export function SimulateOutbreakPanel({
  currentLanguage,
  activeScenario,
  onRunScenario,
  onResetScenario,
}: SimulateOutbreakPanelProps) {
  const t = TRANSLATIONS[currentLanguage];

  const [diseaseClass, setDiseaseClass] = useState<DiseaseClass>('fever_vector');
  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');
  const [demandIncrease, setDemandIncrease] = useState<number>(40);
  const [horizonDays, setHorizonDays] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const diseaseNames: Record<DiseaseClass, string> = {
    fever_vector: 'Fever & Dengue',
    diarrhoeal: 'Diarrhoeal & Enteric (ORS/Zinc)',
    respiratory: 'Respiratory Infections',
    chronic_metabolic: 'Diabetes / Chronic',
    emergency_trauma: 'Snakebite & Trauma',
  };

  const previewText = `Projected: +${demandIncrease}% ${diseaseNames[diseaseClass].toLowerCase()} in ${horizonDays} days`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRunning(true);
      await onRunScenario({
        disease_class: diseaseClass,
        states: selectedState === 'All' ? ['All'] : [selectedState],
        districts: ['All'],
        demand_increase_pct: demandIncrease,
        horizon_days: horizonDays,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-5 overflow-hidden transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Simulate Epidemic Outbreak</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                Outbreak Stress Test
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stress-test district buffer resilience by projecting seasonal spikes
            </p>
          </div>
        </div>

        {activeScenario && (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-colors min-h-[44px]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Reset to Live Baseline</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Disease Class Selector */}
          <div>
            <label htmlFor="outbreak-disease" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Disease Category
            </label>
            <select
              id="outbreak-disease"
              value={diseaseClass}
              onChange={(e) => setDiseaseClass(e.target.value as DiseaseClass)}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
            >
              <option value="fever_vector">Fever & Dengue / Malaria</option>
              <option value="diarrhoeal">Diarrhoeal & Enteric (ORS/Zinc)</option>
              <option value="respiratory">Respiratory Infections</option>
              <option value="chronic_metabolic">Diabetes / Chronic Load</option>
              <option value="emergency_trauma">Snakebite & Trauma</option>
            </select>
          </div>

          {/* 2. State Target */}
          <div>
            <label htmlFor="outbreak-state" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Geographic Region
            </label>
            <select
              id="outbreak-state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-1 focus:ring-teal-500 focus:outline-none min-h-[44px]"
            >
              <option value="Madhya Pradesh">Madhya Pradesh (Indore, Dewas, Mandla)</option>
              <option value="Maharashtra">Maharashtra (Pune, Satara, Nagpur)</option>
              <option value="Kerala">Kerala (Wayanad, Thiruvananthapuram)</option>
              <option value="Assam">Assam (Dhemaji, Kamrup, Cachar)</option>
              <option value="All">All 4 State Nodes</option>
            </select>
          </div>

          {/* 3. Demand Increase Slider (+10% to +200%) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="outbreak-demand" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Surge Demand
              </label>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                +{demandIncrease}%
              </span>
            </div>
            <input
              id="outbreak-demand"
              type="range"
              min="10"
              max="200"
              step="5"
              value={demandIncrease}
              onChange={(e) => setDemandIncrease(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>+10%</span>
              <span>+100%</span>
              <span>+200%</span>
            </div>
          </div>

          {/* 4. Forecast Horizon (Days) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="outbreak-horizon" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Projection Horizon
              </label>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                {horizonDays} Days
              </span>
            </div>
            <input
              id="outbreak-horizon"
              type="range"
              min="3"
              max="30"
              step="1"
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>3d</span>
              <span>14d</span>
              <span>30d</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Live One-Line Preview & Action Button */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Live Preview:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              &ldquo;{previewText}&rdquo;
            </span>
          </div>

          <button
            type="submit"
            disabled={isRunning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Simulating Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run Scenario</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { LanguageCode, UserRole } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';
import { ApiClient } from '@/lib/api-client';
import { TopBar } from '@/components/TopBar';
import { LeftNavigation, NavigationViewId } from '@/components/LeftNavigation';
import { CommandDashboard } from '@/components/dashboard/CommandDashboard';
import { OutbreakScenarioResult, PhcMaster, SnapshotRecord } from '@/types/supply-chain';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Presentation,
  Download,
} from 'lucide-react';

export default function AppShell() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('state_national_officer');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<NavigationViewId>('dashboard');

  const [activeScenario, setActiveScenario] = useState<OutbreakScenarioResult | null>(null);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // Sync theme with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = TRANSLATIONS[currentLanguage];

  // Storyline Demo Trigger: Step-by-step automated demonstration
  const handleTriggerDemo = async () => {
    try {
      setIsDemoRunning(true);
      setDemoStep(1);
      // Step 1: Switch to State/National Officer on Dashboard
      setCurrentRole('state_national_officer');
      setActiveView('dashboard');

      // Step 2: Trigger +40% fever/dengue surge scenario in Madhya Pradesh
      const scenario = await ApiClient.runScenario({
        disease_class: 'fever_vector',
        states: ['Madhya Pradesh'],
        demand_increase_pct: 40,
        horizon_days: 10,
      });
      setActiveScenario(scenario);
      setDemoStep(2);
    } catch (err) {
      console.error('Demo error:', err);
    } finally {
      setIsDemoRunning(false);
    }
  };

  const handleResetScenario = async () => {
    await ApiClient.resetScenario();
    setActiveScenario(null);
    setDemoStep(0);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors font-sans pb-16 lg:pb-0">
        {/* Top Command Bar */}
        <TopBar
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          activeScenario={activeScenario}
          onResetScenario={handleResetScenario}
          onTriggerDemo={handleTriggerDemo}
        />

        {/* Demo Mode Notification Banner if Storyline Triggered */}
        {activeScenario && (
          <aside aria-label="Simulation Notice" className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                <strong>PROJECTION SCENARIO ACTIVE:</strong> {activeScenario.title} — {activeScenario.projected_surge_label}. (Projection model, not a confirmed outbreak event).
              </span>
              <button
                onClick={handleResetScenario}
                className="ml-auto underline hover:text-slate-800 font-bold shrink-0 min-h-[36px] px-2 flex items-center"
              >
                Reset to Live Baseline
              </button>
            </div>
          </aside>
        )}

        {/* Main Body: Left Sidebar + Central View */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Left Navigation (Desktop) & Bottom Tab Bar (Mobile) */}
          <LeftNavigation
            activeView={activeView}
            onViewChange={setActiveView}
            currentLanguage={currentLanguage}
            criticalAlertsCount={activeScenario ? 6 : 3}
            pendingTransfersCount={4}
          />

          {/* Central Workspace Canvas */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
            {/* View 1: Command Dashboard (Stage 1 Core) */}
            {activeView === 'dashboard' && (
              <CommandDashboard
                currentLanguage={currentLanguage}
                currentRole={currentRole}
                onNavigateToView={(v) => setActiveView(v)}
              />
            )}

            {/* Stage 2 Placeholder: Outbreak Scenarios & Alerts */}
            {activeView === 'alerts' && (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-8">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Stage 2 · Up Next for Review
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Outbreak Scenario & Emergency Alerts
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Stage 1 (App shell and Command Dashboard) is currently live and ready for your review. In Stage 2, you will be able to run dynamic disease class outbreak sliders (+10% to +200%), preview SMS dispatches (max 300 chars), and send WhatsApp alerts to district CMOs.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
                  >
                    Return to Stage 1 Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Stage 3 Placeholder: Redistribution Planner */}
            {activeView === 'redistribution' && (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-8">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Stage 3 · Up Next
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Redistribution Planner & One-Tap Approval
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Generates road-distance optimized transfers pairing deficit facilities with near-expiry surplus depots. Features printable transfer orders and Chief Medical Officer sign-off.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-6 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 min-h-[44px]"
                >
                  Return to Stage 1 Dashboard
                </button>
              </div>
            )}

            {/* Stage 4 Placeholder: Ask PHC Pulse */}
            {activeView === 'ask' && (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-8">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Stage 4 · Up Next
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Ask PHC Pulse Conversational Agent
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Interactive Gemini-powered Q&A workbench with voice input, grounded data sources, and strict officer scoping rules.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-6 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs min-h-[44px]"
                >
                  Return to Stage 1 Dashboard
                </button>
              </div>
            )}

            {/* Stage 5 Placeholder: Report Stock */}
            {activeView === 'report' && (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-8">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Stage 5 · Up Next
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Report Stock (Phone-First for PHC Staff)
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Three simple options: Photo of register, Voice note dispatch, or Quick text entry with offline synchronization.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-6 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs min-h-[44px]"
                >
                  Return to Stage 1 Dashboard
                </button>
              </div>
            )}

            {/* Stage 6 Placeholder: Federated Network */}
            {activeView === 'federated' && (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-8">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Stage 6 · Up Next
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Federated State Network & Privacy Architecture
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Visual node network across Madhya Pradesh, Maharashtra, Kerala, and Assam demonstrating encrypted model weight aggregation with zero raw patient data leakage.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-6 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs min-h-[44px]"
                >
                  Return to Stage 1 Dashboard
                </button>
              </div>
            )}

            {/* Stage 7 Placeholder: About */}
            {activeView === 'about' && (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto my-8">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Stage 7 · Documentation
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  About PHC Pulse & National Scaling Roadmap
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Full system architecture (Cloud Run, BigQuery, Gemini, Firebase) and evaluation pitch deck documentation.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/api/download-deck"
                    download="PHC_Pulse_Pitch_Deck.pptx"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs min-h-[44px]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download 12-Slide Pitch Deck (.PPTX)</span>
                  </a>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold min-h-[44px]"
                  >
                    Return to Stage 1 Dashboard
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Government Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>{t.footer.disclaimer}</span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {t.footer.sovereigntyNote}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

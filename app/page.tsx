'use client';

import React, { useState, useEffect } from 'react';
import { LanguageCode, UserRole } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';
import { ApiClient } from '@/lib/api-client';
import { TopBar } from '@/components/TopBar';
import { LeftNavigation, NavigationViewId } from '@/components/LeftNavigation';
import { CommandDashboard } from '@/components/dashboard/CommandDashboard';
import { AlertsPage } from '@/components/alerts/AlertsPage';
import { RedistributionPlannerPage } from '@/components/redistribution/RedistributionPlannerPage';
import { AskPulsePage } from '@/components/chat/AskPulsePage';
import { ReportStockPage } from '@/components/report/ReportStockPage';
import { FederatedNetworkPage } from '@/components/federated/FederatedNetworkPage';
import { ImpactPage } from '@/components/impact/ImpactPage';
import { AboutPage } from '@/components/about/AboutPage';
import { OutbreakScenarioResult, PhcMaster, SnapshotRecord, SupplyAlert } from '@/types/supply-chain';
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
  const [initialAlertDraft, setInitialAlertDraft] = useState<Partial<SupplyAlert> | null>(null);
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
          <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto">
            {/* View 1: Command Dashboard (Stage 1 Core) */}
            {activeView === 'dashboard' && (
              <CommandDashboard
                currentLanguage={currentLanguage}
                currentRole={currentRole}
                activeScenario={activeScenario}
                onScenarioChange={setActiveScenario}
                onNavigateToView={(v) => setActiveView(v)}
                onSelectPhcForAction={(phc, item) => {
                  if (item) {
                    setInitialAlertDraft({
                      title: `Critical Stockout Alert: ${item.medicine} at ${phc.phc_name}`,
                      severity: item.risk_level,
                      state: phc.state,
                      district: phc.district,
                      medicine: item.medicine,
                      days_of_cover: item.days_of_cover,
                      recommended_action: `Approve emergency redistribution to ${phc.phc_name} (${phc.district}).`,
                    });
                  }
                }}
              />
            )}

            {/* View 2: Outbreak Scenarios & Alerts (Stage 2) */}
            {activeView === 'alerts' && (
              <AlertsPage
                currentLanguage={currentLanguage}
                initialAlertDraft={initialAlertDraft}
                onClearInitialDraft={() => setInitialAlertDraft(null)}
                onNavigateToRedistribution={() => setActiveView('redistribution')}
              />
            )}

            {/* View 3: Redistribution Planner (Stage 3) */}
            {activeView === 'redistribution' && (
              <RedistributionPlannerPage
                currentLanguage={currentLanguage}
                currentRole={currentRole}
              />
            )}

            {/* View 4: Ask PHC Pulse Conversational Agent (Stage 4) */}
            {activeView === 'ask' && (
              <AskPulsePage
                currentLanguage={currentLanguage}
                currentRole={currentRole}
                activeScenario={activeScenario}
                onNavigateToView={(v) => setActiveView(v)}
                onDraftAlertWithContext={(alertDraft) => {
                  setInitialAlertDraft(alertDraft);
                  setActiveView('alerts');
                }}
              />
            )}

            {/* View 5: Report Stock (Stage 5 Phone-First for PHC Staff) */}
            {activeView === 'report' && (
              <ReportStockPage
                currentLanguage={currentLanguage}
                currentRole={currentRole}
                onNavigateToDashboard={() => setActiveView('dashboard')}
              />
            )}

            {/* View 6: Federated Network (Stage 6) */}
            {activeView === 'federated' && (
              <FederatedNetworkPage
                currentLanguage={currentLanguage}
                currentRole={currentRole}
              />
            )}

            {/* View 7: Simulated Impact (Stage 7 Part A) */}
            {activeView === 'impact' && (
              <ImpactPage
                currentLanguage={currentLanguage}
                currentRole={currentRole}
                scenarioActive={!!activeScenario}
                onOpenScenarioModal={() => {
                  handleTriggerDemo();
                }}
              />
            )}

            {/* View 8: About & Architecture (Stage 7 Part B) */}
            {activeView === 'about' && (
              <AboutPage
                currentLanguage={currentLanguage}
                currentRole={currentRole}
                onNavigateToView={(v) => setActiveView(v)}
              />
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

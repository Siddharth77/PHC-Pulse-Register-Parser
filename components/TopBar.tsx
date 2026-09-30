'use client';

import React from 'react';
import {
  ShieldCheck,
  Globe2,
  Users,
  Sun,
  Moon,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react';
import { LanguageCode, UserRole } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';
import { OutbreakScenarioResult } from '@/types/supply-chain';

interface TopBarProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  activeScenario: OutbreakScenarioResult | null;
  onResetScenario?: () => void;
  onTriggerDemo?: () => void;
  lastUpdatedText?: string;
}

export function TopBar({
  currentLanguage,
  onLanguageChange,
  currentRole,
  onRoleChange,
  isDarkMode,
  onThemeToggle,
  activeScenario,
  onResetScenario,
  onTriggerDemo,
  lastUpdatedText = "Updated 2 min ago",
}: TopBarProps) {
  const t = TRANSLATIONS[currentLanguage];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-3">
        {/* Left: Brand Wordmark & Government Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm ring-1 ring-teal-700/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                National Health Grid
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center: Live Indicator & Scenario Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{t.live}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{lastUpdatedText}</span>
          </div>

          {activeScenario && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold text-amber-900 dark:text-amber-200 animate-pulse">
              <AlertOctagon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{activeScenario.projected_surge_label}</span>
              {onResetScenario && (
                <button
                  onClick={onResetScenario}
                  className="ml-1 text-[11px] underline hover:text-amber-700 dark:hover:text-amber-100"
                  title="Reset to Live Baseline"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Switchers, Storyline Demo & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher */}
          <div className="relative">
            <label htmlFor="role-select" className="sr-only">Select User Role</label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 min-h-[44px]">
              <Users className="h-4 w-4 mr-1.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <select
                id="role-select"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="state_national_officer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {t.roles.state_national_officer}
                </option>
                <option value="district_officer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {t.roles.district_officer}
                </option>
                <option value="phc_staff" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {t.roles.phc_staff}
                </option>
              </select>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <label htmlFor="lang-select" className="sr-only">Select Language</label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 min-h-[44px]">
              <Globe2 className="h-3.5 w-3.5 mr-1 text-slate-500 dark:text-slate-400 shrink-0" />
              <select
                id="lang-select"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">English</option>
                <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">हिन्दी</option>
                <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">मराठी</option>
                <option value="ml" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">മലയാളം</option>
                <option value="as" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">অসমীয়া</option>
              </select>
            </div>
          </div>

          {/* Storyline Demo Button */}
          {onTriggerDemo && (
            <button
              onClick={onTriggerDemo}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors min-h-[44px]"
              title="Run 1-Click Storyline Demo"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.demoMode}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Color Theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
}

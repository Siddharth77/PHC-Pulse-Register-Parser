'use client';

import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  ArrowRightLeft,
  MessageSquare,
  ClipboardPen,
  Network,
  Info,
} from 'lucide-react';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

export type NavigationViewId =
  | 'dashboard'
  | 'alerts'
  | 'redistribution'
  | 'ask'
  | 'report'
  | 'federated'
  | 'about';

interface LeftNavigationProps {
  activeView: NavigationViewId;
  onViewChange: (view: NavigationViewId) => void;
  currentLanguage: LanguageCode;
  criticalAlertsCount?: number;
  pendingTransfersCount?: number;
}

export function LeftNavigation({
  activeView,
  onViewChange,
  currentLanguage,
  criticalAlertsCount = 3,
  pendingTransfersCount = 4,
}: LeftNavigationProps) {
  const t = TRANSLATIONS[currentLanguage].nav;

  const navItems = [
    {
      id: 'dashboard' as const,
      label: t.dashboard,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'alerts' as const,
      label: t.alerts,
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'redistribution' as const,
      label: t.redistribution,
      icon: <ArrowRightLeft className="h-5 w-5" />,
      badge: pendingTransfersCount > 0 ? pendingTransfersCount : undefined,
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      id: 'ask' as const,
      label: t.ask,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: 'report' as const,
      label: t.report,
      icon: <ClipboardPen className="h-5 w-5" />,
    },
    {
      id: 'federated' as const,
      label: t.federated,
      icon: <Network className="h-5 w-5" />,
    },
    {
      id: 'about' as const,
      label: t.about,
      icon: <Info className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Desktop Left Sidebar (hidden on mobile, visible on lg) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 transition-colors">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold shadow-xs ring-1 ring-teal-200 dark:ring-teal-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom State Node Health Badge */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Federated Nodes</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">4/4 Synced</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono mt-1 text-slate-500 dark:text-slate-400">
              <span className="px-1 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">MP</span>
              <span className="px-1 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">MH</span>
              <span className="px-1 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">KL</span>
              <span className="px-1 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">AS</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar (visible on mobile, hidden on lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium min-h-[48px] min-w-[48px] transition-colors ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 h-4 w-4 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 truncate max-w-[64px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

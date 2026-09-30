'use client';

import React from 'react';
import { Play, Sparkles, X, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface WelcomeCardProps {
  onStartDemo: () => void;
  onDismiss: () => void;
}

export function WelcomeCard({ onStartDemo, onDismiss }: WelcomeCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close welcome message"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-extrabold border border-teal-200 dark:border-teal-800">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Interactive Co-Pilot Tour</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            Welcome to PHC Pulse
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            AI-powered public health supply chain co-pilot connecting 200 Primary Health Centres across Madhya Pradesh, Maharashtra, Kerala, and Assam.
          </p>
        </div>

        {/* Feature Points */}
        <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </div>
            <div>
              <strong>Guided 3-Minute Storyline:</strong> See proactive outbreak forecasting, linear optimization, officer approval, and phone register OCR in action.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <div>
              <strong>100% Real Features:</strong> Drives actual API routes and live user interfaces with zero hardcoded fake screens.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98] min-h-[48px]"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Take the 3-minute tour</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[48px]"
          >
            <span>Explore on my own</span>
          </button>
        </div>

        {/* Synthetic note */}
        <div className="text-[10px] text-center text-slate-400 font-medium">
          Demo resets app to a clean baseline state. Demo uses synthetic data.
        </div>
      </div>
    </div>
  );
}

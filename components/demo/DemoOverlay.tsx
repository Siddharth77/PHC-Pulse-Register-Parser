'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  Sparkles,
  HelpCircle,
  FileText,
  Volume2,
  VolumeX,
  Gauge,
  Info,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DEMO_STEPS, JUDGE_SUMMARY_QUESTIONS, DemoStepDefinition } from '@/lib/demo-script';

interface DemoOverlayProps {
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  autoAdvance: boolean;
  onStepChange: (index: number) => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onToggleAutoAdvance: () => void;
  onRestart: () => void;
  onExit: (resetToLive: boolean) => void;
  onNavigateToAbout: () => void;
  stepError?: string | null;
  onRetryStep?: () => void;
}

export function DemoOverlay({
  currentStepIndex,
  isPlaying,
  playbackSpeed,
  autoAdvance,
  onStepChange,
  onTogglePlay,
  onSetSpeed,
  onToggleAutoAdvance,
  onRestart,
  onExit,
  onNavigateToAbout,
  stepError,
  onRetryStep,
}: DemoOverlayProps) {
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showShortcutsTooltip, setShowShortcutsTooltip] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];
  const isLastStep = currentStepIndex === DEMO_STEPS.length - 1;

  // Speak step caption via Web Speech API when voice narration is toggled ON
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (voiceEnabled && isPlaying) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${currentStep.title}. ${currentStep.caption}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = playbackSpeed;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStepIndex, voiceEnabled, isPlaying, playbackSpeed, currentStep]);

  // Reduced motion check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Recalculate target spotlight position
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(update, 100);
    const interval = setInterval(update, 500);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [currentStep.targetSelector]);

  // Keyboard Navigation Shortcuts (Space = Play/Pause, Left/Right = Prev/Next, Esc = Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentStepIndex > 0) onStepChange(currentStepIndex - 1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentStepIndex < DEMO_STEPS.length - 1) onStepChange(currentStepIndex + 1);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setShowExitDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, onTogglePlay, onStepChange]);

  return (
    <>
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${currentStep.id} of 8: ${currentStep.title}. ${currentStep.caption}`}
      </div>

      {/* Target Spotlight Highlight Ring */}
      {targetRect && (
        <div
          className={`fixed z-40 pointer-events-none rounded-2xl border-2 border-teal-500 bg-teal-500/10 shadow-[0_0_25px_rgba(13,148,136,0.3)] transition-all ${
            prefersReducedMotion ? 'duration-0' : 'duration-300'
          }`}
          style={{
            left: `${Math.max(8, targetRect.left - 8)}px`,
            top: `${Math.max(8, targetRect.top - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* Step Caption Box & Step Indicator Overlay */}
      <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-extrabold border border-teal-500/30">
                Step {currentStep.id} of {DEMO_STEPS.length}
              </span>
              <span className="text-xs font-extrabold text-slate-200">{currentStep.title}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  showPresenterNotes
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle Presenter Talking Notes"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setShowExitDialog(true)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Exit Demo Mode (Esc)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Caption text */}
          <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
            {currentStep.caption}
          </p>

          {/* Inline Step Error / Timeout Handler */}
          {stepError && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{stepError}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onRetryStep && (
                  <button
                    onClick={onRetryStep}
                    className="px-2 py-1 rounded bg-rose-800 hover:bg-rose-700 font-bold text-[10px]"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => onStepChange(Math.min(DEMO_STEPS.length - 1, currentStepIndex + 1))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-bold text-[10px]"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Presenter Talking Notes Drawer */}
          {showPresenterNotes && (
            <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800/80 text-xs text-teal-200 space-y-1 animate-fade-in">
              <div className="font-extrabold text-[10px] uppercase tracking-wider text-teal-400 flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span>Presenter Talking Point:</span>
              </div>
              <p className="leading-snug text-[11px] font-medium">{currentStep.presenterNote}</p>
            </div>
          )}

          {/* Judge Summary Card at Step 8 / End */}
          {isLastStep && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 pt-3">
              <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>Judge Summary: 4 Questions Answered</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                {JUDGE_SUMMARY_QUESTIONS.map((q, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-white">{q.question}</div>
                    <div className="text-slate-400 text-[10px] pl-2 border-l border-teal-500/40">
                      {q.answer}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={onRestart}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Replay Demo</span>
                </button>

                <button
                  onClick={() => onExit(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  <span>Explore on my own</span>
                </button>

                <button
                  onClick={onNavigateToAbout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-teal-300 font-bold text-xs"
                >
                  <span>About this project</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Line */}
          <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-800/60 font-mono">
            Demo uses synthetic data.
          </div>
        </div>
      </div>

      {/* Floating Presenter Control Bar (Bottom Center) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md space-y-2">
          {/* Top Row: Clickable 8-Step Progress Indicator */}
          <div className="grid grid-cols-8 gap-1">
            {DEMO_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => onStepChange(idx)}
                  className={`h-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-teal-400 ring-2 ring-teal-400/30'
                      : isPassed
                      ? 'bg-teal-700'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`Jump to Step ${step.id}: ${step.title}`}
                />
              );
            })}
          </div>

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Left: Step counter & Mode toggle */}
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-teal-400">
                {currentStepIndex + 1}/8
              </span>

              <button
                onClick={onToggleAutoAdvance}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  autoAdvance
                    ? 'bg-teal-950 text-teal-300 border border-teal-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {autoAdvance ? 'Auto-Advance ON' : 'Manual Mode'}
              </button>
            </div>

            {/* Center: Playback Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                title="Previous Step (Left Arrow)"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={onTogglePlay}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-bold"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              <button
                onClick={() => onStepChange(Math.min(DEMO_STEPS.length - 1, currentStepIndex + 1))}
                disabled={isLastStep}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                title="Next Step (Right Arrow)"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                onClick={onRestart}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Restart Demo (R)"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Right: Voice Narration, Speed Control & Keyboard Shortcut Help */}
            <div className="flex items-center gap-2">
              {/* Voice Narration TTS Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  voiceEnabled
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={voiceEnabled ? 'Voice Narration ON (TTS)' : 'Voice Narration OFF'}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <div className="flex items-center rounded-lg bg-slate-800 p-0.5">
                {[0.75, 1, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onSetSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      playbackSpeed === spd
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="relative group">
                <button
                  onClick={() => setShowShortcutsTooltip(!showShortcutsTooltip)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Keyboard Shortcuts"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>

                {showShortcutsTooltip && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 rounded-xl bg-slate-950 text-[10px] text-slate-300 border border-slate-700 shadow-xl space-y-1">
                    <div className="font-bold text-white border-b border-slate-800 pb-1">
                      Keyboard Shortcuts:
                    </div>
                    <div><kbd className="bg-slate-800 px-1 rounded">Space</kbd> Play / Pause</div>
                    <div><kbd className="bg-slate-800 px-1 rounded">← / →</kbd> Back / Next</div>
                    <div><kbd className="bg-slate-800 px-1 rounded">Esc</kbd> Exit Demo</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Exit Demo Mode?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Exiting at any point returns the app to a usable state. Would you like to keep the current demo state or reset to live baseline data?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowExitDialog(false);
                  onExit(true); // reset to live baseline
                }}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
              >
                Reset to live baseline (Recommended)
              </button>

              <button
                onClick={() => {
                  setShowExitDialog(false);
                  onExit(false); // keep state
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 min-h-[44px]"
              >
                Keep current state
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

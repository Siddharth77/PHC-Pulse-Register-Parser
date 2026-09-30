/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Contrast, Eye, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PresetSample } from '@/lib/sample-data';

interface RegisterVisualizerProps {
  imageSrc: string | null;
  selectedPreset: PresetSample | null;
  rawText: string;
  sourceType: 'image' | 'audio' | 'text';
}

export function RegisterVisualizer({
  imageSrc,
  selectedPreset,
  rawText,
  sourceType,
}: RegisterVisualizerProps) {
  const [zoom, setZoom] = useState(1);
  const [enhanceInk, setEnhanceInk] = useState(false);
  const [invertView, setInvertView] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setEnhanceInk(false);
    setInvertView(false);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Visualizer Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-teal-400" />
            Source Register Inspector
          </span>
          {selectedPreset && (
            <span className="text-xs text-slate-400 font-mono">
              · {selectedPreset.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEnhanceInk(!enhanceInk)}
            className={`p-1.5 rounded text-xs transition-colors ${
              enhanceInk
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="High-Contrast Ink Enhancer (Sharpens faint pen/ink handwriting)"
          >
            <Contrast className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono tabular-nums text-slate-400 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            title="Reset view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Canvas */}
      <div className="relative flex-1 overflow-auto bg-slate-950 p-4 min-h-[380px] flex items-center justify-center">
        {imageSrc ? (
          <div
            className="transition-transform duration-200 ease-out origin-center"
            style={{
              transform: `scale(${zoom})`,
              filter: `${enhanceInk ? 'contrast(160%) brightness(95%) grayscale(40%)' : ''} ${
                invertView ? 'invert(100%)' : ''
              }`,
            }}
          >
            <img
              src={imageSrc}
              alt="Uploaded Primary Health Centre Stock Register"
              className="max-h-[500px] w-auto rounded-lg shadow-2xl border border-slate-700/60 object-contain"
            />
          </div>
        ) : selectedPreset ? (
          // Simulated Physical Register Page
          <div
            className="w-full max-w-lg transition-transform duration-200 ease-out origin-top"
            style={{
              transform: `scale(${zoom})`,
              filter: enhanceInk ? 'contrast(140%) brightness(105%)' : '',
            }}
          >
            <div className="rounded-lg bg-[#FAF8F2] text-slate-900 p-6 shadow-2xl border border-amber-200/80 font-serif relative overflow-hidden">
              {/* Ruled lines pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 27px, #94a3b8 28px)',
                  backgroundPosition: '0 40px',
                }}
              />

              {/* Official PHC stamp simulation */}
              <div className="absolute top-4 right-4 border-2 border-red-700/60 rounded px-2 py-1 rotate-[-4deg] text-red-700/80 text-[10px] font-mono uppercase tracking-widest pointer-events-none font-bold">
                {selectedPreset.state} PHC verified
              </div>

              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-2 mb-4">
                <div className="text-xs uppercase font-mono tracking-wider text-slate-500">
                  Primary Health Centre · Official Physical Daily Register
                </div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {selectedPreset.title}
                </div>
                <div className="text-xs text-slate-600 font-sans mt-0.5 flex items-center justify-between">
                  <span>Language: {selectedPreset.language}</span>
                  <span className="font-mono">Audit Log: 2026-09-29</span>
                </div>
              </div>

              {/* Handwritten/Typed Register Content */}
              <div className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap bg-amber-50/50 p-3 rounded border border-amber-200/60 shadow-inner">
                {selectedPreset.rawInputText}
              </div>

              {/* Ledger Footer */}
              <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Privacy Guard: OPD/Patient details auto-stripped
                </span>
                <span className="font-mono text-[10px]">
                  ID: {selectedPreset.precomputedParseResult.phc_id || 'NOT_SPECIFIED'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Freeform text or empty state
          <div className="w-full max-w-md p-5 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-300">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-200 border-b border-slate-800 pb-2">
              <FileText className="h-4 w-4 text-teal-400" />
              <span>Input Text Dispatch</span>
            </div>
            {rawText ? (
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-auto bg-slate-950 p-3 rounded border border-slate-800">
                {rawText}
              </pre>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Upload a photo, record audio, or select a state preset sample to inspect the register.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visualizer Footer notes */}
      <div className="border-t border-slate-800 bg-slate-950/70 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-teal-400/90">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Strict Rule 1: No hallucinated values · Null for unstated
        </span>
        <span className="flex items-center gap-1.5 text-amber-400/90">
          <AlertTriangle className="h-3.5 w-3.5" />
          Rule 2: Confidence &lt; 0.8 flags needs_review=true
        </span>
      </div>
    </div>
  );
}

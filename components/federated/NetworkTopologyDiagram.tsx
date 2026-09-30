'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Server,
  Activity,
  Shield,
  Layers,
  Sparkles,
  Play,
  Pause,
  Info,
} from 'lucide-react';
import { FederatedNodeMetric } from '@/types/supply-chain';

interface NetworkTopologyDiagramProps {
  nodes: FederatedNodeMetric[];
  currentRound: number;
  isSimulating: boolean;
  selectedState: string;
  onSelectState: (state: string) => void;
}

interface NodePosition {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  phcCount: number;
  color: string;
}

export function NetworkTopologyDiagram({
  nodes,
  currentRound,
  isSimulating,
  selectedState,
  onSelectState,
}: NetworkTopologyDiagramProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [forceAnimation, setForceAnimation] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const shouldAnimate = forceAnimation && !prefersReducedMotion;

  // 4 state node coordinates arranged around central aggregator (300, 200 in 600x400 viewBox)
  const nodeLayouts: Record<string, { x: number; y: number; color: string }> = {
    'Madhya Pradesh': { x: 120, y: 100, color: '#0d9488' }, // Teal
    'Maharashtra': { x: 120, y: 300, color: '#0284c7' },    // Sky
    'Kerala': { x: 480, y: 300, color: '#16a34a' },         // Green
    'Assam': { x: 480, y: 100, color: '#d97706' },          // Amber
  };

  const centerAggregator = { x: 300, y: 200 };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              State-Boundary Federated Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decentralized learning topology: click any state node to inspect its local metrics.
          </p>
        </div>

        {/* Animation & Accessibility Toggle */}
        <div className="flex items-center gap-2">
          {prefersReducedMotion && (
            <button
              onClick={() => setForceAnimation(!forceAnimation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {forceAnimation ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{forceAnimation ? 'Pause Motion' : 'Play Animation'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800">
            <Shield className="h-3 w-3" />
            <span>Zero Raw Data Egress</span>
          </div>
        </div>
      </div>

      {/* Interactive Topology SVG Canvas */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-radial from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full max-h-[380px]"
          aria-label="Federated Network Architecture Diagram showing 4 State Nodes connected to a Central Model Weight Aggregator with zero raw data sharing"
        >
          <defs>
            {/* Animated Dash Arrays for Model Update Gradients */}
            <linearGradient id="gradientMP" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="gradientMH" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="gradientKL" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="gradientAS" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Glowing filter for active transfer particles */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connectors & Transit Lines between Nodes and Aggregator */}
          {nodes.map((node) => {
            const layout = nodeLayouts[node.state] || { x: 150, y: 150, color: '#0d9488' };
            const isSelected = selectedState === node.state;

            return (
              <g key={node.state}>
                {/* Base Transit Channel */}
                <line
                  x1={layout.x}
                  y1={layout.y}
                  x2={centerAggregator.x}
                  y2={centerAggregator.y}
                  stroke={isSelected ? '#6366f1' : '#94a3b8'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  strokeDasharray="4,4"
                  opacity={isSelected ? 0.9 : 0.4}
                />

                {/* Animated Model Gradient Packets (Only Model Weights, Never Records) */}
                {shouldAnimate && (
                  <>
                    {/* Uplink Packet: Local Tensor Deltas -> Central Aggregator */}
                    <circle r="4" fill={layout.color} filter="url(#glow)">
                      <animateMotion
                        path={`M ${layout.x} ${layout.y} L ${centerAggregator.x} ${centerAggregator.y}`}
                        dur={isSimulating ? '1.2s' : '3.5s'}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Downlink Packet: Global Aggregated Model -> State Node */}
                    <circle r="3.5" fill="#6366f1" filter="url(#glow)">
                      <animateMotion
                        path={`M ${centerAggregator.x} ${centerAggregator.y} L ${layout.x} ${layout.y}`}
                        dur={isSimulating ? '1.2s' : '3.5s'}
                        begin={isSimulating ? '0.6s' : '1.75s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
              </g>
            );
          })}

          {/* Central Aggregator Node */}
          <g transform={`translate(${centerAggregator.x}, ${centerAggregator.y})`}>
            {/* Pulsing ring */}
            <circle
              r="44"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              opacity="0.2"
              className={shouldAnimate ? 'animate-ping' : ''}
              style={{ transformOrigin: '0 0', animationDuration: '3s' }}
            />
            {/* Core Aggregator Circle */}
            <circle
              r="38"
              fill="#1e1b4b"
              stroke="#818cf8"
              strokeWidth="3"
              className="shadow-xl cursor-pointer"
            />
            <foreignObject x="-30" y="-30" width="60" height="60">
              <div className="w-full h-full flex flex-col items-center justify-center text-white text-center">
                <Server className="h-5 w-5 text-indigo-400 mb-0.5" />
                <span className="text-[9px] font-extrabold uppercase tracking-tight leading-none text-indigo-200">
                  FedAvg
                </span>
                <span className="text-[8px] font-mono text-indigo-300">
                  Aggregator
                </span>
              </div>
            </foreignObject>
          </g>

          {/* State Nodes */}
          {nodes.map((node) => {
            const layout = nodeLayouts[node.state] || { x: 150, y: 150, color: '#0d9488' };
            const isSelected = selectedState === node.state;

            return (
              <g
                key={node.state}
                transform={`translate(${layout.x}, ${layout.y})`}
                onClick={() => onSelectState(node.state)}
                className="cursor-pointer group"
              >
                {/* Highlight ring on selection */}
                {isSelected && (
                  <circle
                    r="44"
                    fill="none"
                    stroke={layout.color}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className={shouldAnimate ? 'animate-spin' : ''}
                    style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                  />
                )}

                {/* State Node Circle */}
                <circle
                  r="36"
                  fill="#ffffff"
                  stroke={isSelected ? layout.color : '#cbd5e1'}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="dark:fill-slate-900 transition-all group-hover:scale-105"
                  style={{ transformOrigin: '0 0' }}
                />

                <foreignObject x="-32" y="-32" width="64" height="64">
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-1">
                    <div className="flex items-center gap-0.5">
                      <Lock className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                      <span className="text-[10px] font-extrabold text-slate-900 dark:text-white leading-none">
                        {node.state_code}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 leading-tight mt-0.5 truncate max-w-[58px]">
                      {node.state.split(' ')[0]}
                    </span>
                    <span className="text-[8px] font-mono font-semibold px-1 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                      {node.phc_count} PHCs
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mandatory Requirement 1 Caption */}
      <div className="text-center pt-1">
        <p className="text-xs sm:text-sm font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 py-2 px-4 rounded-xl border border-teal-200 dark:border-teal-800 inline-block shadow-2xs">
          🔒 Raw data never leaves the state. Only model updates are shared.
        </p>
      </div>
    </div>
  );
}

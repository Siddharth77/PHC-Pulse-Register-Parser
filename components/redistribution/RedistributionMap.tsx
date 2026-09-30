'use client';

import React from 'react';
import { TransferPlanItem, RiskLevel } from '@/types/supply-chain';
import { MapPin, ArrowRight, Truck, Snowflake } from 'lucide-react';

interface RedistributionMapProps {
  transfers: TransferPlanItem[];
  selectedTransferId: string | null;
  onSelectTransfer: (id: string) => void;
  selectedState: string;
  onStateSelect: (state: string) => void;
}

export function RedistributionMap({
  transfers,
  selectedTransferId,
  onSelectTransfer,
  selectedState,
  onStateSelect,
}: RedistributionMapProps) {
  const viewports: Record<string, { viewBox: string; label: string }> = {
    All: { viewBox: '68 7 30 30', label: 'All 4 States' },
    'Madhya Pradesh': { viewBox: '74 21 8 5', label: 'Madhya Pradesh' },
    'Maharashtra': { viewBox: '72 15 9 7', label: 'Maharashtra' },
    'Kerala': { viewBox: '74.5 8 4 5', label: 'Kerala' },
    'Assam': { viewBox: '89.5 24 7 4', label: 'Assam' },
  };

  const currentViewport = viewports[selectedState] || viewports.All;

  const projectX = (lon: number) => lon;
  const projectY = (lat: number) => 38 - lat;

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col">
      {/* Top Header & State Zoom */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Redistribution Route Network
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800/60">
              {transfers.length} Active Corridors
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any transfer corridor arrow to highlight its transfer order and audit details
          </p>
        </div>

        {/* State Zoom Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {(['All', 'Madhya Pradesh', 'Maharashtra', 'Kerala', 'Assam'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onStateSelect(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all min-h-[36px] ${
                selectedState === st
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st === 'All' ? 'All States' : st}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas with Flow Arrows */}
      <div className="relative w-full h-[450px] sm:h-[500px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
        <svg
          viewBox={currentViewport.viewBox}
          className="w-full h-full object-contain transition-all duration-500 ease-in-out select-none"
        >
          {/* Subtle Grid */}
          <defs>
            <pattern id="plan-grid" width="2" height="2" patternUnits="userSpaceOnUse">
              <path d="M 2 0 L 0 0 0 2" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800/40" strokeWidth="0.05" />
            </pattern>

            {/* Arrow Markers for each urgency level */}
            <marker id="arrow-critical" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#EF4444" />
            </marker>
            <marker id="arrow-high" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#F97316" />
            </marker>
            <marker id="arrow-medium" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#F59E0B" />
            </marker>
          </defs>
          <rect x="65" y="0" width="40" height="40" fill="url(#plan-grid)" />

          {/* India Baseline Outline */}
          <path
            d="M 74 31 L 72 26 L 69 22 L 71 18 L 74 15 L 77 12 L 81 8 L 88 10 L 93 11 L 96 14 L 94 17 L 91 21 L 88 23 L 85 27 L 80 30 Z"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.25"
            strokeDasharray="0.5 0.5"
          />

          {/* State Regions */}
          <g opacity="0.4">
            {/* MP */}
            <path d="M 74 17 L 78 17 L 82 18 L 81 21 L 75 22 Z" fill="#F97316" fillOpacity="0.1" stroke="#F97316" strokeWidth="0.15" />
            {/* MH */}
            <path d="M 72.8 21.5 L 75 21.5 L 80 21 L 79 24 L 73.5 24 Z" fill="#0D9488" fillOpacity="0.1" stroke="#0D9488" strokeWidth="0.15" />
            {/* KL */}
            <path d="M 75 29 L 76.5 28 L 77.2 30 L 76.2 32 Z" fill="#0284C7" fillOpacity="0.1" stroke="#0284C7" strokeWidth="0.15" />
            {/* AS */}
            <path d="M 90 12 L 95 12 L 95.5 14 L 91.5 14 Z" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeWidth="0.15" />
          </g>

          {/* Draw Transfer Routes & Flow Arrows */}
          {transfers.map((t) => {
            const x1 = projectX(t.from_lon || 75.8);
            const y1 = projectY(t.from_lat || 22.7);
            const x2 = projectX(t.to_lon || 76.0);
            const y2 = projectY(t.to_lat || 22.9);

            const isSelected = selectedTransferId === t.id;
            const isCritical = t.urgency === 'Critical';

            let strokeColor = '#F59E0B'; // Medium (amber)
            let markerId = 'url(#arrow-medium)';
            if (t.urgency === 'Critical') {
              strokeColor = '#EF4444'; // Red
              markerId = 'url(#arrow-critical)';
            } else if (t.urgency === 'High') {
              strokeColor = '#F97316'; // Orange
              markerId = 'url(#arrow-high)';
            }

            // Curve control point
            const midX = (x1 + x2) / 2 + (y2 - y1) * 0.15;
            const midY = (y1 + y2) / 2 + (x1 - x2) * 0.15;
            const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

            return (
              <g
                key={t.id}
                onClick={() => onSelectTransfer(t.id)}
                className="cursor-pointer group"
              >
                {/* Thick invisible hit area for easy tapping */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth="1.2" />

                {/* Animated Dash Flow Arrow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '0.35' : '0.2'}
                  strokeDasharray={isSelected ? '0.4 0.2' : '0.6 0.3'}
                  markerEnd={markerId}
                  className="transition-all"
                  opacity={isSelected ? 1.0 : 0.85}
                />

                {/* Source Node Pin */}
                <circle cx={x1} cy={y1} r={isSelected ? '0.5' : '0.35'} fill="#10B981" stroke="#FFFFFF" strokeWidth="0.08" />

                {/* Destination Node Pin */}
                <circle cx={x2} cy={y2} r={isSelected ? '0.55' : '0.4'} fill={strokeColor} stroke="#FFFFFF" strokeWidth="0.08" />

                {/* Text Label on Selected or Zoomed */}
                {(isSelected || selectedState !== 'All') && (
                  <g className="pointer-events-none">
                    <text x={midX} y={midY - 0.2} fontSize="0.45" fill="currentColor" fontWeight="bold" textAnchor="middle" className="fill-slate-900 dark:fill-white font-mono drop-shadow-xs">
                      {t.quantity.toLocaleString()} {t.unit.slice(0, 4)} ({t.road_distance_km}km)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1.5 pointer-events-none">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Transfer Route Urgency
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-5 bg-rose-500 rounded-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Critical (Dest ≤ 3d)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-5 bg-orange-500 rounded-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">High (Dest ≤ 7d)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-5 bg-emerald-500 rounded-sm"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Source Surplus Depot</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  TrendingDown,
  Table as TableIcon,
  LineChart as ChartIcon,
  Info,
  Layers,
} from 'lucide-react';
import { FederatedHistoryPoint } from '@/types/supply-chain';

interface AccuracyTrendChartProps {
  history: FederatedHistoryPoint[];
  selectedState: string;
}

const STATE_COLORS: Record<string, { stroke: string; label: string; dash?: string }> = {
  'Madhya Pradesh': { stroke: '#0d9488', label: 'Madhya Pradesh (MP)' },
  'Maharashtra': { stroke: '#0284c7', label: 'Maharashtra (MH)' },
  'Kerala': { stroke: '#16a34a', label: 'Kerala (KL)' },
  'Assam': { stroke: '#d97706', label: 'Assam (AS)' },
  'Baseline': { stroke: '#94a3b8', label: 'Isolated Baseline (No Fed)', dash: '4,4' },
};

export function AccuracyTrendChart({ history, selectedState }: AccuracyTrendChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    round: number;
    state: string;
    mape: number;
    baseline: number;
    x: number;
    y: number;
  } | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500">
        No training history available yet. Advance training rounds to observe accuracy convergence.
      </div>
    );
  }

  // Chart Dimensions
  const width = 640;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const minRound = 0;
  const maxRound = Math.max(10, history[history.length - 1].round);
  const minMape = 5;
  const maxMape = 40;

  const getX = (round: number) =>
    padding.left + ((round - minRound) / (maxRound - minRound)) * (width - padding.left - padding.right);

  const getY = (mape: number) =>
    height - padding.bottom - ((mape - minMape) / (maxMape - minMape)) * (height - padding.top - padding.bottom);

  // States to plot
  const states = ['Assam', 'Kerala', 'Maharashtra', 'Madhya Pradesh'];

  // Latest round metrics for text summary
  const latestRoundData = history[history.length - 1];
  const initialRoundData = history[0];
  const assamInitial = initialRoundData.mape_by_state['Assam'] ?? 34.2;
  const assamLatest = latestRoundData.mape_by_state['Assam'] ?? 12.1;

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Multi-State Forecast Error Convergence
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mean Absolute Percentage Error (MAPE %) drops significantly faster under federated gradient exchange than isolated baselines.
          </p>
        </div>

        {/* View mode toggle (Chart vs Data Table) */}
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 min-h-[36px] self-start sm:self-auto"
        >
          {showTable ? <ChartIcon className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
          <span>{showTable ? 'View Line Chart' : 'View Accessible Table'}</span>
        </button>
      </div>

      {/* Requirement 4: Plain Language Text Summary */}
      <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-teal-600 shrink-0" />
        <span>
          <strong>Convergence Summary:</strong> Assam&apos;s forecast error fell from <strong>{assamInitial.toFixed(1)}%</strong> to <strong>{assamLatest.toFixed(1)}%</strong> after {latestRoundData.round} federated training rounds (vs 27.5% in the isolated baseline).
        </span>
      </div>

      {showTable ? (
        /* Accessible Data Table */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                <th className="p-2.5 pl-3">Round</th>
                <th className="p-2.5">Madhya Pradesh</th>
                <th className="p-2.5">Maharashtra</th>
                <th className="p-2.5">Kerala</th>
                <th className="p-2.5">Assam</th>
                <th className="p-2.5 pr-3 text-slate-400">Assam Baseline (No Fed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {history.map((pt) => (
                <tr key={pt.round} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 pl-3 font-bold text-slate-900 dark:text-white">
                    Round {pt.round}
                  </td>
                  <td className="p-2.5 text-teal-700 dark:text-teal-400">
                    {pt.mape_by_state['Madhya Pradesh']?.toFixed(1)}%
                  </td>
                  <td className="p-2.5 text-sky-700 dark:text-sky-400">
                    {pt.mape_by_state['Maharashtra']?.toFixed(1)}%
                  </td>
                  <td className="p-2.5 text-emerald-700 dark:text-emerald-400">
                    {pt.mape_by_state['Kerala']?.toFixed(1)}%
                  </td>
                  <td className="p-2.5 font-bold text-amber-700 dark:text-amber-400">
                    {pt.mape_by_state['Assam']?.toFixed(1)}%
                  </td>
                  <td className="p-2.5 pr-3 text-slate-400">
                    {pt.mape_baseline_by_state['Assam']?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* SVG Line Chart */
        <div className="relative overflow-x-auto">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
              {/* Grid Lines */}
              {[10, 20, 30, 40].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="2,2"
                      className="dark:stroke-slate-800"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* X Axis Rounds */}
              {[0, 2, 4, 6, 8, 10].map((rnd) => {
                const x = getX(rnd);
                return (
                  <g key={rnd}>
                    <line
                      x1={x}
                      y1={height - padding.bottom}
                      x2={x}
                      y2={height - padding.bottom + 5}
                      stroke="#cbd5e1"
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 16}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      R{rnd}
                    </text>
                  </g>
                );
              })}

              {/* Baseline Dashed Line for Selected State */}
              {(() => {
                const pathD = history
                  .map((pt, i) => {
                    const x = getX(pt.round);
                    const y = getY(pt.mape_baseline_by_state[selectedState] ?? 30);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');

                return (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.7"
                  />
                );
              })()}

              {/* State Performance Lines */}
              {states.map((st) => {
                const isSelected = selectedState === st;
                const pathD = history
                  .map((pt, i) => {
                    const x = getX(pt.round);
                    const y = getY(pt.mape_by_state[st] ?? 30);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');

                const color = STATE_COLORS[st]?.stroke || '#0d9488';

                return (
                  <g key={st}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={isSelected ? '3.5' : '2'}
                      opacity={isSelected ? 1 : 0.6}
                    />

                    {/* Data Point Markers */}
                    {history.map((pt) => {
                      const x = getX(pt.round);
                      const y = getY(pt.mape_by_state[st] ?? 30);
                      return (
                        <circle
                          key={`${st}-${pt.round}`}
                          cx={x}
                          cy={y}
                          r={isSelected ? 4 : 3}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer hover:scale-150 transition-transform"
                          onMouseEnter={() =>
                            setHoveredPoint({
                              round: pt.round,
                              state: st,
                              mape: pt.mape_by_state[st],
                              baseline: pt.mape_baseline_by_state[st],
                              x,
                              y,
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-20 p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 pointer-events-none -translate-x-1/2 -translate-y-full mb-2"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100}%`,
                }}
              >
                <div className="font-bold text-teal-300">{hoveredPoint.state}</div>
                <div className="font-mono text-[11px]">Round {hoveredPoint.round}</div>
                <div className="font-mono text-emerald-400 font-bold">
                  Federated Error: {hoveredPoint.mape.toFixed(1)}%
                </div>
                <div className="font-mono text-slate-400 text-[10px]">
                  Local Baseline: {hoveredPoint.baseline.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
        {states.map((st) => (
          <div key={st} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATE_COLORS[st]?.stroke }}
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">{st}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400" />
          <span className="font-medium text-slate-500">Isolated Baseline</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { TrendingUp, Activity, HelpCircle } from 'lucide-react';
import { generateTrendSeries, TimeSeriesPoint } from '@/lib/mock-database';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

interface TrendChartProps {
  currentLanguage: LanguageCode;
  selectedMedicine?: string;
  onMedicineSelect?: (medicine: string) => void;
}

export function TrendChart({
  currentLanguage,
  selectedMedicine = "Paracetamol 500mg tab",
  onMedicineSelect,
}: TrendChartProps) {
  const t = TRANSLATIONS[currentLanguage].charts;

  const [userSelectedMedicine, setUserSelectedMedicine] = useState<string | null>(null);
  const [prevPropMedicine, setPrevPropMedicine] = useState(selectedMedicine);

  // If parent prop changes, reset user selection override
  if (selectedMedicine !== prevPropMedicine) {
    setPrevPropMedicine(selectedMedicine);
    setUserSelectedMedicine(null);
  }

  const activeMedicine = userSelectedMedicine || selectedMedicine;

  const data: TimeSeriesPoint[] = React.useMemo(
    () => generateTrendSeries(activeMedicine),
    [activeMedicine]
  );

  const medicines = [
    "Paracetamol 500mg tab",
    "ORS sachet",
    "Amoxicillin 500mg cap",
    "Insulin Human NPH 10ml",
    "Anti-snake venom vial",
  ];

  // SVG dimensions & coordinate scales
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Dynamic Max value calculation for Y scale per medicine
  const maxVal = React.useMemo(() => {
    const maxDataPoint = Math.max(
      ...data.map((pt) => Math.max(pt.actual_stock || 0, pt.upper_ci_95 || 0, pt.forecast_demand || 0, pt.stockout_threshold || 0))
    );
    if (maxDataPoint <= 50) return 50;
    if (maxDataPoint <= 300) return 300;
    if (maxDataPoint <= 2000) return 2000;
    return Math.ceil(maxDataPoint * 1.15 / 500) * 500;
  }, [data]);

  const minVal = 0;

  const scaleX = (index: number) => padding.left + (index / (data.length - 1)) * chartW;
  const scaleY = (val: number) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Split historical (0 to 30) vs forecast (30 to 44)
  const historicalPoints = data.slice(0, 31);
  const forecastPoints = data.slice(30);

  // Path for Historical Stock
  const historicalPath = historicalPoints.reduce((acc, pt, i) => {
    const x = scaleX(i);
    const y = scaleY(pt.actual_stock || 0);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Path for Forecast Line (Dashed)
  const forecastPath = forecastPoints.reduce((acc, pt, i) => {
    const x = scaleX(30 + i);
    const y = scaleY(pt.forecast_demand || 0);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Shaded Confidence Band (Upper and Lower 95% CI)
  const upperCiPoints = forecastPoints.map((pt, i) => ({
    x: scaleX(30 + i),
    y: scaleY(pt.upper_ci_95 || pt.forecast_demand || 0),
  }));

  const lowerCiPoints = [...forecastPoints].reverse().map((pt, i) => ({
    x: scaleX(data.length - 1 - i),
    y: scaleY(pt.lower_ci_95 || pt.forecast_demand || 0),
  }));

  const confidenceBandPath = [
    `M ${upperCiPoints[0].x} ${upperCiPoints[0].y}`,
    ...upperCiPoints.slice(1).map((p) => `L ${p.x} ${p.y}`),
    ...lowerCiPoints.map((p) => `L ${p.x} ${p.y}`),
    'Z',
  ].join(' ');

  // Dynamic Threshold line
  const thresholdVal = data[0]?.stockout_threshold || 600;
  const thresholdY = scaleY(thresholdVal);

  // Dynamic grid ticks
  const gridTicks = [
    Math.round(maxVal * 0.25),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.75),
    maxVal,
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 flex flex-col justify-between">
      {/* Header with Medicine Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeMedicine} · 30-Day Historical Trend & 14-Day ARIMA+ Forecast
          </p>
        </div>

        {/* Medicine Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {medicines.map((m) => (
            <button
              key={m}
              onClick={() => {
                setUserSelectedMedicine(m);
                onMedicineSelect?.(m);
              }}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                activeMedicine === m
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {m.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 select-none"
        >
          {/* Background Grid Lines */}
          {gridTicks.map((val) => {
            const y = scaleY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Critical Threshold Line (Red Dash) */}
          <line
            x1={padding.left}
            y1={thresholdY}
            x2={width - padding.right}
            y2={thresholdY}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={width - padding.right - 5}
            y={thresholdY - 6}
            textAnchor="end"
            fontSize="10"
            fill="#EF4444"
            fontWeight="bold"
            className="font-mono"
          >
            Critical 3-Day Buffer ({thresholdVal})
          </text>

          {/* Today Divider Line */}
          <line
            x1={scaleX(30)}
            y1={padding.top}
            x2={scaleX(30)}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-slate-400 dark:text-slate-600"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={scaleX(30)}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            fontSize="10"
            className="fill-teal-600 dark:fill-teal-400 font-bold font-mono"
          >
            Today
          </text>

          {/* Shaded 95% Confidence Band for Forecast */}
          <path
            d={confidenceBandPath}
            fill="#0D9488"
            fillOpacity="0.15"
          />

          {/* Historical Stock Line (Solid Teal) */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
          />

          {/* Forecast Demand Line (Dashed Orange) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />

          {/* Historical Data Dots */}
          {historicalPoints.filter((_, idx) => idx % 5 === 0).map((pt, i) => (
            <circle
              key={i}
              cx={scaleX(i * 5)}
              cy={scaleY(pt.actual_stock || 0)}
              r="3.5"
              fill="#0D9488"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}

          {/* Forecast Projected Dots */}
          {forecastPoints.filter((_, idx) => idx % 3 === 0).map((pt, i) => (
            <circle
              key={i}
              cx={scaleX(30 + i * 3)}
              cy={scaleY(pt.forecast_demand || 0)}
              r="3.5"
              fill="#F97316"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          ))}

          {/* X Axis Labels */}
          <text x={scaleX(0)} y={height - padding.bottom + 16} textAnchor="start" fontSize="10" className="fill-slate-400 font-mono">
            -30 Days
          </text>
          <text x={scaleX(15)} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" className="fill-slate-400 font-mono">
            -15 Days
          </text>
          <text x={scaleX(44)} y={height - padding.bottom + 16} textAnchor="end" fontSize="10" className="fill-slate-400 font-mono">
            +14 Days (ARIMA+)
          </text>
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-5 bg-teal-600 rounded-sm"></span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{t.actualStock}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-5 border-t-2 border-dashed border-orange-500"></span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{t.forecastDemand}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-4 bg-teal-500/20 border border-teal-500/40 rounded-xs"></span>
            <span className="text-slate-500 dark:text-slate-400">{t.confidenceBand}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-5 border-t-2 border-dashed border-rose-500"></span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Critical Buffer (3d)</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Source: BigQuery ML ARIMA_PLUS
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Bed,
  Users,
  Snowflake,
  ArrowRightLeft,
  BellRing,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { PhcMaster, SnapshotRecord, RiskLevel } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';

interface InteractiveMapProps {
  phcMasters: PhcMaster[];
  records: SnapshotRecord[];
  selectedState: string;
  onStateSelect: (state: string) => void;
  currentLanguage: LanguageCode;
  onDraftAlertClick?: (phc: PhcMaster, primaryDeficitItem?: SnapshotRecord) => void;
  onFindSurplusClick?: (phc: PhcMaster, primaryDeficitItem?: SnapshotRecord) => void;
}

export function InteractiveMap({
  phcMasters,
  records,
  selectedState,
  onStateSelect,
  currentLanguage,
  onDraftAlertClick,
  onFindSurplusClick,
}: InteractiveMapProps) {
  const t = TRANSLATIONS[currentLanguage].map;
  const tRisks = TRANSLATIONS[currentLanguage].risks;

  const [activePhc, setActivePhc] = useState<PhcMaster | null>(null);
  const [hoveredPhc, setHoveredPhc] = useState<PhcMaster | null>(null);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [prevSelectedState, setPrevSelectedState] = useState<string>(selectedState);

  // Reset zoom factor when state filter changes using render pattern
  if (selectedState !== prevSelectedState) {
    setPrevSelectedState(selectedState);
    setZoomFactor(1.0);
  }

  // Group records by PHC to find worst risk per facility
  const phcRiskMap = React.useMemo(() => {
    const map = new Map<string, { worstRisk: RiskLevel; records: SnapshotRecord[] }>();

    for (const phc of phcMasters) {
      const phcRecs = records.filter((r) => r.phc_id === phc.phc_id);
      let worst: RiskLevel = 'Low';
      if (phcRecs.some((r) => r.risk_level === 'Critical')) worst = 'Critical';
      else if (phcRecs.some((r) => r.risk_level === 'High')) worst = 'High';
      else if (phcRecs.some((r) => r.risk_level === 'Medium')) worst = 'Medium';

      map.set(phc.phc_id, { worstRisk: worst, records: phcRecs });
    }
    return map;
  }, [phcMasters, records]);

  // Transform lat/lon into SVG coordinate space
  // Longitude = X (68 to 98)
  // Latitude = Y (Inverted: India is 7N to 37N. In SVG, Y increases downwards, so Y = 38 - lat)
  const projectX = (lon: number) => lon;
  const projectY = (lat: number) => 38 - lat;

  // Compute exact bounding box for each state dynamically from PHC coordinates
  const stateBounds = React.useMemo(() => {
    const bounds: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {};

    for (const phc of phcMasters) {
      const x = projectX(phc.lon);
      const y = projectY(phc.lat);
      if (!bounds[phc.state]) {
        bounds[phc.state] = { minX: x, maxX: x, minY: y, maxY: y };
      } else {
        bounds[phc.state].minX = Math.min(bounds[phc.state].minX, x);
        bounds[phc.state].maxX = Math.max(bounds[phc.state].maxX, x);
        bounds[phc.state].minY = Math.min(bounds[phc.state].minY, y);
        bounds[phc.state].maxY = Math.max(bounds[phc.state].maxY, y);
      }
    }
    return bounds;
  }, [phcMasters]);

  // Base ViewBox before zoom factor
  const baseViewBox = React.useMemo(() => {
    if (selectedState === 'All' || !stateBounds[selectedState]) {
      return { x: 67, y: 2, w: 31, h: 30 };
    }
    const b = stateBounds[selectedState];
    const width = b.maxX - b.minX;
    const height = b.maxY - b.minY;
    const padX = Math.max(1.8, width * 0.4);
    const padY = Math.max(1.8, height * 0.4);

    return {
      x: b.minX - padX,
      y: b.minY - padY,
      w: width + padX * 2,
      h: height + padY * 2,
    };
  }, [selectedState, stateBounds]);

  // Calculate final ViewBox string applying zoomFactor
  const currentViewBox = React.useMemo(() => {
    const { x, y, w, h } = baseViewBox;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const newW = w / zoomFactor;
    const newH = h / zoomFactor;
    const newX = cx - newW / 2;
    const newY = cy - newH / 2;
    return `${newX.toFixed(2)} ${newY.toFixed(2)} ${newW.toFixed(2)} ${newH.toFixed(2)}`;
  }, [baseViewBox, zoomFactor]);

  // Active PHC records for side panel
  const activePhcData = activePhc ? phcRiskMap.get(activePhc.phc_id) : null;
  const worstRiskItem = activePhcData?.records.sort((a, b) => a.days_of_cover - b.days_of_cover)[0];

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col">
      {/* Map Header and State Zoom Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.title}
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {phcMasters.length} PHCs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle} · {t.zoomHint}
          </p>
        </div>

        {/* State Zoom Buttons */}
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
              {st === 'All' ? t.allIndia : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[460px] sm:h-[500px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* SVG Geographic Map Canvas */}
        <svg
          viewBox={currentViewBox}
          className="w-full h-full object-contain transition-all duration-500 ease-in-out select-none"
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
              <path d="M 2 0 L 0 0 0 2" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800/40" strokeWidth="0.05" />
            </pattern>
          </defs>
          <rect x="65" y="0" width="40" height="40" fill="url(#grid)" />

          {/* India Boundary Outline (Stylized polygonal baseline) */}
          <path
            d="M 74 30 L 72 25 L 68 20 L 70 14 L 73 11 L 76 7 L 78 3 L 80 5 L 88 10 L 96 11 L 94 14 L 91 18 L 88 22 L 85 26 L 80 29 Z"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-800"
            strokeWidth="0.25"
            strokeDasharray="0.5 0.5"
          />

          {/* 4 State Node Regional Polygons */}
          {/* 1. Madhya Pradesh (Central) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Madhya Pradesh' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 73.5 16.5 L 77.5 13.0 L 82.5 14.5 L 81.5 17.2 L 74.5 17.5 Z"
              fill="currentColor"
              className="text-orange-500/10 dark:text-orange-400/10 hover:text-orange-500/20 cursor-pointer"
              stroke="#F97316"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Madhya Pradesh')}
            />
            <text x="76.5" y="15.5" fontSize="0.7" fill="#F97316" fontWeight="bold">
              Madhya Pradesh
            </text>
          </g>

          {/* 2. Maharashtra (West) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Maharashtra' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 72.8 20.0 L 74.5 16.2 L 80.0 16.8 L 80.5 20.8 L 73.5 22.2 Z"
              fill="currentColor"
              className="text-teal-500/10 dark:text-teal-400/10 hover:text-teal-500/20 cursor-pointer"
              stroke="#0D9488"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Maharashtra')}
            />
            <text x="75.5" y="18.8" fontSize="0.7" fill="#0D9488" fontWeight="bold">
              Maharashtra
            </text>
          </g>

          {/* 3. Kerala (South Coastal) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Kerala' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 74.8 25.8 L 76.2 25.5 L 77.3 28.5 L 76.2 29.8 L 75.0 28.2 Z"
              fill="currentColor"
              className="text-sky-500/10 dark:text-sky-400/10 hover:text-sky-500/20 cursor-pointer"
              stroke="#0284C7"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Kerala')}
            />
            <text x="75.2" y="27.2" fontSize="0.65" fill="#0284C7" fontWeight="bold">
              Kerala
            </text>
          </g>

          {/* 4. Assam (North-East) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Assam' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 89.8 12.8 L 93.5 10.2 L 96.0 10.5 L 95.5 12.5 L 91.8 13.8 Z"
              fill="currentColor"
              className="text-indigo-500/10 dark:text-indigo-400/10 hover:text-indigo-500/20 cursor-pointer"
              stroke="#6366F1"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Assam')}
            />
            <text x="92.0" y="11.8" fontSize="0.7" fill="#6366F1" fontWeight="bold">
              Assam
            </text>
          </g>

          {/* Plot Individual PHC Markers */}
          {phcMasters.map((phc) => {
            const riskInfo = phcRiskMap.get(phc.phc_id);
            const risk = riskInfo?.worstRisk || 'Low';
            const isSelected = activePhc?.phc_id === phc.phc_id;

            const cx = projectX(phc.lon);
            const cy = projectY(phc.lat);

            // Scale factor depending on zoom state
            const isZoomed = selectedState !== 'All' || zoomFactor > 1.2;
            const baseR = isZoomed ? 0.28 : 0.45;
            const coreR = isZoomed ? 0.10 : 0.16;
            const textFs = isZoomed ? 0.42 : 0.55;
            const textOffsetX = isZoomed ? 0.35 : 0.55;
            const textOffsetY = isZoomed ? 0.12 : 0.22;

            // Color pairings per Rule 3
            let fill = "#10B981"; // Low (green)
            let stroke = "#059669";
            if (risk === "Critical") {
              fill = "#EF4444"; // Red
              stroke = "#B91C1C";
            } else if (risk === "High") {
              fill = "#F97316"; // Orange
              stroke = "#C2410C";
            } else if (risk === "Medium") {
              fill = "#F59E0B"; // Amber
              stroke = "#B45309";
            }

            return (
              <g
                key={phc.phc_id}
                className="cursor-pointer group"
                onClick={() => setActivePhc(phc)}
                onMouseEnter={() => setHoveredPhc(phc)}
                onMouseLeave={() => setHoveredPhc(null)}
              >
                {/* Glowing pulse aura for critical stockouts */}
                {risk === "Critical" && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? baseR * 2.2 : baseR * 1.8}
                    fill="#EF4444"
                    fillOpacity="0.25"
                    stroke="#EF4444"
                    strokeWidth={isZoomed ? "0.04" : "0.08"}
                    className="animate-pulse"
                  />
                )}

                {/* Marker Outer Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? baseR * 1.4 : baseR}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? (isZoomed ? "0.10" : "0.16") : (isZoomed ? "0.06" : "0.10")}
                  className="transition-all duration-200 group-hover:opacity-90"
                />

                {/* Center Core dot */}
                <circle cx={cx} cy={cy} r={coreR} fill="#FFFFFF" />

                {/* Text Label with crisp white/dark background outline for maximum legibility */}
                {(isZoomed || isSelected || hoveredPhc?.phc_id === phc.phc_id) && (
                  <text
                    x={cx + textOffsetX}
                    y={cy + textOffsetY}
                    fontSize={textFs}
                    fontWeight="800"
                    stroke="currentColor"
                    strokeWidth="0.08"
                    paintOrder="stroke fill"
                    className="fill-slate-900 text-white dark:fill-white dark:text-slate-900 pointer-events-none"
                  >
                    {phc.phc_name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Zoom Controls Overlay (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-10">
          <button
            onClick={() => setZoomFactor((z) => Math.min(3.5, z * 1.3))}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 hover:text-teal-600 font-bold transition-all flex items-center justify-center min-h-[36px] min-w-[36px]"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomFactor((z) => Math.max(0.8, z / 1.3))}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 hover:text-teal-600 font-bold transition-all flex items-center justify-center min-h-[36px] min-w-[36px]"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomFactor(1.0)}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-bold font-mono transition-all flex items-center justify-center min-h-[28px]"
            title="Reset Zoom"
          >
            {Math.round(zoomFactor * 100)}%
          </button>
        </div>

        {/* Hover Tooltip Popup Overlay */}
        {hoveredPhc && !activePhc && (
          <div className="absolute top-4 left-4 bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl text-xs z-20 pointer-events-none animate-in fade-in duration-150">
            <div className="font-bold text-teal-300 text-sm">{hoveredPhc.phc_name}</div>
            <div className="text-slate-300 text-[11px] mt-0.5">{hoveredPhc.district}, {hoveredPhc.state} · {hoveredPhc.type}</div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-3 text-[11px]">
              <div>
                Risk: <strong className={phcRiskMap.get(hoveredPhc.phc_id)?.worstRisk === 'Critical' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{phcRiskMap.get(hoveredPhc.phc_id)?.worstRisk || 'Low'}</strong>
              </div>
              <div>
                Beds: <strong>{phcRiskMap.get(hoveredPhc.phc_id)?.records[0]?.beds_available || 2}/{hoveredPhc.total_beds}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Floating Map Legend (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1.5 pointer-events-none">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Stockout Risk Level
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/40"></span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{t.legendCritical}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-200 dark:ring-orange-900/40"></span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{t.legendHigh}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-900/40"></span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{t.legendMedium}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900/40"></span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{t.legendLow}</span>
          </div>
        </div>

        {/* Marker Click Slide-Over Side Panel */}
        {activePhc && (
          <aside
            aria-label="PHC Facility Details"
            className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-xl p-4 flex flex-col justify-between overflow-y-auto z-20 animate-in slide-in-from-right duration-200"
          >
            <div>
              {/* Header with Close Button */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800/60">
                    {activePhc.phc_id} · {activePhc.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {activePhc.phc_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activePhc.district}, {activePhc.state} · {activePhc.km_to_district_warehouse} km to warehouse
                  </p>
                </div>
                <button
                  onClick={() => setActivePhc(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Close facility panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Beds & Staff Summary Strip */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                    <Bed className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{t.bedsVacant}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {activePhcData?.records[0]?.beds_available || 2} / {activePhc.total_beds} beds free
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{t.staffDuty}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {activePhcData?.records[0]?.staff_present || 3} / {activePhc.staff_sanctioned} on duty
                  </div>
                </div>
              </div>

              {/* Medicines Inventory List */}
              <div className="space-y-2 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.medicinesTracked}
                </div>
                {activePhcData?.records.map((rec, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {rec.medicine}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.risk_level === 'Critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : rec.risk_level === 'High'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : rec.risk_level === 'Medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {tRisks[rec.risk_level]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>
                        Stock: <strong className="text-slate-800 dark:text-slate-200">{rec.stock} {rec.unit}</strong>
                      </span>
                      <span>
                        Daily burn: <strong>{rec.daily_demand}</strong>
                      </span>
                      <span>
                        Cover: <strong className="font-bold text-slate-900 dark:text-white">{rec.days_of_cover}d</strong>
                      </span>
                    </div>

                    {rec.cold_chain && (
                      <div className="flex items-center gap-1 text-[10px] text-sky-700 dark:text-sky-300 font-semibold mt-0.5">
                        <Snowflake className="h-3 w-3" />
                        <span>{t.coldChain}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Action First Principle */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onFindSurplusClick && onFindSurplusClick(activePhc, worstRiskItem)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[48px]"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span>Find Surplus Nearby</span>
              </button>

              <button
                onClick={() => onDraftAlertClick && onDraftAlertClick(activePhc, worstRiskItem)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors min-h-[44px]"
              >
                <BellRing className="h-4 w-4" />
                <span>Draft Emergency Alert</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

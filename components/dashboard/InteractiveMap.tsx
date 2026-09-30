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

  // Coordinate projections for India bounding box (approx lat 7 to 37, lon 68 to 97)
  // We can zoom viewport based on selected state
  const viewports: Record<string, { viewBox: string; label: string }> = {
    All: { viewBox: "68 7 30 30", label: t.allIndia },
    "Madhya Pradesh": { viewBox: "74 21 8 5", label: "Madhya Pradesh" },
    "Maharashtra": { viewBox: "72 15 9 7", label: "Maharashtra" },
    "Kerala": { viewBox: "74.5 8 4 5", label: "Kerala" },
    "Assam": { viewBox: "89.5 24 7 4", label: "Assam" },
  };

  const currentViewport = viewports[selectedState] || viewports.All;

  // Transform lat/lon into SVG coordinate space
  // Longitude = X (68 to 98)
  // Latitude = Y (Inverted: India is 7N to 37N. In SVG, Y increases downwards, so Y = 38 - lat)
  const projectX = (lon: number) => lon;
  const projectY = (lat: number) => 38 - lat;

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
          viewBox={currentViewport.viewBox}
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
            d="M 74 31 L 72 26 L 69 22 L 71 18 L 74 15 L 77 12 L 81 8 L 88 10 L 93 11 L 96 14 L 94 17 L 91 21 L 88 23 L 85 27 L 80 30 Z"
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
              d="M 74 17 L 78 17 L 82 18 L 81 21 L 75 22 Z"
              fill="currentColor"
              className="text-orange-500/10 dark:text-orange-400/10 hover:text-orange-500/20 cursor-pointer"
              stroke="#F97316"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Madhya Pradesh')}
            />
            <text x="76.5" y="19" fontSize="0.7" fill="#F97316" fontWeight="bold">
              Madhya Pradesh
            </text>
          </g>

          {/* 2. Maharashtra (West) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Maharashtra' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 72.8 21.5 L 75 21.5 L 80 21 L 79 24 L 73.5 24 Z"
              fill="currentColor"
              className="text-teal-500/10 dark:text-teal-400/10 hover:text-teal-500/20 cursor-pointer"
              stroke="#0D9488"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Maharashtra')}
            />
            <text x="74.5" y="23" fontSize="0.7" fill="#0D9488" fontWeight="bold">
              Maharashtra
            </text>
          </g>

          {/* 3. Kerala (South Coastal) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Kerala' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 75 29 L 76.5 28 L 77.2 30 L 76.2 32 Z"
              fill="currentColor"
              className="text-sky-500/10 dark:text-sky-400/10 hover:text-sky-500/20 cursor-pointer"
              stroke="#0284C7"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Kerala')}
            />
            <text x="75.2" y="30.5" fontSize="0.65" fill="#0284C7" fontWeight="bold">
              Kerala
            </text>
          </g>

          {/* 4. Assam (North-East) */}
          <g className={`transition-opacity duration-300 ${selectedState === 'All' || selectedState === 'Assam' ? 'opacity-100' : 'opacity-30'}`}>
            <path
              d="M 90 12 L 95 12 L 95.5 14 L 91.5 14 Z"
              fill="currentColor"
              className="text-indigo-500/10 dark:text-indigo-400/10 hover:text-indigo-500/20 cursor-pointer"
              stroke="#6366F1"
              strokeWidth="0.2"
              onClick={() => onStateSelect('Assam')}
            />
            <text x="91.5" y="13.2" fontSize="0.7" fill="#6366F1" fontWeight="bold">
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
              >
                {/* Ping ring for critical stockouts */}
                {risk === "Critical" && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? "0.9" : "0.7"}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="0.1"
                    className="animate-ping origin-center"
                    opacity="0.8"
                  />
                )}

                {/* Marker Outer Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? "0.6" : "0.4"}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? "0.15" : "0.08"}
                  className="transition-transform group-hover:scale-125"
                />

                {/* Center Core dot */}
                <circle cx={cx} cy={cy} r="0.15" fill="#FFFFFF" />

                {/* Text Label on Zoomed or Selected */}
                {(selectedState !== 'All' || isSelected) && (
                  <text
                    x={cx + 0.5}
                    y={cy + 0.2}
                    fontSize="0.5"
                    fill="currentColor"
                    className="text-slate-800 dark:text-slate-200 font-bold pointer-events-none drop-shadow-xs"
                  >
                    {phc.phc_name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

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

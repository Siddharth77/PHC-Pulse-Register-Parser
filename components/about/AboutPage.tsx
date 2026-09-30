'use client';

import React, { useState } from 'react';
import {
  Eye,
  TrendingUp,
  Zap,
  Network,
  Cpu,
  Bot,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Server,
  Cloud,
  Database,
  ExternalLink,
  Github,
  Video,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { LanguageCode, UserRole, CONFIG } from '@/lib/config';

interface AboutPageProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
  onNavigateToView?: (view: any) => void;
}

const GOOGLE_SERVICES = [
  {
    service: 'Firebase Hosting',
    role: 'PWA Web Delivery',
    description: 'Fast, secure edge caching and Progressive Web App client hosting for low-bandwidth rural networks.',
  },
  {
    service: 'Cloud Run',
    role: 'Stateless Microservices',
    description: 'Auto-scaling ingestion pipelines, ARIMA demand forecaster, and linear programming redistribution optimizer.',
  },
  {
    service: 'Cloud Firestore',
    role: 'Real-Time State Store',
    description: 'Live inventory telemetry, real-time emergency alert status, and multi-user transfer order reconciliation.',
  },
  {
    service: 'BigQuery',
    role: 'Federated Health Analytics',
    description: 'Warehouse storing anonymized historical district-level burn rates, seasonal waves, and multi-state aggregates.',
  },
  {
    service: 'Cloud Storage',
    role: 'Encrypted Artifact Depot',
    description: 'Stores compressed register image captures (stripped of patient identifiers) and versioned FedAvg model weights.',
  },
  {
    service: 'Pub/Sub & Scheduler',
    role: 'Event Bus & Cron Engine',
    description: 'Periodic automated stockout risk re-evaluations and asynchronous cross-district notification dispatch.',
  },
  {
    service: 'Gemini 3.8 Flash',
    role: 'Multimodal Parsing & Co-Pilot',
    description: 'Translates messy register photos and multilingual voice notes into structured JSON; drafts alerts and transfer rationales.',
  },
];

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    title: 'Single-District Pilot',
    description: 'Deploy at 10 PHCs in Dewas district to validate mobile camera parsing against physical stock tallies.',
    status: 'Ready for Field Pilot',
  },
  {
    phase: 'Phase 2',
    title: 'State Health Rollout',
    description: 'Integrate with existing state electronic warehouse inventory databases (e-Aushadhi / DVDMS) where permitted.',
    status: 'Architecture Designed',
  },
  {
    phase: 'Phase 3',
    title: 'Multi-State Federation',
    description: 'Expand private FedAvg model weight exchange between Madhya Pradesh, Maharashtra, Kerala, and Assam.',
    status: 'Demonstrated in Demo',
  },
  {
    phase: 'Phase 4',
    title: 'National Grid',
    description: 'Interconnect national emergency medical stockpiles with proactive cross-state buffer redistribution.',
    status: 'Long-Term Vision',
  },
];

export function AboutPage({
  currentLanguage,
  currentRole,
  onNavigateToView,
}: AboutPageProps) {
  const isPhcStaff = currentRole === 'phc_staff';

  // Read Gemini model dynamically from config
  const geminiModelDisplay = CONFIG.GEMINI_MODEL || 'Gemini (model set in configuration)';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          Architecture & System Documentation
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          About PHC Pulse
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          PHC Pulse is an AI-powered supply chain co-pilot designed for Primary Health Centre staff and district health officers across India. It provides real-time visibility into medicine stocks, anticipates critical stock-outs before they happen, and coordinates proactive redistribution across facilities.
        </p>
      </div>

      {/* 7. HOW IT WORKS: 4 CLEAR STEPS (Requirement 7) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            How It Works: The 4-Stage Loop
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            From rural paper registers to optimized inter-facility drug transfers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Step 1: Sense */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="h-7 w-7 rounded-xl bg-teal-600 text-white font-mono text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              <Eye className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">1. Sense</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ANMs capture register photos or speak voice notes in local languages to digitize inventory in seconds.
            </p>
          </div>

          {/* Step 2: Predict */}
          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="h-7 w-7 rounded-xl bg-sky-600 text-white font-mono text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              <TrendingUp className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">2. Predict</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Forecasting models calculate burn rates and days of cover to identify stock-out risks 10–14 days in advance.
            </p>
          </div>

          {/* Step 3: Act */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="h-7 w-7 rounded-xl bg-indigo-600 text-white font-mono text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">3. Act</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Linear programming optimizes cross-district transfers matching surplus batches to urgent deficit facilities.
            </p>
          </div>

          {/* Step 4: Cooperate */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="h-7 w-7 rounded-xl bg-emerald-600 text-white font-mono text-xs font-extrabold flex items-center justify-center">
                4
              </span>
              <Network className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">4. Cooperate</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              States share encrypted model weights through federated learning, improving forecast accuracy without sharing raw data.
            </p>
          </div>
        </div>

        {/* NUMBERS VERSUS LANGUAGE PANEL (Requirement 7) */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-teal-600" />
            <span>Strict Architectural Separation: Numbers vs. Language</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Column 1 */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" />
                <span>Computed by Forecasting & Optimization Engines:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>Historical stock consumption and ARIMA burn rate projections</li>
                <li>Days-of-cover arithmetic (`stock / daily_demand`)</li>
                <li>Risk-level thresholds (Critical ≤ 3d, High 4–7d)</li>
                <li>Linear programming redistribution transfer quantities & routing</li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                <span>Explained & Drafted by {geminiModelDisplay}:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>Multimodal OCR reading of paper registers & audio voice notes</li>
                <li>Translating messy regional handwriting into structured JSON</li>
                <li>Plain-language transfer rationale justifications for officers</li>
                <li>Drafting urgent WhatsApp/SMS alerts and conversational Q&A</li>
              </ul>
            </div>
          </div>

          {/* Mandatory Caption */}
          <p className="text-[11px] font-bold text-center text-teal-800 dark:text-teal-300 pt-1">
            📌 Gemini explains and drafts. It never computes forecasts or transfers.
          </p>
        </div>
      </div>

      {/* 8. ARCHITECTURE DIAGRAM & GOOGLE CLOUD STACK (Requirement 8) */}
      {!isPhcStaff && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              End-to-End System Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              GCP-native cloud topology: edge progressive web apps to serverless state microservices.
            </p>
          </div>

          {/* Accessible SVG Architecture Diagram */}
          <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-x-auto">
            <svg
              viewBox="0 0 780 340"
              className="w-full min-w-[700px] h-auto text-xs"
              aria-label="PHC Pulse System Architecture Diagram showing Firebase Hosting connected to Cloud Run microservices, Firestore, BigQuery, Cloud Storage, Pub/Sub, Gemini API, and Federated State Nodes"
            >
              {/* Box 1: Client Edge */}
              <rect x="20" y="40" width="160" height="260" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" className="dark:fill-slate-900" />
              <text x="100" y="68" textAnchor="middle" fontWeight="bold" fill="#0d9488" fontSize="12">Client Tier (PWA)</text>
              <rect x="35" y="85" width="130" height="40" rx="8" fill="#f0fdfa" stroke="#99f6e4" />
              <text x="100" y="108" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#115e59">Firebase Hosting</text>
              <rect x="35" y="135" width="130" height="40" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="100" y="158" textAnchor="middle" fontSize="10" fill="#334155">Mobile Camera / Audio</text>
              <rect x="35" y="185" width="130" height="40" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="100" y="208" textAnchor="middle" fontSize="10" fill="#334155">IndexedDB Offline Sync</text>
              <rect x="35" y="235" width="130" height="40" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="100" y="258" textAnchor="middle" fontSize="10" fill="#334155">Officer Web Console</text>

              {/* Arrow 1 */}
              <line x1="180" y1="170" x2="230" y2="170" stroke="#0d9488" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Box 2: Cloud Run Microservices */}
              <rect x="230" y="30" width="200" height="280" rx="12" fill="#ffffff" stroke="#0d9488" strokeWidth="2" className="dark:fill-slate-900" />
              <text x="330" y="58" textAnchor="middle" fontWeight="bold" fill="#0d9488" fontSize="12">Cloud Run Microservices</text>
              <rect x="245" y="75" width="170" height="35" rx="6" fill="#f0fdfa" stroke="#5eead4" />
              <text x="330" y="96" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e">Ingestion & Parser Proxy</text>
              <rect x="245" y="120" width="170" height="35" rx="6" fill="#f0fdfa" stroke="#5eead4" />
              <text x="330" y="141" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e">ARIMA Forecast Engine</text>
              <rect x="245" y="165" width="170" height="35" rx="6" fill="#f0fdfa" stroke="#5eead4" />
              <text x="330" y="186" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e">LP Redistribution Optimizer</text>
              <rect x="245" y="210" width="170" height="35" rx="6" fill="#f0fdfa" stroke="#5eead4" />
              <text x="330" y="231" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e">Q&A Grounding Agent</text>
              <rect x="245" y="255" width="170" height="35" rx="6" fill="#f0fdfa" stroke="#5eead4" />
              <text x="330" y="276" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e">Pub/Sub Alert Dispatcher</text>

              {/* Arrow 2 */}
              <line x1="430" y1="110" x2="480" y2="90" stroke="#6366f1" strokeWidth="2" />
              <line x1="430" y1="170" x2="480" y2="170" stroke="#0d9488" strokeWidth="2" />
              <line x1="430" y1="230" x2="480" y2="250" stroke="#0284c7" strokeWidth="2" />

              {/* Box 3: Data & Intelligence Tier */}
              <rect x="480" y="30" width="280" height="280" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" className="dark:fill-slate-900" />
              <text x="620" y="58" textAnchor="middle" fontWeight="bold" fill="#334155" fontSize="12">GCP Storage & Gemini Tier</text>

              <rect x="495" y="75" width="250" height="42" rx="8" fill="#eef2ff" stroke="#c7d2fe" />
              <text x="620" y="94" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3730a3">Gemini 3.8 Flash</text>
              <text x="620" y="108" textAnchor="middle" fontSize="9" fill="#4338ca">Multimodal OCR & Multilingual Q&A</text>

              <rect x="495" y="125" width="250" height="42" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="620" y="144" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">Firestore & BigQuery</text>
              <text x="620" y="158" textAnchor="middle" fontSize="9" fill="#475569">Real-time state & Anonymized historical analytics</text>

              <rect x="495" y="175" width="250" height="42" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="620" y="194" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">Cloud Storage (GCS)</text>
              <text x="620" y="208" textAnchor="middle" fontSize="9" fill="#475569">Encrypted model checkpoints & tensor deltas</text>

              <rect x="495" y="225" width="250" height="65" rx="8" fill="#f0fdf4" stroke="#bbf7d0" />
              <text x="620" y="244" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#166534">Federated Aggregator Node</text>
              <text x="620" y="258" textAnchor="middle" fontSize="9" fill="#15803d">4 State Nodes: MP · MH · KL · AS</text>
              <text x="620" y="272" textAnchor="middle" fontSize="8" fontStyle="italic" fill="#166534">Zero raw health records exchanged</text>
            </svg>
          </div>

          {/* Table of Google Services */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="p-2.5 pl-3">Google Cloud Service</th>
                  <th className="p-2.5">System Role</th>
                  <th className="p-2.5 pr-3">Technical Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {GOOGLE_SERVICES.map((srv) => (
                  <tr key={srv.service} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 pl-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {srv.service}
                    </td>
                    <td className="p-2.5 font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                      {srv.role}
                    </td>
                    <td className="p-2.5 pr-3 text-slate-600 dark:text-slate-400">
                      {srv.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. RESPONSIBLE AI AND LIMITS (Requirement 9) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Responsible AI & Ethical Governance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transparent commitments and honest operational limitations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Commitments */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Core Safety Commitments</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Human in the Loop:</strong> District health officers review and approve every redistribution order.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Strict Grounding:</strong> AI answers state &ldquo;Not enough data&rdquo; rather than fabricating numbers.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Review Flags:</strong> Low-confidence OCR or handwriting is flagged with amber badges for human verification.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Zero Patient Data:</strong> Patient names, OPD slips, and clinical tokens are strictly omitted and never stored.</span>
              </li>
            </ul>
          </div>

          {/* Limitations */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Current Prototype Limitations</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Demo uses synthetic data generated across 16 sample PHCs in 4 state nodes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Federated learning convergence curves are simulated for demonstrative purposes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Demand forecast models require historical validation against real state warehouse records.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Integrations with existing state systems (e-Aushadhi / DVDMS) are planned for field trials.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 10. ROADMAP TO NATIONAL SCALE (Requirement 10) */}
      {!isPhcStaff && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Roadmap to National Scale
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Phased rollout strategy from single-district pilot to national healthcare grid.
            </p>
          </div>

          {/* Timeline Grid (Vertical on Mobile, Horizontal on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {ROADMAP_PHASES.map((phase, idx) => (
              <div
                key={phase.phase}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-800">
                    {phase.phase}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                </div>

                <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                  {phase.title}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {phase.description}
                </p>

                <div className="pt-2 text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                  Status: {phase.status}
                </div>
              </div>
            ))}
          </div>

          {/* Mandatory Closing Line (Requirement 10) */}
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 italic pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            &ldquo;The same architecture can extend to other countries facing similar challenges.&rdquo;
          </p>
        </div>
      )}

      {/* 11. LINKS AND CREDITS (Requirement 11) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Artifacts & Resources
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Source code, architecture diagrams, and evaluation documentation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://github.com/google-cloud-community"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs min-h-[40px] transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>

            <button
              type="button"
              onClick={() => onNavigateToView?.('impact')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs min-h-[40px] transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>View Impact Metrics</span>
            </button>
          </div>
        </div>

        {/* Footer Credit (Requirement 11) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Built for <strong>Build with AI: Code for Communities</strong>. Demo uses synthetic data.
        </div>
      </div>
    </div>
  );
}

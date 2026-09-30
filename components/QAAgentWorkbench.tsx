'use client';

import React, { useState } from 'react';
import {
  MessageSquareText,
  ShieldCheck,
  Send,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Loader2,
  Building2,
  FileCode,
} from 'lucide-react';
import { QAAgentResponse } from '@/types/qa';

const SAMPLE_DISTRICT_DATA_CONTEXT = `[DISTRICT HEALTH REGISTER & DOC FORECAST - 2026-09-29]
District: Satara, Maharashtra | Country: India | Authorized Scope: Satara District

Facility 1: PHC-IN-MH-204 (Satara Rural)
- Paracetamol 500mg: 120 strips | daily burn: 25 strips | days_of_cover: 4.8 (rounded: 5) | risk_level: Critical
- Amoxicillin 250mg: 45 vials | daily burn: 10 vials | days_of_cover: 4.5 (rounded: 4) | risk_level: Critical
- ORS 20.5g sachets: 350 packs | daily burn: 30 packs | days_of_cover: 11.6 (rounded: 12) | risk_level: Warning
- Beds Available: 4 vacant out of 10 total
- Staff Present: 3 (1 Medical Officer, 1 Staff Nurse, 1 Pharmacist)

Facility 2: PHC-IN-MH-108 (Karad Sub-centre)
- Paracetamol 500mg: 900 strips | daily burn: 20 strips | days_of_cover: 45 | risk_level: Healthy
- Amoxicillin 250mg: 300 vials | daily burn: 8 vials | days_of_cover: 37 | risk_level: Healthy
- ORS 20.5g sachets: 1,800 packs | daily burn: 25 packs | days_of_cover: 72 | risk_level: Surplus
- Beds Available: 8 vacant out of 12 total
- Staff Present: 4 (2 Medical Officers, 2 Nurses)

Facility 3: PHC-Rampur (North Block)
- Paracetamol 500mg: 500 tablets (~50 strips) | daily burn: 25 strips | days_of_cover: 2 | risk_level: Critical
- ORS sachets: 20 packs | daily burn: 20 packs | days_of_cover: 1 | risk_level: Critical
- Beds Available: 2 vacant out of 6 total
- Staff Present: 3 staff members present

Facility 4: PHC-IN-MH-312 (Wai Hill Station)
- Paracetamol 500mg: 200 strips | daily burn: 15 strips | days_of_cover: 13 | risk_level: Warning
- ORS sachets: 400 packs | daily burn: 15 packs | days_of_cover: 26 | risk_level: Healthy
- Beds Available: 1 vacant out of 8 total
- Staff Present: 2 (1 Staff Nurse, 1 ANM)`;

export function QAAgentWorkbench() {
  const [dataContext, setDataContext] = useState<string>(SAMPLE_DISTRICT_DATA_CONTEXT);
  const [question, setQuestion] = useState<string>(
    'Which PHCs will run out of paracetamol next week, and what action should we take?'
  );
  const [officerCountry, setOfficerCountry] = useState<string>('India');
  const [officerDistrict, setOfficerDistrict] = useState<string>('Satara');

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<QAAgentResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAskQuestion = async (customQ?: string) => {
    const qToUse = customQ || question;
    if (!qToUse.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/qa-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToUse,
          dataContext,
          officerScope: {
            allowed_countries: [officerCountry],
            allowed_districts: [officerDistrict],
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to process Q&A Agent query.');

      setResponse(json);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error executing Q&A Agent.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>PHC Pulse Q&A Agent</span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/40 text-teal-300 font-mono">
                  Strict Data-Grounded
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Decision co-pilot for district & national health officers. Answers using ONLY supplied DATA CONTEXT with strict zero-hallucination discipline.
              </p>
            </div>
          </div>

          {/* Access Scope Selector */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
              <Lock className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-slate-500 text-[11px]">Scope:</span>
              <span className="font-semibold text-slate-200">{officerDistrict} ({officerCountry})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Context on Left, Query & Structured Response on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: DATA CONTEXT Editor */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Data Context (Strict Source of Truth)
                </span>
              </div>
              <button
                onClick={() => setDataContext(SAMPLE_DISTRICT_DATA_CONTEXT)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-mono transition-colors"
              >
                Reset Default
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Rule 1: Only numbers and facility names in this context will ever be used. If missing, the agent outputs &ldquo;Not enough data&rdquo;.
            </p>

            <textarea
              rows={16}
              value={dataContext}
              onChange={(e) => setDataContext(e.target.value)}
              className="w-full flex-1 rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Right Column: Question Dispatcher & Structured JSON Output */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Question Dispatch Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Officer Inquiry
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about stockouts, days of cover, beds, or staff attendance..."
                className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskQuestion();
                }}
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={isLoading || !question.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Ask Agent</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Quick queries:</span>
              <button
                onClick={() => {
                  const q = 'Which PHCs will run out of paracetamol next week?';
                  setQuestion(q);
                  handleAskQuestion(q);
                }}
                className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                Paracetamol stock-out next week
              </button>
              <button
                onClick={() => {
                  const q = 'Move 300 ORS packs from Karad to PHC Rampur.';
                  setQuestion(q);
                  handleAskQuestion(q);
                }}
                className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                Action test: &ldquo;Move 300 ORS packs&rdquo;
              </button>
              <button
                onClick={() => {
                  const q = 'Which facilities have critical bed capacity?';
                  setQuestion(q);
                  handleAskQuestion(q);
                }}
                className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                Bed availability audit
              </button>
              <button
                onClick={() => {
                  const q = 'What is the stock status in Chennai, Tamil Nadu?';
                  setQuestion(q);
                  handleAskQuestion(q);
                }}
                className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                Scope check: &ldquo;Chennai status&rdquo;
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Structured Output View */}
          {response && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col gap-4">
              {/* Answer Card (Rule 2: Lead with answer, then give reason) */}
              <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                  <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                    Agent Answer (Rule 2: Action First)
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-300 font-mono">Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="font-mono">Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  {response.answer_summary}
                </p>

                {response.suggested_next_action && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span><strong>Suggested Next Action:</strong> {response.suggested_next_action}</span>
                  </div>
                )}
              </div>

              {/* Urgency-sorted Affected PHCs (Rule 4: lowest days of cover first) */}
              {response.affected_phcs && response.affected_phcs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5 text-teal-400" />
                      Affected PHCs (Sorted by Urgency · Rule 4)
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Lowest days of cover first
                    </span>
                  </div>

                  <div className="space-y-2">
                    {response.affected_phcs.map((phc, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                          phc.risk_level === 'Critical'
                            ? 'bg-red-950/20 border-red-900/50 text-red-200'
                            : phc.risk_level === 'High'
                            ? 'bg-orange-950/20 border-orange-900/50 text-orange-200'
                            : phc.risk_level === 'Medium'
                            ? 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 font-mono">{phc.phc_id}</span>
                            <span className="text-slate-300 font-medium">· {phc.phc_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            District: {phc.district} · Item: <span className="text-slate-200 font-sans">{phc.medicine}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold tabular-nums text-sm">
                              {phc.days_of_cover} DOC
                            </span>
                            <span className="text-[10px] uppercase font-semibold tracking-wider">
                              {phc.risk_level} Risk
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources & Confidence Note (Rule 8) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block mb-1">
                    Data Sources Used
                  </span>
                  <div className="space-y-0.5 text-slate-300 font-mono text-[11px]">
                    {response.data_sources_used.map((s, idx) => (
                      <div key={idx}>· {s}</div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                      Confidence
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      response.confidence === 'High'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : response.confidence === 'Medium'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        : 'bg-red-950/60 text-red-300 border border-red-800/40'
                    }`}>
                      {response.confidence}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {response.confidence_note}
                  </p>
                </div>
              </div>

              {/* Exact JSON View */}
              <div className="mt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                  <FileCode className="h-3.5 w-3.5 text-teal-400" />
                  <span className="font-mono">JSON Matching Target Schema</span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-auto max-h-48 whitespace-pre">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

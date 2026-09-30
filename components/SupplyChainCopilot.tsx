'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertOctagon,
  ArrowRightLeft,
  FileCheck,
  CheckCircle,
  Globe2,
  Clock,
  Check,
  Loader2,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { ParseResult, StockItem, TransferOrderDraft } from '@/types/parser';

interface SupplyChainCopilotProps {
  currentData: ParseResult;
  onApproveTransferOrder?: (order: TransferOrderDraft) => void;
}

// Daily burn rate benchmarks for district modeling
const CONSUMPTION_RATES: Record<string, number> = {
  paracetamol: 25,
  amoxicillin: 12,
  ors: 30,
  rehydration: 30,
  cotrimoxazole: 10,
  insulin: 5,
  metamizole: 20,
  dipirona: 20,
  ceftriaxone: 6,
  artemether: 15,
  dextrose: 8,
};

// Module-level ID generator for draft orders
let transferCounter = 1024;
function generateTransferOrderId(): string {
  transferCounter += 1;
  return `TR-${transferCounter}`;
}

export function SupplyChainCopilot({ currentData, onApproveTransferOrder }: SupplyChainCopilotProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>>([
    {
      role: 'assistant',
      text: `Greetings, District Health Officer. I am PHC Pulse, your public health supply chain co-pilot grounded in the verified register data from ${
        currentData.phc_id || 'this facility'
      }. How can I assist you with stockout forecasts, surplus redistribution, or drafting transfer orders today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [activeTransferDraft, setActiveTransferDraft] = useState<TransferOrderDraft | null>(null);
  const [transferApproved, setTransferApproved] = useState(false);

  // Compute Days of Cover for parsed inventory
  const inventoryAnalysis = currentData.stock.map((item) => {
    let matchedRate = 15; // default fallback daily consumption
    const lowerMed = item.medicine.toLowerCase();
    for (const [key, rate] of Object.entries(CONSUMPTION_RATES)) {
      if (lowerMed.includes(key)) {
        matchedRate = rate;
        break;
      }
    }

    const qty = item.quantity ?? 0;
    const daysOfCover = Math.round(qty / matchedRate);
    let riskLevel: 'Critical' | 'Warning' | 'Healthy' | 'Surplus' = 'Healthy';

    if (qty === 0 || daysOfCover < 5) riskLevel = 'Critical';
    else if (daysOfCover <= 14) riskLevel = 'Warning';
    else if (daysOfCover > 60) riskLevel = 'Surplus';

    return {
      medicine: item.medicine,
      qty,
      unit: item.unit || 'units',
      burnRatePerDay: matchedRate,
      daysOfCover,
      riskLevel,
    };
  });

  const handleSendPrompt = async (promptText: string, actionType: string = 'general') => {
    if (!promptText.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatLog((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          query: promptText,
          currentInventory: currentData,
          districtContext: {
            phc_id: currentData.phc_id,
            days_of_cover_analysis: inventoryAnalysis,
            neighboring_phcs: [
              { phc_id: 'PHC-DIST-01', distance_km: 14, surplus_items: ['Paracetamol 500mg tab', 'Oral Rehydration Salts'] },
              { phc_id: 'PHC-DIST-02', distance_km: 26, deficit_items: ['Amoxicillin 250mg vial', 'Co-trimoxazole'] },
            ],
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get answer from PHC Pulse co-pilot.');

      const assistantMsg = {
        role: 'assistant' as const,
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatLog((prev) => [...prev, assistantMsg]);

      // If action was draft_transfer, create draft object
      if (actionType === 'draft_transfer') {
        const firstDeficit = inventoryAnalysis.find((i) => i.riskLevel === 'Critical' || i.riskLevel === 'Warning') || inventoryAnalysis[0];
        setActiveTransferDraft({
          order_id: generateTransferOrderId(),
          from_phc: 'PHC-DIST-01 (Surplus Depot)',
          to_phc: currentData.phc_id || 'PHC-CURRENT',
          item: firstDeficit?.medicine || 'Paracetamol 500mg tab',
          quantity: 200,
          unit: firstDeficit?.unit || 'packs',
          urgency: firstDeficit?.riskLevel === 'Critical' ? 'Emergency' : 'Urgent',
          expiry_date: '2027-10-31',
          cold_chain_required: (firstDeficit?.medicine || '').toLowerCase().includes('insulin'),
          cold_chain_notes: (firstDeficit?.medicine || '').toLowerCase().includes('insulin')
            ? 'Maintain 2°C - 8°C cold box with freeze indicator'
            : undefined,
          rationale: `Move 200 ${firstDeficit?.unit || 'packs'} because ${currentData.phc_id || 'destination'} has ${firstDeficit?.daysOfCover || 4} days of cover remaining.`,
          days_of_cover_destination: (firstDeficit?.daysOfCover || 4) + 14,
          status: 'Draft - Pending Officer Approval',
          timestamp: new Date().toISOString(),
        });
        setTransferApproved(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error contacting supply co-pilot: ${error.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDraft = () => {
    if (!activeTransferDraft) return;
    const approved: TransferOrderDraft = {
      ...activeTransferDraft,
      status: 'Approved by District Officer',
    };
    setActiveTransferDraft(approved);
    setTransferApproved(true);
    if (onApproveTransferOrder) {
      onApproveTransferOrder(approved);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Days of Cover Buffer Table */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Days of Cover (DOC) Forecast
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Facility: {currentData.phc_id || 'Parsed PHC'}
            </span>
          </div>

          <div className="space-y-2">
            {inventoryAnalysis.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs"
              >
                <div className="flex flex-col pr-2 max-w-[190px]">
                  <span className="font-medium text-slate-200 truncate">{item.medicine}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Stock: {item.qty} {item.unit} (burn: ~{item.burnRatePerDay}/day)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono tabular-nums font-semibold text-slate-100">
                      {item.daysOfCover} days
                    </span>
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider ${
                        item.riskLevel === 'Critical'
                          ? 'text-red-400'
                          : item.riskLevel === 'Warning'
                          ? 'text-amber-400'
                          : item.riskLevel === 'Surplus'
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Officer Action Dispatchers
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() =>
                  handleSendPrompt(
                    'Which medicines at this PHC are at risk of running out within 7 days, and what are their remaining days of cover?',
                    'forecast_query'
                  )
                }
                className="text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between group transition-colors"
              >
                <span>Check impending 7-day stock-outs</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </button>

              <button
                onClick={() =>
                  handleSendPrompt(
                    'Draft a formal inter-facility transfer order recommendation to replenish low stock at this PHC from neighboring surplus depots.',
                    'draft_transfer'
                  )
                }
                className="text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between group transition-colors"
              >
                <span>Draft Transfer Order recommendation</span>
                <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </button>

              <button
                onClick={() =>
                  handleSendPrompt(
                    'Draft an Early Warning Bulletin for district health leadership on supplies with Critical days of cover.',
                    'draft_alert'
                  )
                }
                className="text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between group transition-colors"
              >
                <span>Draft Emergency Early Warning Bulletin</span>
                <AlertOctagon className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>

              <button
                onClick={() =>
                  handleSendPrompt(
                    'Explain how our state public health supply forecasting models benefited from inter-state federated learning updates shared across Madhya Pradesh, Maharashtra, Kerala, and Assam, while respecting data sovereignty.',
                    'federated_insight'
                  )
                }
                className="text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between group transition-colors"
              >
                <span>Explain Inter-State Federated Learning Insights</span>
                <Globe2 className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Order Approval Card (Rule 3: Keep Human in the Loop) */}
        {activeTransferDraft && (
          <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-teal-800/40 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                  Transfer Order #{activeTransferDraft.order_id}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                  transferApproved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {activeTransferDraft.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">From Source PHC:</span>
                <span className="font-mono text-slate-200">{activeTransferDraft.from_phc}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">To Destination PHC:</span>
                <span className="font-mono text-slate-200">{activeTransferDraft.to_phc}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Supply Item:</span>
                <span className="font-semibold text-slate-100">{activeTransferDraft.item}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Quantity to Dispatch:</span>
                <span className="font-mono font-bold text-teal-300">
                  {activeTransferDraft.quantity} {activeTransferDraft.unit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Urgency:</span>
                <span className="font-semibold text-amber-300">{activeTransferDraft.urgency}</span>
              </div>
              {activeTransferDraft.cold_chain_required && (
                <div className="p-2 rounded bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300">
                  ❄️ Cold Chain Protocol: {activeTransferDraft.cold_chain_notes}
                </div>
              )}
              <div className="text-[11px] text-slate-400 italic pt-1">
                Rationale: {activeTransferDraft.rationale}
              </div>
            </div>

            {/* Officer Action */}
            <div className="mt-4 pt-3 border-t border-teal-800/40 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Rule 3: Officer approval required prior to logistics dispatch.
              </span>
              {!transferApproved ? (
                <button
                  onClick={handleApproveDraft}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve & Authorise</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>Authorised by District Officer</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: AI Co-Pilot Dialogue */}
      <div className="lg:col-span-7 flex flex-col h-[640px] rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        {/* Dialogue Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                PHC Pulse District Co-Pilot
              </div>
              <div className="text-[11px] text-slate-400">
                Action-First Public Health Communicator · Grounded in verified register data
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-teal-400 px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/50">
            Model: Gemini 3.8 Flash
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] font-mono text-right ${
                    msg.role === 'user' ? 'text-teal-200/80' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
              <span>Analyzing supply chain models and drafting response...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(query, 'general');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask PHC Pulse (e.g. 'Which items need replenishment before Friday?')..."
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-3.5 py-2 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

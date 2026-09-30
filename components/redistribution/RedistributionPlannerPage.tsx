'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Map as MapIcon,
  List,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Clock,
  Check,
  Loader2,
  History,
  Info,
  Lock,
  CalendarCheck,
  Truck,
} from 'lucide-react';
import { TransferPlanItem, PlanSummary } from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';
import { ApiClient } from '@/lib/api-client';
import { TransferCard } from './TransferCard';
import { RedistributionMap } from './RedistributionMap';
import { TransferOrderModal } from './TransferOrderModal';

interface RedistributionPlannerPageProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
  selectedDeficitItem?: any;
}

export function RedistributionPlannerPage({
  currentLanguage,
  currentRole,
  selectedDeficitItem,
}: RedistributionPlannerPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [transfers, setTransfers] = useState<TransferPlanItem[]>([]);
  const [summary, setSummary] = useState<PlanSummary | null>(null);
  const [planId, setPlanId] = useState<string>('PLAN-2026-0930-01');
  const [generatedAt, setGeneratedAt] = useState<string>('Today, 08:30 AM');
  const [isRestricted, setIsRestricted] = useState<boolean>(currentRole === 'phc_staff');

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [activeModalTransfer, setActiveModalTransfer] = useState<TransferPlanItem | null>(null);

  // Edit quantity warning toast
  const [editWarning, setEditWarning] = useState<string | null>(null);

  const approverTitle =
    currentRole === 'district_officer'
      ? 'District Chief Medical Officer, Dewas'
      : currentRole === 'state_national_officer'
      ? 'State Health Logistics Commissioner'
      : 'Primary Health Officer';

  const [retryCount, setRetryCount] = useState(0);

  // Load plan from API
  useEffect(() => {
    let isCancelled = false;
    async function fetchPlan() {
      try {
        setLoading(true);
        setError(null);
        const res = await ApiClient.getPlan({
          role: currentRole,
          district: currentRole === 'district_officer' ? 'Dewas' : undefined,
          state: selectedState !== 'All' ? selectedState : undefined,
        });

        if (isCancelled) return;

        if (res.restricted) {
          setIsRestricted(true);
        } else {
          setIsRestricted(false);
          setPlanId(res.plan_id);
          setGeneratedAt(res.generated_at);
          // Order by urgency: destination days of cover ascending (lowest first)
          const sorted = (res.transfers || []).sort((a, b) => a.to_days_before - b.to_days_before);
          setTransfers(sorted);
          setSummary(res.summary);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to load redistribution plan');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchPlan();

    return () => {
      isCancelled = true;
    };
  }, [currentRole, selectedState, retryCount]);

  // Generate / re-optimize plan
  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true);
      const res = await ApiClient.generatePlan();
      setPlanId(res.plan_id);
      setGeneratedAt(res.generated_at);
      const sorted = (res.transfers || []).sort((a, b) => a.to_days_before - b.to_days_before);
      setTransfers(sorted);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err?.message || 'Failed to re-optimize plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve single transfer
  const handleApprove = async (transferId: string) => {
    const res = await ApiClient.approvePlan(transferId, approverTitle);
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? res.transfer : t))
    );
    if (res.summary) setSummary(res.summary);
  };

  // Reject single transfer
  const handleReject = async (transferId: string, reason: string) => {
    const res = await ApiClient.rejectPlan(transferId, reason, approverTitle);
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? res.transfer : t))
    );
    if (res.summary) setSummary(res.summary);
  };

  // Edit transfer quantity
  const handleEditQuantity = async (transferId: string, newQuantity: number) => {
    const res = await ApiClient.editPlanQuantity(transferId, newQuantity, approverTitle);
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? res.transfer : t))
    );
    if (res.summary) setSummary(res.summary);
    if (res.warnings && res.warnings.length > 0) {
      setEditWarning(res.warnings[0]);
      setTimeout(() => setEditWarning(null), 6000);
    }
  };

  // Bulk Approve Critical/High
  const handleConfirmBulkApprove = async () => {
    try {
      setIsBulkApproving(true);
      const res = await ApiClient.approveAllPlans(approverTitle);
      const sorted = (res.transfers || []).sort((a, b) => a.to_days_before - b.to_days_before);
      setTransfers(sorted);
      setSummary(res.summary);
      setShowBulkModal(false);
    } finally {
      setIsBulkApproving(false);
    }
  };

  // 1. Role Restriction Guard for PHC Staff
  if (currentRole === 'phc_staff' || isRestricted) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-lg mx-auto my-12 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Access Restricted: Officer Clearance Required
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Inter-facility redistribution and stock transfer authorization is reserved for <strong>District Health Officers</strong> and <strong>State Officers</strong>. PHC staff report inventory on the &ldquo;Report Stock&rdquo; screen.
        </p>
        <div className="mt-4 text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          Switch to &ldquo;District Officer&rdquo; or &ldquo;State Officer&rdquo; in the top bar to inspect transfer orders.
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-semibold">Generating network redistribution matrix...</span>
      </div>
    );
  }

  // 3. Error State with Retry
  if (error && !summary) {
    return (
      <div className="p-8 text-center rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 max-w-lg mx-auto my-12">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-bold">Failed to load redistribution plan</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const criticalHighPending = transfers.filter(
    (t) => (t.urgency === 'Critical' || t.urgency === 'High') && t.status === 'PENDING_APPROVAL'
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Action & View Switcher Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Redistribution Planner
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Min-Cost Flow (OR-Tools)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Optimized inter-facility transfers pairing acute shortages with near-expiry surplus depots · Plan: <strong className="font-mono">{planId}</strong> ({generatedAt})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* List vs Map Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Route Map</span>
            </button>
          </div>

          {/* Re-generate button */}
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 min-h-[44px]"
            title="Re-run OR-Tools optimization model"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span>Generate Plan</span>
          </button>

          {/* Bulk Approve Button */}
          {criticalHighPending.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Approve All Critical/High ({criticalHighPending.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety & Warning Banner if Edit Triggered Warning */}
      {editWarning && (
        <aside aria-label="Safety Warning" className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{editWarning}</span>
        </aside>
      )}

      {/* Summary KPI Strip */}
      {summary && (
        <section aria-label="Redistribution Metrics Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Total Transfers & Approvals */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Transfers Configured</span>
              <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {summary.total_transfers}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({summary.approved_count} approved)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {summary.pending_count} pending officer sign-off
              </div>
            </div>
          </div>

          {/* Card 2: Stockout Days Avoided */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Stockout Days Avoided</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ~{summary.estimated_stockout_days_avoided} Days
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Cumulative emergency buffer restored
              </div>
            </div>
          </div>

          {/* Card 3: Expired Stock Value Saved (INR) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Surplus Value Saved</span>
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{summary.estimated_value_inr_saved.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Saved from expiry waste (illustrative)
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data Sovereignty Notice (Strict Intra-State rule) */}
      <aside aria-label="Data Sovereignty Compliance" className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start sm:items-center gap-2">
        <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          <strong>Data Sovereignty & Logistics Boundary:</strong> All transfers operate strictly within state borders ({currentRole === 'district_officer' ? 'Dewas / Indore districts' : 'State Nodes'}). Cross-state learning happens through the federated model, not physical stock movement.
        </span>
      </aside>

      {/* Main View: List View or Route Map */}
      {transfers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-slate-800 dark:text-slate-200">No transfers needed.</p>
          <p className="text-xs mt-1">All essential medicine stocks across facilities are currently above safe threshold levels.</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-6">
          <RedistributionMap
            transfers={transfers}
            selectedTransferId={selectedTransferId}
            onSelectTransfer={setSelectedTransferId}
            selectedState={selectedState}
            onStateSelect={setSelectedState}
          />

          {/* Cards below Map */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Transfer Orders ({transfers.length})
            </h3>
            {transfers.map((t) => (
              <TransferCard
                key={t.id}
                transfer={t}
                isSelected={selectedTransferId === t.id}
                onSelect={() => setSelectedTransferId(t.id)}
                onApprove={handleApprove}
                onReject={handleReject}
                onEditQuantity={handleEditQuantity}
                onViewOrder={(item) => setActiveModalTransfer(item)}
                currentRole={currentRole}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((t) => (
            <TransferCard
              key={t.id}
              transfer={t}
              isSelected={selectedTransferId === t.id}
              onSelect={() => setSelectedTransferId(t.id)}
              onApprove={handleApprove}
              onReject={handleReject}
              onEditQuantity={handleEditQuantity}
              onViewOrder={(item) => setActiveModalTransfer(item)}
              currentRole={currentRole}
            />
          ))}
        </div>
      )}

      {/* Bulk Approval Confirmation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 mb-2">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Authorize All Critical/High Priority Transfers
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              You are approving <strong>{criticalHighPending.length}</strong> urgent stock reallocations as <strong>{approverTitle}</strong>.
            </p>

            {/* List of items that will be approved */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              {criticalHighPending.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.medicine}</span>
                    <div className="text-[11px] text-slate-500">{item.from_name} → {item.to_name} ({item.quantity.toLocaleString()} {item.unit})</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.urgency === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.urgency}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkApprove}
                disabled={isBulkApproving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
              >
                {isBulkApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Sign & Authorize All ({criticalHighPending.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Order Printable Modal */}
      {activeModalTransfer && (
        <TransferOrderModal
          transfer={activeModalTransfer}
          onClose={() => setActiveModalTransfer(null)}
          currentRole={currentRole}
        />
      )}
    </div>
  );
}

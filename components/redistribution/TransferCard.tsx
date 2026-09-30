'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Snowflake,
  CalendarClock,
  Edit2,
  Check,
  X,
  FileText,
  Printer,
  History,
  Info,
  MapPin,
} from 'lucide-react';
import { TransferPlanItem, RiskLevel } from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';

interface TransferCardProps {
  transfer: TransferPlanItem;
  isSelected?: boolean;
  onSelect?: () => void;
  onApprove: (transferId: string) => Promise<void>;
  onReject: (transferId: string, reason: string) => Promise<void>;
  onEditQuantity: (transferId: string, newQuantity: number) => Promise<void>;
  onViewOrder: (transfer: TransferPlanItem) => void;
  currentRole: UserRole;
}

export function TransferCard({
  transfer,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onEditQuantity,
  onViewOrder,
  currentRole,
}: TransferCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(transfer.quantity);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isCritical = transfer.urgency === 'Critical';
  const isApproved = transfer.status === 'APPROVED' || transfer.status === 'DISPATCHED';
  const isPending = transfer.status === 'PENDING_APPROVAL';

  const getRiskBadge = (days: number) => {
    if (days <= 3.0) {
      return {
        label: `${days}d (Critical)`,
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300',
        icon: <AlertOctagon className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />,
      };
    }
    if (days <= 7.0) {
      return {
        label: `${days}d (High)`,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border-orange-300',
        icon: <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 shrink-0" />,
      };
    }
    if (days <= 14.0) {
      return {
        label: `${days}d (Medium)`,
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300',
        icon: <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />,
      };
    }
    return {
      label: `${days}d (Low)`,
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    };
  };

  const fromBefore = getRiskBadge(transfer.from_days_before);
  const fromAfter = getRiskBadge(transfer.from_days_after);
  const toBefore = getRiskBadge(transfer.to_days_before);
  const toAfter = getRiskBadge(transfer.to_days_after);

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      await onEditQuantity(transfer.id, editQty);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      setIsSubmitting(true);
      await onReject(transfer.id, rejectReason || 'Declined upon district stock review');
      setIsRejecting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-xs ${
        isSelected
          ? 'ring-2 ring-teal-500 bg-teal-50/20 dark:bg-teal-950/20 border-teal-500'
          : isCritical && isPending
          ? 'border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      {/* Top Header: Route & Urgency */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Urgency Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              transfer.urgency === 'Critical'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                : transfer.urgency === 'High'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border border-orange-300 dark:border-orange-800'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
            }`}
          >
            {transfer.urgency === 'Critical' && <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />}
            {transfer.urgency === 'High' && <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />}
            {transfer.urgency === 'Medium' && <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
            <span>{transfer.urgency} Urgency</span>
          </span>

          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {transfer.id}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-slate-400" />
            <span>{transfer.road_distance_km} km road route</span>
          </span>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              transfer.status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                : transfer.status === 'DISPATCHED'
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
                : transfer.status === 'REJECTED'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                : 'bg-amber-50 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300'
            }`}
          >
            {transfer.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main Route Card: Source -> Destination */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Source PHC */}
        <div className="md:col-span-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Source Facility (Surplus Depot)
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {transfer.from_name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {transfer.from_district}, {transfer.state}
          </div>

          {/* Days of Cover Before -> After */}
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">Buffer:</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold">
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${fromBefore.color}`}>
                {fromBefore.label}
              </span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${fromAfter.color}`}>
                {fromAfter.label}
              </span>
            </div>
          </div>
        </div>

        {/* Center Transfer Arrow + Medicine Badge */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-1">
          <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 mb-1">
            <ArrowRight className="h-5 w-5" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {transfer.medicine}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-20 p-1 text-xs font-bold border rounded bg-white dark:bg-slate-900 font-mono text-center"
              />
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="p-1 rounded bg-teal-600 text-white"
                title="Save quantity"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs font-mono font-extrabold text-teal-700 dark:text-teal-400">
              <span>{transfer.quantity.toLocaleString()} {transfer.unit}</span>
              {isPending && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                  title="Edit transfer quantity"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Destination PHC */}
        <div className="md:col-span-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-1">
            Destination Facility (Deficit Shortage)
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {transfer.to_name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {transfer.to_district}, {transfer.state}
          </div>

          {/* Days of Cover Before -> After */}
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">Buffer:</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold">
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${toBefore.color}`}>
                {toBefore.label}
              </span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${toAfter.color}`}>
                {toAfter.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* One-Line Plain Language Rationale */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wide text-[10px] mr-1.5">
          Rationale:
        </span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">
          {transfer.one_line_reason}
        </span>
      </div>

      {/* Watch-Out Chips */}
      {transfer.watch_out_chips && transfer.watch_out_chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Watch Out:
          </span>
          {transfer.watch_out_chips.map((chip, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                chip.includes('Cold')
                  ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                  : chip.includes('Expiry')
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {chip.includes('Cold') && <Snowflake className="h-3 w-3 text-sky-500" />}
              {chip.includes('Expiry') && <Clock className="h-3 w-3 text-amber-500" />}
              <span>{chip}</span>
            </span>
          ))}
        </div>
      )}

      {/* Rejection Note if Rejected */}
      {transfer.status === 'REJECTED' && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
          <strong>Rejection Reason:</strong> {transfer.rejection_reason || 'Declined by officer'}
        </div>
      )}

      {/* Reject Input Box */}
      {isRejecting && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2 animate-in fade-in">
          <label className="block text-xs font-bold text-rose-900 dark:text-rose-200">
            Specify Reason for Rejection:
          </label>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Local stock reservation required for upcoming immunization drive"
            className="w-full p-2 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-[40px]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsRejecting(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 border"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {/* Actions and Approver Stamp */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Approver details or activity log toggle */}
        <div className="flex items-center gap-2">
          {transfer.approved_by && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Approved by {transfer.approved_by} ({transfer.approved_at})</span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHistory(!showHistory);
            }}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline flex items-center gap-1 min-h-[36px]"
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRejecting(true);
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 text-xs font-semibold transition-colors min-h-[44px]"
              >
                Reject
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(transfer.id);
                }}
                disabled={isSubmitting}
                data-demo-target="transfer-approval-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px]"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Approve Transfer</span>
              </button>
            </>
          )}

          {isApproved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewOrder(transfer);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors min-h-[44px]"
            >
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Print / Download Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Log Accordion */}
      {showHistory && transfer.activity_logs && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
            Chain of Custody & Officer Audit Log
          </div>
          {transfer.activity_logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 last:border-0 last:pb-0">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">
                  {log.action}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {log.note || `Action logged by ${log.actor}`}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

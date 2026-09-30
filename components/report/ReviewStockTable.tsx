'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Bed,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Info,
} from 'lucide-react';
import { StockItemReport } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';

interface ReviewStockTableProps {
  stock: StockItemReport[];
  onStockChange: (stock: StockItemReport[]) => void;
  bedsAvailable: number;
  onBedsChange: (val: number) => void;
  staffPresent: number;
  onStaffChange: (val: number) => void;
  warnings: string[];
  onSubmit: () => void;
  isSubmitting: boolean;
  isOffline: boolean;
  onCancel: () => void;
  currentLanguage: LanguageCode;
}

export function ReviewStockTable({
  stock,
  onStockChange,
  bedsAvailable,
  onBedsChange,
  staffPresent,
  onStaffChange,
  warnings,
  onSubmit,
  isSubmitting,
  isOffline,
  onCancel,
  currentLanguage,
}: ReviewStockTableProps) {
  const [expandedRawIndex, setExpandedRawIndex] = useState<number | null>(null);

  // Check if any row needs review and hasn't been checked or edited
  const uncheckedRowsCount = stock.filter(
    (r) => (r.needs_review || (typeof r.confidence === 'number' && r.confidence < 0.8)) && !r.is_checked
  ).length;

  const canSubmit = uncheckedRowsCount === 0 && stock.length > 0;

  const handleRowChange = (index: number, field: keyof StockItemReport, value: any) => {
    const updated = [...stock];
    updated[index] = {
      ...updated[index],
      [field]: value,
      is_checked: true, // Editing marks row as verified by human officer
      needs_review: false,
    };
    onStockChange(updated);
  };

  const handleResolveAmbiguousDate = (index: number, selectedDate: string) => {
    const updated = [...stock];
    updated[index] = {
      ...updated[index],
      expiry_date: selectedDate,
      ambiguous_date_options: undefined,
      is_checked: true,
      needs_review: false,
    };
    onStockChange(updated);
  };

  const handleToggleChecked = (index: number) => {
    const updated = [...stock];
    updated[index] = {
      ...updated[index],
      is_checked: !updated[index].is_checked,
      needs_review: false,
    };
    onStockChange(updated);
  };

  const handleAddRow = () => {
    const newRow: StockItemReport = {
      medicine: 'Paracetamol 500mg tab',
      quantity: 100,
      unit: 'tablets',
      expiry_date: '2027-12-31',
      raw_text: 'Manual entry',
      confidence: 1.0,
      needs_review: false,
      is_checked: true,
    };
    onStockChange([...stock, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = stock.filter((_, i) => i !== index);
    onStockChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Warnings List */}
      <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-sm">
          <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <span>Review & Verify Extracted Records</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Review extracted items below. Cells highlighted with <strong className="text-amber-700 dark:text-amber-400">&ldquo;Please check&rdquo;</strong> must be verified before submitting.
        </p>

        {warnings.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 space-y-1 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Parser Observations:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Beds & Staff Duty Large Steppers (Min 48px Touch Targets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Beds Available Stepper */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Beds Available</div>
              <div className="text-[11px] text-slate-500">Vacant inpatient beds</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBedsChange(Math.max(0, bedsAvailable - 1))}
              className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-lg flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Decrease beds count"
            >
              -
            </button>
            <span className="w-10 text-center font-mono font-extrabold text-base text-slate-900 dark:text-white">
              {bedsAvailable}
            </span>
            <button
              type="button"
              onClick={() => onBedsChange(bedsAvailable + 1)}
              className="h-12 w-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Increase beds count"
            >
              +
            </button>
          </div>
        </div>

        {/* Staff Present Stepper */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Staff Present</div>
              <div className="text-[11px] text-slate-500">Personnel on duty today</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStaffChange(Math.max(0, staffPresent - 1))}
              className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-lg flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Decrease staff count"
            >
              -
            </button>
            <span className="w-10 text-center font-mono font-extrabold text-base text-slate-900 dark:text-white">
              {staffPresent}
            </span>
            <button
              type="button"
              onClick={() => onStaffChange(staffPresent + 1)}
              className="h-12 w-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Increase staff count"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Medicine Stock Items ({stock.length})
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-300 hover:text-teal-700 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {stock.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
            No medicine rows found. Click &ldquo;Add Row&rdquo; to enter stock manually.
          </div>
        ) : (
          <div className="space-y-3">
            {stock.map((row, index) => {
              const needsReview =
                (row.needs_review || (typeof row.confidence === 'number' && row.confidence < 0.8)) &&
                !row.is_checked;

              return (
                <div
                  key={index}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    needsReview
                      ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                  }`}
                >
                  {/* Warning banner per row if low confidence */}
                  {needsReview && (
                    <div className="mb-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Please check: Unclear reading ({Math.round(row.confidence * 100)}% confidence)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleChecked(index)}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-amber-300 dark:border-amber-700 shadow-2xs"
                      >
                        Mark Verified
                      </button>
                    </div>
                  )}

                  {/* Ambiguous date picker options if detected */}
                  {row.ambiguous_date_options && row.ambiguous_date_options.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs">
                      <div className="font-bold text-amber-900 dark:text-amber-200 mb-1.5">
                        Select intended expiry date:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.ambiguous_date_options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleResolveAmbiguousDate(index, opt)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs border border-amber-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
                          >
                            {opt === '2027-04-03' ? '3 Apr 2027 (DD/MM)' : '4 Mar 2027 (MM/DD)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grid of editable input fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Medicine Name */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        value={row.medicine}
                        onChange={(e) => handleRowChange(index, 'medicine', e.target.value)}
                        className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={row.quantity ?? ''}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            'quantity',
                            e.target.value === '' ? null : Number(e.target.value)
                          )
                        }
                        className="w-full p-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Unit
                      </label>
                      <select
                        value={row.unit || 'tablets'}
                        onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                        className="w-full p-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-[44px]"
                      >
                        <option value="tablets">tablets</option>
                        <option value="packs">packs</option>
                        <option value="vials">vials</option>
                        <option value="capsules">capsules</option>
                        <option value="bottles">bottles</option>
                        <option value="suspension">suspension</option>
                      </select>
                    </div>

                    {/* Expiry Date */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={row.expiry_date || ''}
                        onChange={(e) => handleRowChange(index, 'expiry_date', e.target.value)}
                        className="w-full p-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-[44px]"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                        title="Delete this row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Raw Text comparison */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setExpandedRawIndex(expandedRawIndex === index ? null : index)}
                      className="text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 flex items-center gap-1 font-medium min-h-[36px]"
                    >
                      <span>Original Scan / Text</span>
                      {expandedRawIndex === index ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    <span className="font-mono text-slate-400 text-[10px]">
                      Confidence: {Math.round((row.confidence || 0.9) * 100)}%
                    </span>
                  </div>

                  {expandedRawIndex === index && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      &ldquo;{row.raw_text}&rdquo;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Footer Controls */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[48px]"
        >
          Cancel & Return
        </button>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
          {!canSubmit && uncheckedRowsCount > 0 && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
              {uncheckedRowsCount} row(s) require verification
            </span>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-xs transition-colors disabled:opacity-40 min-h-[48px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>
              {isOffline ? 'Save to Offline Queue' : 'Confirm & Sync Register'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

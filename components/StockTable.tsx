'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Plus,
  ShieldCheck,
  Building2,
  Calendar,
  Bed,
  Users,
  Search,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { StockItem, ParseResult } from '@/types/parser';

interface StockTableProps {
  data: ParseResult;
  onUpdateData: (updated: ParseResult) => void;
  onOpenCopilotWithItem?: (item: StockItem) => void;
}

export function StockTable({ data, onUpdateData, onOpenCopilotWithItem }: StockTableProps) {
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StockItem | null>(null);

  // PHC Header metadata editing
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    phc_id: data.phc_id || '',
    report_date: data.report_date || '',
    beds_available: data.beds_available !== null ? String(data.beds_available) : '',
    staff_present: data.staff_present !== null ? String(data.staff_present) : '',
  });

  const handleSaveHeader = () => {
    onUpdateData({
      ...data,
      phc_id: headerForm.phc_id.trim() || null,
      report_date: headerForm.report_date.trim() || null,
      beds_available: headerForm.beds_available !== '' ? Number(headerForm.beds_available) : null,
      staff_present: headerForm.staff_present !== '' ? Number(headerForm.staff_present) : null,
    });
    setIsEditingHeader(false);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...data.stock[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return;
    const updatedStock = [...data.stock];
    // Once officer saves manually, we consider it reviewed
    updatedStock[editingIndex] = {
      ...editForm,
      needs_review: false,
      confidence: Math.max(editForm.confidence, 0.95),
    };
    onUpdateData({
      ...data,
      stock: updatedStock,
    });
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleApproveRow = (index: number) => {
    const updatedStock = [...data.stock];
    updatedStock[index] = {
      ...updatedStock[index],
      needs_review: false,
      confidence: 1.0,
    };
    onUpdateData({
      ...data,
      stock: updatedStock,
    });
  };

  const handleApproveAll = () => {
    const updatedStock = data.stock.map((item) => ({
      ...item,
      needs_review: false,
      confidence: Math.max(item.confidence, 0.9),
    }));
    onUpdateData({
      ...data,
      stock: updatedStock,
    });
  };

  const handleDeleteRow = (index: number) => {
    const updatedStock = data.stock.filter((_, i) => i !== index);
    onUpdateData({
      ...data,
      stock: updatedStock,
    });
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleAddRow = () => {
    const newItem: StockItem = {
      medicine: 'New Item (Generic)',
      quantity: null,
      unit: 'packs',
      expiry_date: null,
      raw_text: '[Manual Entry]',
      confidence: 1.0,
      needs_review: false,
    };
    onUpdateData({
      ...data,
      stock: [newItem, ...data.stock],
    });
    setEditingIndex(0);
    setEditForm(newItem);
  };

  // Filtered rows
  const filteredStock = data.stock.filter((item) => {
    const matchesSearch =
      item.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.raw_text.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'needs_review') return item.needs_review;
    if (filter === 'verified') return !item.needs_review;
    return true;
  });

  const totalCount = data.stock.length;
  const reviewCount = data.stock.filter((s) => s.needs_review).length;
  const verifiedCount = totalCount - reviewCount;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Card: PHC ID, Report Date, Beds, Staff */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Facility & Shift Context
            </span>
          </div>
          <button
            onClick={() => {
              if (isEditingHeader) handleSaveHeader();
              else {
                setHeaderForm({
                  phc_id: data.phc_id || '',
                  report_date: data.report_date || '',
                  beds_available: data.beds_available !== null ? String(data.beds_available) : '',
                  staff_present: data.staff_present !== null ? String(data.staff_present) : '',
                });
                setIsEditingHeader(true);
              }
            }}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
          >
            {isEditingHeader ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Save Facility Info</span>
              </>
            ) : (
              <>
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Facility Info</span>
              </>
            )}
          </button>
        </div>

        {isEditingHeader ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">PHC Facility ID</label>
              <input
                type="text"
                value={headerForm.phc_id}
                onChange={(e) => setHeaderForm({ ...headerForm, phc_id: e.target.value })}
                placeholder="e.g. PHC-IN-MH-204 or null"
                className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Report Date (YYYY-MM-DD)</label>
              <input
                type="text"
                value={headerForm.report_date}
                onChange={(e) => setHeaderForm({ ...headerForm, report_date: e.target.value })}
                placeholder="2026-09-29 or null"
                className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Available Beds (Count)</label>
              <input
                type="number"
                value={headerForm.beds_available}
                onChange={(e) => setHeaderForm({ ...headerForm, beds_available: e.target.value })}
                placeholder="e.g. 4 or null"
                className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Staff Present (Count)</label>
              <input
                type="number"
                value={headerForm.staff_present}
                onChange={(e) => setHeaderForm({ ...headerForm, staff_present: e.target.value })}
                placeholder="e.g. 3 or null"
                className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-teal-400" />
                PHC ID
              </span>
              <span className="text-sm font-mono font-medium text-slate-200 mt-0.5">
                {data.phc_id ? (
                  data.phc_id
                ) : (
                  <span className="text-amber-400 text-xs italic">null (Unstated)</span>
                )}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-400" />
                Report Date
              </span>
              <span className="text-sm font-mono font-medium text-slate-200 mt-0.5">
                {data.report_date ? (
                  data.report_date
                ) : (
                  <span className="text-amber-400 text-xs italic">null (Unstated)</span>
                )}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5 text-teal-400" />
                Beds Available
              </span>
              <span className="text-sm font-mono font-medium text-slate-200 mt-0.5">
                {data.beds_available !== null ? (
                  `${data.beds_available} beds`
                ) : (
                  <span className="text-slate-500 text-xs italic">null (Unstated)</span>
                )}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-teal-400" />
                Staff Present
              </span>
              <span className="text-sm font-mono font-medium text-slate-200 mt-0.5">
                {data.staff_present !== null ? (
                  `${data.staff_present} on duty`
                ) : (
                  <span className="text-slate-500 text-xs italic">null (Unstated)</span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Segmented Filter Control */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({totalCount})
            </button>
            <button
              onClick={() => setFilter('needs_review')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                filter === 'needs_review'
                  ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Needs Review ({reviewCount})</span>
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                filter === 'verified'
                  ? 'bg-slate-800 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified ({verifiedCount})</span>
            </button>
          </div>

          {reviewCount > 0 && (
            <button
              onClick={handleApproveAll}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              title="Bulk approve all rows"
            >
              Approve All
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search medicine or raw text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-teal-400" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Medicine (Generic Normalised)</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Expiry Date (ISO)</th>
                <th className="py-3 px-4">Original Raw Text</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No stock records match current criteria.
                  </td>
                </tr>
              ) : (
                filteredStock.map((item, idx) => {
                  const isEditing = editingIndex === idx;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        item.needs_review ? 'bg-amber-950/15' : ''
                      }`}
                    >
                      {/* Medicine Name */}
                      <td className="py-3 px-4 font-medium text-slate-100 max-w-[220px]">
                        {isEditing && editForm ? (
                          <input
                            type="text"
                            value={editForm.medicine}
                            onChange={(e) =>
                              setEditForm({ ...editForm, medicine: e.target.value })
                            }
                            className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:border-teal-500 focus:outline-none"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span>{item.medicine}</span>
                            {item.review_reason && (
                              <span className="text-[10px] text-amber-400 mt-0.5">
                                Reason: {item.review_reason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                        {isEditing && editForm ? (
                          <input
                            type="number"
                            value={editForm.quantity ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                quantity: e.target.value !== '' ? Number(e.target.value) : null,
                              })
                            }
                            placeholder="null"
                            className="w-20 text-right rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:border-teal-500 focus:outline-none"
                          />
                        ) : item.quantity !== null ? (
                          item.quantity.toLocaleString()
                        ) : (
                          <span className="text-amber-400 font-mono text-[11px] italic">null</span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {isEditing && editForm ? (
                          <input
                            type="text"
                            value={editForm.unit ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                unit: e.target.value.trim() || null,
                              })
                            }
                            placeholder="unit"
                            className="w-20 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:border-teal-500 focus:outline-none"
                          />
                        ) : (
                          item.unit || <span className="text-slate-600">null</span>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-300">
                        {isEditing && editForm ? (
                          <input
                            type="text"
                            value={editForm.expiry_date ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                expiry_date: e.target.value.trim() || null,
                              })
                            }
                            placeholder="YYYY-MM-DD"
                            className="w-28 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:border-teal-500 focus:outline-none"
                          />
                        ) : item.expiry_date ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[11px]">
                            {item.expiry_date}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">null</span>
                        )}
                      </td>

                      {/* Raw Text */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-[200px] truncate" title={item.raw_text}>
                        {isEditing && editForm ? (
                          <input
                            type="text"
                            value={editForm.raw_text}
                            onChange={(e) =>
                              setEditForm({ ...editForm, raw_text: e.target.value })
                            }
                            className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:border-teal-500 focus:outline-none"
                          />
                        ) : (
                          item.raw_text
                        )}
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 font-mono tabular-nums text-[11px]">
                          <span
                            className={
                              item.confidence >= 0.8 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'
                            }
                          >
                            {(item.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Status / Needs Review */}
                      <td className="py-3 px-3 text-center">
                        {item.needs_review ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="h-3 w-3" />
                            Needs Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 rounded bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors"
                                title="Save changes"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                                title="Cancel edit"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {item.needs_review && (
                                <button
                                  onClick={() => handleApproveRow(idx)}
                                  className="p-1 rounded text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                                  title="Approve row as verified"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEdit(idx)}
                                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                title="Edit row"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {onOpenCopilotWithItem && (
                                <button
                                  onClick={() => onOpenCopilotWithItem(item)}
                                  className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
                                  title="Ask PHC Pulse co-pilot about this stock"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                title="Delete row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

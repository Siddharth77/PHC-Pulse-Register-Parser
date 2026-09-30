'use client';

import React from 'react';
import {
  X,
  HardDrive,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Camera,
  Mic,
  Edit3,
} from 'lucide-react';
import { QueuedStockReport } from '@/types/supply-chain';

interface OfflineQueueModalProps {
  queue: QueuedStockReport[];
  onClose: () => void;
  onRetryItem: (id: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  isOffline: boolean;
}

export function OfflineQueueModal({
  queue,
  onClose,
  onRetryItem,
  onDeleteItem,
  onSyncAll,
  isSyncing,
  isOffline,
}: OfflineQueueModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Offline Reports Storage Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                IndexedDB Local Storage · {queue.length} Pending Records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Offline notice inside modal */}
        {isOffline && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Currently offline. Items will automatically synchronize as soon as internet connection is restored.</span>
          </div>
        )}

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Queue is empty</p>
              <p className="mt-0.5">All stock submissions have been synchronized with state health servers.</p>
            </div>
          ) : (
            queue.map((item) => {
              const rowsCount = item.confirmed_rows?.length || 0;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        {item.input_type === 'photo' && <Camera className="h-3.5 w-3.5 text-teal-600" />}
                        {item.input_type === 'voice' && <Mic className="h-3.5 w-3.5 text-sky-600" />}
                        {item.input_type === 'text' && <Edit3 className="h-3.5 w-3.5 text-indigo-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.phc_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.timestamp} · {item.input_type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'Sent'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : item.status === 'Failed'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : item.status === 'Syncing'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Summary row details */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {rowsCount > 0
                      ? `${rowsCount} stock items recorded (${item.confirmed_rows?.slice(0, 2).map((r) => r.medicine).join(', ')}${rowsCount > 2 ? '...' : ''})`
                      : item.raw_text || 'Photo saved for online parsing'}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 font-mono">
                      Key: {item.idempotency_key.slice(0, 12)}...
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Delete queued record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {!isOffline && item.status !== 'Sent' && (
                        <button
                          onClick={() => onRetryItem(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-[10px] hover:bg-teal-700 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Sync Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[44px]"
          >
            Close
          </button>

          {!isOffline && queue.length > 0 && (
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs min-h-[44px] disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              <span>Sync All Queue ({queue.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

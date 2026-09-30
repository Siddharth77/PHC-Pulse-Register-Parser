'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Send,
  MessageSquare,
  Globe2,
  Share2,
  Filter,
  Plus,
  Loader2,
  FileText,
  Smartphone,
  ExternalLink,
  ArrowRightLeft,
} from 'lucide-react';
import { SupplyAlert, RiskLevel } from '@/types/supply-chain';
import { LanguageCode } from '@/lib/config';
import { TRANSLATIONS } from '@/lib/translations';
import { ApiClient } from '@/lib/api-client';

interface AlertsPageProps {
  currentLanguage: LanguageCode;
  initialAlertDraft?: Partial<SupplyAlert> | null;
  onClearInitialDraft?: () => void;
  onNavigateToRedistribution?: (alert?: SupplyAlert) => void;
}

export function AlertsPage({
  currentLanguage,
  initialAlertDraft,
  onClearInitialDraft,
  onNavigateToRedistribution,
}: AlertsPageProps) {
  const t = TRANSLATIONS[currentLanguage];

  const [alerts, setAlerts] = useState<SupplyAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'full' | 'sms'>>({});

  // Filter state
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(Boolean(initialAlertDraft));

  // Load alerts
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await ApiClient.getAlerts();
        setAlerts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Tab toggle helper
  const getActiveTab = (id: string): 'full' | 'sms' => {
    return activeTabMap[id] || 'full';
  };

  const setActiveTab = (id: string, tab: 'full' | 'sms') => {
    setActiveTabMap((prev) => ({ ...prev, [id]: tab }));
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send via SMS / WhatsApp (mock)
  const handleSendMock = async (alert: SupplyAlert) => {
    try {
      setSendingId(alert.id);
      const updated = await ApiClient.updateAlertStatus(alert.id, 'Sent');
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updated : a)));
    } finally {
      setSendingId(null);
    }
  };

  // Status Chip Click
  const handleStatusChange = async (alert: SupplyAlert, nextStatus: 'Draft' | 'Sent' | 'Acknowledged') => {
    const updated = await ApiClient.updateAlertStatus(alert.id, nextStatus);
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updated : a)));
  };

  // Translate alert
  const handleTranslate = async (alert: SupplyAlert) => {
    try {
      setTranslatingId(alert.id);
      const translated = await ApiClient.translateAlert(alert, currentLanguage);
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? translated : a)));
    } finally {
      setTranslatingId(null);
    }
  };

  // Save created alert
  const handleSaveAlert = async (alertPayload: Partial<SupplyAlert>) => {
    const created = await ApiClient.createAlert(alertPayload);
    setAlerts((prev) => [created, ...prev]);
    setShowCreateModal(false);
    onClearInitialDraft?.();
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Emergency Supply Alerts
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-900">
              {alerts.length} Active Bulletins
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            District CMO early-warning notices with SMS/WhatsApp dispatch and regional translations
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            <span>Draft New Alert</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Severity:</span>
          {['All', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors min-h-[36px] ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
          {['All', 'Draft', 'Sent', 'Acknowledged'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors min-h-[36px] ${
                statusFilter === st
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-semibold">Loading emergency alerts...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm">
          No alerts match the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const activeTab = getActiveTab(alert.id);
            const smsCharCount = alert.sms_text.length;
            const isCritical = alert.severity === 'Critical';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 shadow-xs transition-all ${
                  isCritical
                    ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Row: Severity, Title, Status & Days of Cover */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {/* Severity Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                          : alert.severity === 'High'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border border-orange-300 dark:border-orange-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {alert.severity === 'Critical' && <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />}
                      {alert.severity === 'High' && <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />}
                      {alert.severity === 'Medium' && <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                      <span>{alert.severity}</span>
                    </span>

                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                      {alert.id} · {alert.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Days of Cover */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span>Cover:</span>
                      <span className={alert.days_of_cover <= 3.0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                        {alert.days_of_cover}d
                      </span>
                    </div>

                    {/* Status Chip (Tappable flow) */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                      {(['Draft', 'Sent', 'Acknowledged'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(alert, st)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                            alert.status === st
                              ? st === 'Sent'
                                ? 'bg-sky-600 text-white font-bold'
                                : st === 'Acknowledged'
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Alert Content */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{alert.district}, {alert.state}</span>
                    <span>·</span>
                    <span>Medicine: <strong className="text-slate-700 dark:text-slate-300">{alert.medicine}</strong></span>
                    <span>·</span>
                    <span>Affected: {alert.affected_phcs.join(', ')}</span>
                  </div>

                  {/* Recommended Action Callout */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide text-[10px]">
                      Recommended Action:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {alert.recommended_action}
                    </p>
                  </div>

                  {/* Message Format Tabs (Full Bulletin vs SMS) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTab(alert.id, 'full')}
                          className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                            activeTab === 'full'
                              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Full Official Message</span>
                        </button>

                        <button
                          onClick={() => setActiveTab(alert.id, 'sms')}
                          className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                            activeTab === 'sms'
                              ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>SMS Dispatch</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            smsCharCount > 300 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {smsCharCount}/300
                          </span>
                        </button>
                      </div>

                      {/* Translate button */}
                      <button
                        onClick={() => handleTranslate(alert)}
                        disabled={translatingId === alert.id}
                        className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline min-h-[36px]"
                        title="Translate to selected regional language"
                      >
                        {translatingId === alert.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Globe2 className="h-3.5 w-3.5" />
                        )}
                        <span>Translate ({currentLanguage.toUpperCase()})</span>
                      </button>
                    </div>

                    {/* Tab Body */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800">
                      {activeTab === 'full' ? alert.full_message : alert.sms_text}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Copy & Send via SMS / WhatsApp */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Channel: NIC SMS Gateway & WhatsApp API
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onNavigateToRedistribution && (
                      <button
                        onClick={() => onNavigateToRedistribution(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/80 font-bold text-xs border border-teal-200 dark:border-teal-800 transition-colors min-h-[44px]"
                        title="Open Redistribution Planner for this deficit facility"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>Review Plan</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleCopy(
                          alert.id,
                          activeTab === 'full' ? alert.full_message : alert.sms_text
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors min-h-[44px]"
                      title="Copy text to clipboard"
                    >
                      {copiedId === alert.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSendMock(alert)}
                      disabled={sendingId === alert.id || alert.status === 'Sent'}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 min-h-[44px]"
                      title="Dispatch SMS / WhatsApp notice to district healthcare leadership"
                    >
                      {sendingId === alert.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>{alert.status === 'Sent' ? 'Dispatched' : 'Send via SMS/WhatsApp'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Draft New Alert */}
      {showCreateModal && (
        <CreateAlertModal
          initialAlertDraft={initialAlertDraft}
          onClose={() => {
            setShowCreateModal(false);
            onClearInitialDraft?.();
          }}
          onSave={handleSaveAlert}
        />
      )}
    </div>
  );
}

interface CreateAlertModalProps {
  initialAlertDraft?: Partial<SupplyAlert> | null;
  onClose: () => void;
  onSave: (payload: Partial<SupplyAlert>) => void;
}

function CreateAlertModal({ initialAlertDraft, onClose, onSave }: CreateAlertModalProps) {
  const [newTitle, setNewTitle] = useState<string>(initialAlertDraft?.title || '');
  const [newSeverity, setNewSeverity] = useState<RiskLevel>(initialAlertDraft?.severity || 'Critical');
  const [newState, setNewState] = useState<string>(initialAlertDraft?.state || 'Madhya Pradesh');
  const [newDistrict, setNewDistrict] = useState<string>(initialAlertDraft?.district || 'Dewas');
  const [newMedicine, setNewMedicine] = useState<string>(initialAlertDraft?.medicine || 'Paracetamol 500mg tab');
  const [newDoc, setNewDoc] = useState<number>(initialAlertDraft?.days_of_cover || 2.5);
  const [newAction, setNewAction] = useState<string>(initialAlertDraft?.recommended_action || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: newTitle,
      severity: newSeverity,
      state: newState,
      district: newDistrict,
      medicine: newMedicine,
      days_of_cover: newDoc,
      recommended_action: newAction,
      full_message: `OFFICIAL ADVISORY: Acute shortage of ${newMedicine} reported in ${newDistrict}, ${newState}. Stock cover is down to ${newDoc} days. ${newAction}`,
      sms_text: `PHC PULSE ALERT: ${newMedicine} low in ${newDistrict} (${newDoc}d cover). ${newAction.slice(0, 100)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Draft Emergency Supply Alert
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Issue an immediate stock warning to District Health Officers and CMOs
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Alert Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Critical Anti-Snake Venom Depletion in Silapathar"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-medium min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Severity Level
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as RiskLevel)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold min-h-[44px]"
              >
                <option value="Critical">Critical (≤ 3d)</option>
                <option value="High">High (4–7d)</option>
                <option value="Medium">Medium (8–14d)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Days of Cover
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newDoc}
                onChange={(e) => setNewDoc(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono font-bold min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                District
              </label>
              <input
                type="text"
                required
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              required
              value={newMedicine}
              onChange={(e) => setNewMedicine(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Recommended Action
            </label>
            <textarea
              required
              rows={2}
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="e.g. Approve emergency road transfer of 20 vials from PHC Hajo..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
            >
              Create & Save Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

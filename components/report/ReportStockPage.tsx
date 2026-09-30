'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  RotateCcw,
  WifiOff,
  Building2,
  Calendar,
  ShieldCheck,
  Sparkles,
  Loader2,
  ArrowRight,
  Info,
  Clock,
  Layers,
  FileText,
  Lock,
} from 'lucide-react';
import {
  StockItemReport,
  ParseRegisterResult,
  QueuedStockReport,
  OutbreakScenarioResult,
} from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';
import { ApiClient } from '@/lib/api-client';
import { PHC_MASTERS } from '@/lib/mock-database';
import { OfflineDB } from '@/lib/offline-db';
import { compressImage } from '@/lib/image-compress';
import { ReviewStockTable } from './ReviewStockTable';
import { OfflineQueueModal } from './OfflineQueueModal';

interface ReportStockPageProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
  onNavigateToDashboard?: () => void;
}

type FlowStep = 'ENTRY' | 'PHOTO_CAPTURING' | 'VOICE_RECORDING' | 'TYPE_INPUT' | 'PARSING_PROGRESS' | 'REVIEW_TABLE' | 'SUCCESS';

const SPEECH_LANG_CODES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ml: 'ml-IN',
  as: 'as-IN',
};

export function ReportStockPage({
  currentLanguage,
  currentRole,
  onNavigateToDashboard,
}: ReportStockPageProps) {
  // Current Flow Step
  const [step, setStep] = useState<FlowStep>('ENTRY');

  // Selected PHC
  const [selectedPhcId, setSelectedPhcId] = useState<string>('PHC-MP-001');

  // Offline and Queue State
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [queue, setQueue] = useState<QueuedStockReport[]>([]);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Parsing & Review State
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedStock, setParsedStock] = useState<StockItemReport[]>([]);
  const [bedsAvailable, setBedsAvailable] = useState<number>(4);
  const [staffPresent, setStaffPresent] = useState<number>(3);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [lastReportTime, setLastReportTime] = useState<string>('Today, 08:30 AM');

  // Demo Mock Preset Switcher (Requirement 11)
  const [demoPreset, setDemoPreset] = useState<'mock_smart' | 'clean' | 'review_ambiguous' | 'error'>('mock_smart');

  // Voice recording state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  });
  const [voiceLang, setVoiceLang] = useState<LanguageCode>(currentLanguage);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  // Type input text
  const [typedText, setTypedText] = useState<string>('Para 500 tab 1400, ORS 200 pkt, Amox 600 caps, beds 4, staff 4');

  // Photo state
  const [capturedPhotoBase64, setCapturedPhotoBase64] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const parseAbortController = useRef<boolean>(false);

  const selectedPhc = PHC_MASTERS.find((p) => p.phc_id === selectedPhcId) || PHC_MASTERS[0];

  // Refresh Queue from IndexedDB
  const refreshQueue = useCallback(async () => {
    try {
      const items = await OfflineDB.getAll();
      setQueue(items);
    } catch {
      // Ignored if indexedDB inaccessible
    }
  }, []);

  // Sync single queue item
  const syncQueueItem = useCallback(async (item: QueuedStockReport) => {
    if (isOffline) return;

    try {
      await OfflineDB.put({ ...item, status: 'Syncing' });
      await refreshQueue();

      if (item.confirmed_rows && item.confirmed_rows.length > 0) {
        await ApiClient.submitStockReport({
          phc_id: item.phc_id,
          confirmed_rows: item.confirmed_rows,
          beds_available: item.beds_available,
          staff_present: item.staff_present,
          timestamp: item.timestamp,
          idempotency_key: item.idempotency_key,
        });

        await OfflineDB.put({ ...item, status: 'Sent' });
        // Clean up sent item after short delay
        setTimeout(async () => {
          await OfflineDB.delete(item.id);
          await refreshQueue();
        }, 3000);
      }
    } catch (err: any) {
      await OfflineDB.put({
        ...item,
        status: 'Failed',
        error_message: err?.message || 'Sync failed',
      });
      await refreshQueue();
    }
  }, [isOffline, refreshQueue]);

  // Sync entire queue
  const syncAllQueue = useCallback(async () => {
    if (isOffline || queue.length === 0) return;

    try {
      setIsSyncingQueue(true);
      for (const item of queue) {
        if (item.status !== 'Sent') {
          await syncQueueItem(item);
        }
      }
      setSyncToast(`Synchronized ${queue.length} pending report(s) successfully!`);
      setTimeout(() => setSyncToast(null), 5000);
    } finally {
      setIsSyncingQueue(false);
      await refreshQueue();
    }
  }, [isOffline, queue, syncQueueItem, refreshQueue]);

  // Network Online / Offline Detection
  useEffect(() => {
    let isCancelled = false;
    async function loadInitialQueue() {
      try {
        const items = await OfflineDB.getAll();
        if (!isCancelled) {
          setQueue(items);
        }
      } catch {
        // Ignored
      }
    }
    loadInitialQueue();

    const handleOnline = () => {
      setIsOffline(false);
      setSyncToast('Back online! Syncing saved offline reports...');
      setTimeout(() => setSyncToast(null), 5000);
      syncAllQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isCancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAllQueue]);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_CODES[voiceLang] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setVoiceTranscript((prev) => `${prev} ${event.results[i][0].transcript}`.trim());
          } else {
            interim += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current = recognition;
    } catch {
      // Speech recognition initialization fallback
    }
  }, [voiceLang]);

  // Handle Photo Capture
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStep('PARSING_PROGRESS');
      setIsParsing(true);
      setParseError(null);
      parseAbortController.current = false;

      // Compress client-side to max 1600px
      const { base64 } = await compressImage(file, 1600, 0.85);
      setCapturedPhotoBase64(base64);

      if (isOffline) {
        // Save photo directly to offline queue to parse once reconnected
        const offlineReport: QueuedStockReport = {
          id: `photo-${Date.now()}`,
          idempotency_key: `IDEM-IMG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          phc_id: selectedPhcId,
          phc_name: selectedPhc.phc_name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Waiting',
          input_type: 'photo',
          photo_blob: base64,
          raw_text: 'Offline photo saved for cloud parsing upon reconnection',
        };
        await OfflineDB.put(offlineReport);
        await refreshQueue();
        setIsParsing(false);
        setStep('ENTRY');
        setSyncToast('Offline: Photo saved locally. It will parse and submit when you reconnect.');
        setTimeout(() => setSyncToast(null), 5000);
        return;
      }

      // Online parsing call via POST /api/parse
      const parseRes = await ApiClient.parseRegister({
        imageBase64: base64,
        phc_id: selectedPhcId,
        language: currentLanguage,
        mock_preset: demoPreset,
      });

      if (parseAbortController.current) return;

      setParsedStock(parseRes.stock || []);
      setBedsAvailable(parseRes.beds_available ?? 4);
      setStaffPresent(parseRes.staff_present ?? 3);
      setParseWarnings(parseRes.warnings || []);
      setStep('REVIEW_TABLE');
    } catch (err: any) {
      if (!parseAbortController.current) {
        setParseError(err?.message || 'Failed to read register photo');
        setStep('ENTRY');
      }
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Voice Parse
  const handleParseVoice = async () => {
    if (!voiceTranscript.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      setStep('PARSING_PROGRESS');
      setIsParsing(true);
      setParseError(null);

      const parseRes = await ApiClient.parseRegister({
        text: voiceTranscript,
        phc_id: selectedPhcId,
        language: currentLanguage,
        mock_preset: demoPreset,
      });

      setParsedStock(parseRes.stock || []);
      setBedsAvailable(parseRes.beds_available ?? 4);
      setStaffPresent(parseRes.staff_present ?? 3);
      setParseWarnings(parseRes.warnings || []);
      setStep('REVIEW_TABLE');
    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse voice transcript');
      setStep('ENTRY');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Text Parse
  const handleParseText = async () => {
    if (!typedText.trim()) return;

    try {
      setStep('PARSING_PROGRESS');
      setIsParsing(true);
      setParseError(null);

      const parseRes = await ApiClient.parseRegister({
        text: typedText,
        phc_id: selectedPhcId,
        language: currentLanguage,
        mock_preset: demoPreset,
      });

      setParsedStock(parseRes.stock || []);
      setBedsAvailable(parseRes.beds_available ?? 4);
      setStaffPresent(parseRes.staff_present ?? 3);
      setParseWarnings(parseRes.warnings || []);
      setStep('REVIEW_TABLE');
    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse text entry');
      setStep('ENTRY');
    } finally {
      setIsParsing(false);
    }
  };

  // Submit Confirmed Stock Report
  const handleConfirmSubmit = async () => {
    const idempotencyKey = `IDEM-REP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isOffline) {
      // Store in IndexedDB queue
      const queuedReport: QueuedStockReport = {
        id: `queued-${Date.now()}`,
        idempotency_key: idempotencyKey,
        phc_id: selectedPhcId,
        phc_name: selectedPhc.phc_name,
        timestamp: nowTime,
        status: 'Waiting',
        input_type: capturedPhotoBase64 ? 'photo' : voiceTranscript ? 'voice' : 'text',
        confirmed_rows: parsedStock,
        beds_available: bedsAvailable,
        staff_present: staffPresent,
      };

      await OfflineDB.put(queuedReport);
      await refreshQueue();
      setLastSubmittedId(`OFFLINE-QUEUE-${Date.now().toString().slice(-4)}`);
      setLastReportTime(`${nowTime} (Saved Offline)`);
      setStep('SUCCESS');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await ApiClient.submitStockReport({
        phc_id: selectedPhcId,
        confirmed_rows: parsedStock,
        beds_available: bedsAvailable,
        staff_present: staffPresent,
        timestamp: new Date().toISOString(),
        idempotency_key: idempotencyKey,
      });

      setLastSubmittedId(res.report_id);
      setLastReportTime(`${nowTime} today`);
      setStep('SUCCESS');
    } catch (err: any) {
      setParseError(err?.message || 'Failed to submit report. Saved to offline queue as backup.');
      // Offline fallback
      const queuedReport: QueuedStockReport = {
        id: `queued-${Date.now()}`,
        idempotency_key: idempotencyKey,
        phc_id: selectedPhcId,
        phc_name: selectedPhc.phc_name,
        timestamp: nowTime,
        status: 'Failed',
        input_type: 'text',
        confirmed_rows: parsedStock,
        beds_available: bedsAvailable,
        staff_present: staffPresent,
        error_message: err?.message,
      };
      await OfflineDB.put(queuedReport);
      await refreshQueue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setParsedStock([]);
    setVoiceTranscript('');
    setCapturedPhotoBase64(null);
    setParseError(null);
    setStep('ENTRY');
  };

  return (
    <div className="max-w-lg mx-auto w-full pb-12">
      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite">
        {step === 'PARSING_PROGRESS' && 'Parsing stock register in progress'}
        {step === 'REVIEW_TABLE' && 'Register parsing complete. Review table is ready for verification.'}
        {step === 'SUCCESS' && 'Stock report successfully saved.'}
      </div>

      {/* Persistent Offline Banner (Requirement 6) */}
      {isOffline && (
        <aside
          aria-label="Offline Mode Notice"
          className="mb-4 p-3 rounded-2xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>You are offline. Reports are saved on this device and will sync later.</span>
          </div>
          {queue.length > 0 && (
            <button
              onClick={() => setShowQueueModal(true)}
              className="ml-2 px-2 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-mono shrink-0"
            >
              {queue.length} Queued
            </button>
          )}
        </aside>
      )}

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Top Header: PHC Context & Last Report */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Report Stock & Beds
              </h1>
            </div>

            {/* Role Scoping: Fixed for PHC Staff, Picker for District/State Officer */}
            {currentRole === 'phc_staff' ? (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                <span>{selectedPhc.phc_name}</span>
                <span className="text-slate-400">({selectedPhc.district}, {selectedPhc.state})</span>
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">PHC Facility:</span>
                <select
                  value={selectedPhcId}
                  onChange={(e) => setSelectedPhcId(e.target.value)}
                  className="text-xs font-bold p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {PHC_MASTERS.map((p) => (
                    <option key={p.phc_id} value={p.phc_id}>
                      {p.phc_name} ({p.district})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last report: <strong>{lastReportTime}</strong></span>
              </span>
            </div>
          </div>

          {/* Queue Count Button */}
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs min-h-[44px]"
            title="View offline storage queue"
          >
            <HardDrive className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Queue</span>
            {queue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-teal-600 text-white font-mono text-[10px] font-bold">
                {queue.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* STEP 1: ENTRY SCREEN (3 Large Options - Min 64px Tall) */}
      {step === 'ENTRY' && (
        <div className="space-y-4">
          {/* Privacy Note (Requirement 8) */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
            <Info className="h-4 w-4 text-teal-600 shrink-0" />
            <span>
              <strong>Privacy Protection:</strong> Do not include patient names. Only medicine stock, vacant beds, and on-duty staff counts are needed.
            </span>
          </div>

          {/* Option 1: Take Photo of Register (Min 64px tall, min 48px target) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-4 text-left min-h-[72px] active:scale-[0.98]"
          >
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-base font-extrabold leading-tight">
                Take photo of register
              </div>
              <div className="text-xs text-teal-100 mt-0.5">
                Point camera at paper stock logbook or sheet
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-teal-200 shrink-0" />
          </button>

          {/* Option 2: Speak Update (Hold to speak or tap to start) */}
          <button
            type="button"
            onClick={() => {
              setVoiceTranscript('');
              setStep('VOICE_RECORDING');
            }}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-800 hover:border-sky-300 text-slate-900 dark:text-white shadow-xs transition-all flex items-center gap-4 text-left min-h-[72px] active:scale-[0.98]"
          >
            <div className="h-12 w-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Mic className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-base font-extrabold leading-tight">
                Speak update
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Voice note in Hindi, English, Marathi, Malayalam, or Assamese
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 shrink-0" />
          </button>

          {/* Option 3: Type Update */}
          <button
            type="button"
            onClick={() => setStep('TYPE_INPUT')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-900 dark:text-white shadow-xs transition-all flex items-center gap-4 text-left min-h-[72px] active:scale-[0.98]"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Edit3 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-base font-extrabold leading-tight">
                Type update
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quick text or shorthand message entry
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 shrink-0" />
          </button>

          {/* Demo Preset Selector (Requirement 11) */}
          <div className="mt-6 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Demo Parser Simulation Presets:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoPreset('clean')}
                className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-colors ${
                  demoPreset === 'clean'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                1. Clean Scan (100% Verified)
              </button>

              <button
                type="button"
                onClick={() => setDemoPreset('review_ambiguous')}
                className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-colors ${
                  demoPreset === 'review_ambiguous'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                2. Ambiguous Date & Low Conf
              </button>

              <button
                type="button"
                onClick={() => setDemoPreset('error')}
                className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-colors ${
                  demoPreset === 'error'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                3. Blurry Image Error
              </button>

              <button
                type="button"
                onClick={() => setDemoPreset('mock_smart')}
                className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-colors ${
                  demoPreset === 'mock_smart'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600'
                }`}
              >
                4. Live Text Extraction
              </button>
            </div>
          </div>

          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Reading Failed:</span>
              </div>
              <p>{parseError}</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setStep('TYPE_INPUT')}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-900 dark:text-rose-200 font-bold text-[11px]"
                >
                  Type It Instead
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: VOICE RECORDING SCREEN */}
      {step === 'VOICE_RECORDING' && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Voice Update
              </h2>
            </div>

            {/* Language Selector for Speech */}
            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value as LanguageCode)}
              className="text-xs font-bold p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[40px]"
            >
              <option value="en">English (India)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="as">অসমীয়া (Assamese)</option>
            </select>
          </div>

          {/* Microphone Tap Button (Large target) */}
          <div className="flex flex-col items-center justify-center py-6">
            <button
              type="button"
              onClick={() => {
                if (!recognitionRef.current) return;
                if (isListening) {
                  recognitionRef.current.stop();
                } else {
                  try {
                    recognitionRef.current.start();
                  } catch {
                    setIsListening(false);
                  }
                }
              }}
              className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse scale-110'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
              aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
              {isListening ? 'Listening... Tap to Stop' : 'Tap to Start Speaking'}
            </span>
          </div>

          {/* Live Editable Transcript */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Spoken Transcript (You can edit below):
            </label>
            <textarea
              rows={4}
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder="e.g. Paracetamol tablets 1200, ORS 400 packets, Amoxicillin 850, 4 beds vacant, 3 staff on duty"
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('ENTRY')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[48px]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleParseVoice}
              disabled={!voiceTranscript.trim() || isParsing}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xs disabled:opacity-40 min-h-[48px]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Read Voice Note</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TYPE INPUT SCREEN */}
      {step === 'TYPE_INPUT' && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Type Shorthand Update
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter messy or shorthand notes. Our parser automatically normalizes medicine names, quantities, and units.
          </p>

          <textarea
            rows={5}
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="e.g. Para 500 tab 1400, ORS 200 pkt, Amox 600, beds 4, staff 4"
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('ENTRY')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[48px]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleParseText}
              disabled={!typedText.trim() || isParsing}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xs disabled:opacity-40 min-h-[48px]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Read It</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PARSING PROGRESS SPINNER WITH CANCEL (Requirement 2) */}
      {step === 'PARSING_PROGRESS' && (
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4 my-6 shadow-xs animate-in fade-in">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mx-auto" />
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            Reading your register...
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Resolving medicine names, stock quantities, expiry batches, and hospital bed counts.
          </p>
          <button
            type="button"
            onClick={() => {
              parseAbortController.current = true;
              setIsParsing(false);
              setStep('ENTRY');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[44px]"
          >
            Cancel Parsing
          </button>
        </div>
      )}

      {/* STEP 5: REVIEW & VERIFY TABLE (Requirement 5) */}
      {step === 'REVIEW_TABLE' && (
        <ReviewStockTable
          stock={parsedStock}
          onStockChange={setParsedStock}
          bedsAvailable={bedsAvailable}
          onBedsChange={setBedsAvailable}
          staffPresent={staffPresent}
          onStaffChange={setStaffPresent}
          warnings={parseWarnings}
          onSubmit={handleConfirmSubmit}
          isSubmitting={isSubmitting}
          isOffline={isOffline}
          onCancel={() => setStep('ENTRY')}
          currentLanguage={currentLanguage}
        />
      )}

      {/* STEP 6: SUCCESS CONFIRMATION (Requirement 7) */}
      {step === 'SUCCESS' && (
        <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 my-6 shadow-xs animate-in zoom-in-95">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isOffline ? 'Saved to Offline Queue' : 'Synchronized with State Network'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Stock Update Confirmed!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Report Ref: <strong className="font-mono text-teal-700 dark:text-teal-400">{lastSubmittedId}</strong>. Verified {parsedStock.length} medicine items, {bedsAvailable} vacant beds, and {staffPresent} on-duty staff for <strong>{selectedPhc.phc_name}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetForAnother}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs min-h-[48px]"
            >
              Report Another Register
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigateToDashboard?.();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xs min-h-[48px]"
            >
              Go to Command Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Offline Queue Inspection Modal */}
      {showQueueModal && (
        <OfflineQueueModal
          queue={queue}
          onClose={() => setShowQueueModal(false)}
          onRetryItem={async (id: string) => {
            const item = queue.find((q) => q.id === id);
            if (item) await syncQueueItem(item);
          }}
          onDeleteItem={async (id) => {
            await OfflineDB.delete(id);
            await refreshQueue();
          }}
          onSyncAll={syncAllQueue}
          isSyncing={isSyncingQueue}
          isOffline={isOffline}
        />
      )}
    </div>
  );
}

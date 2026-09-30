'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Trash2,
  Mic,
  MicOff,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRightLeft,
  BellRing,
  HelpCircle,
  WifiOff,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  Lock,
  Globe2,
  FileQuestion,
  Info,
} from 'lucide-react';
import {
  ChatMessage,
  AskQuestionResponse,
  OutbreakScenarioResult,
  RiskLevel,
  SupplyAlert,
} from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';
import { ApiClient } from '@/lib/api-client';

interface AskPulsePageProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
  activeScenario?: OutbreakScenarioResult | null;
  onNavigateToView?: (view: 'dashboard' | 'alerts' | 'redistribution') => void;
  onDraftAlertWithContext?: (alertDraft: Partial<SupplyAlert>) => void;
}

const SUGGESTED_PROMPTS: Record<
  LanguageCode,
  { label: string; query: string; icon: string }[]
> = {
  en: [
    {
      label: 'Paracetamol stockouts next week?',
      query: 'Which districts will run out of paracetamol next week?',
      icon: '💊',
    },
    {
      label: 'Where is insulin low?',
      query: 'Where is insulin low?',
      icon: '💉',
    },
    {
      label: 'What should I move to Dhemaji?',
      query: 'What should I move to Dhemaji?',
      icon: '🚚',
    },
    {
      label: 'Which PHCs are short of staff?',
      query: 'Which PHCs are short of staff?',
      icon: '👨‍⚕️',
    },
    {
      label: 'Malaria patients last year? (Data boundary test)',
      query: 'How many patients had malaria last year?',
      icon: '📊',
    },
  ],
  hi: [
    {
      label: 'अगले सप्ताह पैरासिटामोल कहाँ खत्म होगी?',
      query: 'Which districts will run out of paracetamol next week?',
      icon: '💊',
    },
    {
      label: 'इंसुलिन का स्टॉक कहाँ कम है?',
      query: 'Where is insulin low?',
      icon: '💉',
    },
    {
      label: 'धेमाजी में क्या स्टॉक भेजना चाहिए?',
      query: 'What should I move to Dhemaji?',
      icon: '🚚',
    },
    {
      label: 'किन प्राथमिक स्वास्थ्य केंद्रों में स्टाफ की कमी है?',
      query: 'Which PHCs are short of staff?',
      icon: '👨‍⚕️',
    },
    {
      label: 'पिछले वर्ष मलेरिया मरीज? (डेटा सीमा परीक्षण)',
      query: 'How many patients had malaria last year?',
      icon: '📊',
    },
  ],
  mr: [
    {
      label: 'पुढील आठवड्यात पॅरासिटामॉल कुठे संपेल?',
      query: 'Which districts will run out of paracetamol next week?',
      icon: '💊',
    },
    {
      label: 'इन्सुलिनचा साठा कुठे कमी आहे?',
      query: 'Where is insulin low?',
      icon: '💉',
    },
    {
      label: 'धेमाजीला कोणता साठा पाठवावा?',
      query: 'What should I move to Dhemaji?',
      icon: '🚚',
    },
    {
      label: 'कोणत्या आरोग्य केंद्रात कर्मचाऱ्यांची कमतरता आहे?',
      query: 'Which PHCs are short of staff?',
      icon: '👨‍⚕️',
    },
  ],
  ml: [
    {
      label: 'അടുത്ത ആഴ്ച പാരസെറ്റമോൾ തീരുന്ന ജില്ലകൾ ഏതെല്ലാം?',
      query: 'Which districts will run out of paracetamol next week?',
      icon: '💊',
    },
    {
      label: 'ഇൻസുലിൻ സ്റ്റോക്ക് കുറവുള്ളത് എവിടെയാണ്?',
      query: 'Where is insulin low?',
      icon: '💉',
    },
    {
      label: 'ധേമാജിയിലേക്ക് എന്താണ് മാറ്റേണ്ടത്?',
      query: 'What should I move to Dhemaji?',
      icon: '🚚',
    },
    {
      label: 'ജീവനക്കാരുടെ കുറവുള്ള പി.എച്ച്.സികൾ ഏതെല്ലാം?',
      query: 'Which PHCs are short of staff?',
      icon: '👨‍⚕️',
    },
  ],
  as: [
    {
      label: 'অহা সপ্তাহত কোন জিলাত পেৰাচিতামল শেষ হ’ব?',
      query: 'Which districts will run out of paracetamol next week?',
      icon: '💊',
    },
    {
      label: 'ইনচুলিনৰ মজুত ক’ত কম?',
      query: 'Where is insulin low?',
      icon: '💉',
    },
    {
      label: 'ধেমাজিলৈ কি সামগ্ৰী স্থানান্তৰ কৰা উচিত?',
      query: 'What should I move to Dhemaji?',
      icon: '🚚',
    },
    {
      label: 'কোনবোৰ স্বাস্থ্য কেন্দ্ৰত কৰ্মচাৰীৰ নাটনি?',
      query: 'Which PHCs are short of staff?',
      icon: '👨‍⚕️',
    },
  ],
};

const SPEECH_LANG_CODES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ml: 'ml-IN',
  as: 'as-IN',
};

export function AskPulsePage({
  currentLanguage,
  currentRole,
  activeScenario,
  onNavigateToView,
  onDraftAlertWithContext,
}: AskPulsePageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      role: 'assistant',
      response: {
        answer_summary: `Welcome. I am PHC Pulse, your public health supply chain co-pilot. I analyze real-time inventory levels, forecasting models, and bed/staff attendance logs for ${
          currentRole === 'phc_staff'
            ? 'PHC Rampur (Dewas)'
            : currentRole === 'district_officer'
            ? 'Dewas District & adjoining supply hubs'
            : 'National & State Health Nodes'
        }. How can I assist you today?`,
        affected_phcs: [],
        suggested_next_action: null,
        confidence: 'High',
        confidence_note: 'Initialized with live verified snapshot records.',
        data_sources_used: ['Facility Master Registry', 'Public Health Supply Ledger 2026-09-30'],
      },
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [openSourcesId, setOpenSourcesId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Voice Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  });
  const [voiceLang, setVoiceLang] = useState<LanguageCode>(currentLanguage);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = SPEECH_LANG_CODES[voiceLang] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
        }
      };

      recognitionRef.current = recognition;
    } catch {
      // Ignored if browser policy blocks mic initialization
    }
  }, [voiceLang]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading || isOffline) return;

    setError(null);
    setInputQuery('');

    // User message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      question: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call API module POST /ask
      const res = await ApiClient.askQuestion({
        question: textToSend,
        role: currentRole,
        scope: {
          states:
            currentRole === 'district_officer'
              ? ['Madhya Pradesh']
              : currentRole === 'phc_staff'
              ? ['Madhya Pradesh']
              : undefined,
          districts: currentRole === 'district_officer' ? ['Dewas', 'Indore'] : undefined,
          phc_id: currentRole === 'phc_staff' ? 'PHC-MP-001' : undefined,
        },
        language: currentLanguage,
        scenario: activeScenario,
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isScenarioProjected: !!activeScenario,
      };

      setMessages((prev) => [...prev, botMsg]);
      setAnnouncement(`PHC Pulse responded: ${res.answer_summary}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to PHC Pulse Agent. Please retry.');
    } finally {
      setLoading(false);
      // Restore focus to input for smooth accessibility
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleToggleVoice = () => {
    if (!recognitionRef.current || !speechSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = SPEECH_LANG_CODES[voiceLang] || 'en-IN';
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleNextActionClick = (actionLabel: string, msg: ChatMessage) => {
    if (actionLabel.toLowerCase().includes('redistribution') || actionLabel.toLowerCase().includes('plan')) {
      onNavigateToView?.('redistribution');
    } else if (actionLabel.toLowerCase().includes('alert')) {
      const firstPhc = msg.response?.affected_phcs[0];
      if (firstPhc && onDraftAlertWithContext) {
        onDraftAlertWithContext({
          title: `Emergency Shortage Alert: ${firstPhc.medicine} at ${firstPhc.phc_name}`,
          severity: firstPhc.risk_level,
          district: firstPhc.district,
          medicine: firstPhc.medicine,
          days_of_cover: firstPhc.days_of_cover,
          recommended_action: `Authorize emergency stock reallocation or staff reinforcement for ${firstPhc.phc_name}.`,
        });
      }
      onNavigateToView?.('alerts');
    }
  };

  const getRiskChip = (level: RiskLevel) => {
    if (level === 'Critical') {
      return {
        label: 'Critical',
        classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-900',
        icon: <AlertOctagon className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />,
      };
    }
    if (level === 'High') {
      return {
        label: 'High',
        classes: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border-orange-300 dark:border-orange-900',
        icon: <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 shrink-0" />,
      };
    }
    if (level === 'Medium') {
      return {
        label: 'Medium',
        classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-900',
        icon: <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />,
      };
    }
    return {
      label: 'Low',
      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-900',
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    };
  };

  const prompts = SUGGESTED_PROMPTS[currentLanguage] || SUGGESTED_PROMPTS.en;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* Screen Reader Live Announcement Region for Accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Top Agent Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Ask PHC Pulse
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                Grounded Co-Pilot
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded supply chain intelligence · Scoped for{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {currentRole === 'phc_staff'
                  ? 'PHC Rampur'
                  : currentRole === 'district_officer'
                  ? 'Dewas District'
                  : 'State Logistics'}
              </strong>
            </p>
          </div>
        </div>

        {/* Clear Chat Button */}
        <div className="flex items-center gap-2">
          {activeScenario && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Sparkles className="h-3 w-3" />
              <span>Outbreak Scenario Active</span>
            </span>
          )}

          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold transition-colors disabled:opacity-40 min-h-[36px]"
            title="Clear current session chat history"
            aria-label="Clear chat history"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <aside
          aria-label="Network Status"
          className="p-2.5 bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0 animate-in fade-in"
        >
          <WifiOff className="h-4 w-4" />
          <span>You are currently offline. Conversational responses will resume when reconnected.</span>
        </aside>
      )}

      {/* Chat Messages Scrolling Container */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.length === 0 && (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <Bot className="h-10 w-10 text-teal-600 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              How can PHC Pulse assist your supply chain today?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a suggested question below or type an inquiry about medicine stocks, shortages, or staff duty.
            </p>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* User Message Bubble */}
            {msg.role === 'user' && (
              <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                <div className="p-3.5 rounded-2xl rounded-tr-xs bg-teal-600 text-white text-xs sm:text-sm font-medium shadow-xs">
                  {msg.question}
                </div>
                <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              </div>
            )}

            {/* Assistant Response Card */}
            {msg.role === 'assistant' && msg.response && (
              <div className="flex items-start gap-3 max-w-[95%] sm:max-w-[90%] w-full">
                <div className="h-8 w-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="h-5 w-5" />
                </div>

                <div data-demo-target="chat-response" className="flex-1 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 sm:p-5 space-y-4 shadow-xs">
                  {/* Scenario Active Banner Notice (Requirement 6) */}
                  {msg.isScenarioProjected && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[11px] font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>Based on projected figures (scenario active)</span>
                    </div>
                  )}

                  {/* 3a) Short Lead Answer (1 to 2 sentences) */}
                  <div className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                    {msg.response.answer_summary}
                  </div>

                  {/* 4) "Not Enough Data" Card (Requirement 4) */}
                  {msg.response.not_enough_data && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FileQuestion className="h-4 w-4 text-amber-600" />
                        <span>Data Boundary Limitation</span>
                      </div>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                        {msg.response.missing_data_reason ||
                          'The current operational snapshot does not contain this information. PHC Pulse never generates unverified estimations.'}
                      </p>
                    </div>
                  )}

                  {/* 5) "Out of Scope" RBAC Card (Requirement 5) */}
                  {msg.response.out_of_scope && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Lock className="h-4 w-4 text-slate-500" />
                        <span>Clearance Scope Boundary</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {msg.response.scope_explanation}
                      </p>
                    </div>
                  )}

                  {/* 3b) Table of Affected PHCs (Sorted lowest days of cover first) */}
                  {msg.response.affected_phcs && msg.response.affected_phcs.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Affected Primary Health Centres ({msg.response.affected_phcs.length})
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                              <th className="p-2.5 pl-3">Facility</th>
                              <th className="p-2.5">District</th>
                              <th className="p-2.5">Item / Metric</th>
                              <th className="p-2.5">Days of Cover</th>
                              <th className="p-2.5 pr-3">Risk Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {msg.response.affected_phcs.map((phc, i) => {
                              const chip = getRiskChip(phc.risk_level);
                              return (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="p-2.5 pl-3 font-bold text-slate-900 dark:text-white">
                                    {phc.phc_name}
                                  </td>
                                  <td className="p-2.5 text-slate-500 dark:text-slate-400">
                                    {phc.district}
                                  </td>
                                  <td className="p-2.5 text-slate-700 dark:text-slate-300">
                                    {phc.medicine}
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                                    {phc.days_of_cover}d
                                  </td>
                                  <td className="p-2.5 pr-3">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${chip.classes}`}
                                    >
                                      {chip.icon}
                                      <span>{chip.label}</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3c) Confidence Badge & Tooltip + 3d) Collapsible Data Sources */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Confidence Badge */}
                    <div className="flex items-center gap-1.5 group relative">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Confidence:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-help ${
                          msg.response.confidence === 'High'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                            : msg.response.confidence === 'Medium'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                        }`}
                        title={msg.response.confidence_note}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>{msg.response.confidence} Confidence</span>
                      </span>

                      {/* Hover Tooltip for confidence note */}
                      <span className="hidden group-hover:block absolute bottom-full left-0 mb-1 z-30 w-56 p-2 rounded-lg bg-slate-900 text-white text-[10px] font-normal shadow-lg border border-slate-700 pointer-events-none">
                        {msg.response.confidence_note}
                      </span>
                    </div>

                    {/* Collapsible Data Sources Toggle */}
                    {msg.response.data_sources_used && msg.response.data_sources_used.length > 0 && (
                      <button
                        onClick={() =>
                          setOpenSourcesId(openSourcesId === msg.id ? null : msg.id)
                        }
                        className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline min-h-[36px]"
                        aria-expanded={openSourcesId === msg.id}
                        aria-label="Toggle verified data sources list"
                      >
                        <Database className="h-3.5 w-3.5" />
                        <span>Data Sources ({msg.response.data_sources_used.length})</span>
                        {openSourcesId === msg.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Collapsible Data Sources Content */}
                  {openSourcesId === msg.id && msg.response.data_sources_used && (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 animate-in fade-in">
                      <div className="font-bold text-slate-600 dark:text-slate-300 text-[10px] uppercase">
                        Verified Operational Data Repositories:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        {msg.response.data_sources_used.map((src, i) => (
                          <li key={i}>{src}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3e) Suggested Next-Action Button */}
                  {msg.response.suggested_next_action && (
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        onClick={() => handleNextActionClick(msg.response!.suggested_next_action!, msg)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px]"
                      >
                        {msg.response.suggested_next_action.toLowerCase().includes('redistribution') ? (
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        ) : (
                          <BellRing className="h-3.5 w-3.5" />
                        )}
                        <span>{msg.response.suggested_next_action}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in">
            <div className="h-8 w-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="ml-1.5">Consulting multi-district stock registries & forecast models...</span>
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && (
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSendQuery()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs min-h-[36px]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip (Requirement 2) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <HelpCircle className="h-3 w-3 text-teal-600" />
          <span>Suggested Inquiries ({currentLanguage.toUpperCase()})</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(p.query)}
              disabled={loading || isOffline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs min-h-[36px] disabled:opacity-40"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Area (Keyboard + Voice) */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Speech Recognition Button (Requirement 8) */}
          {speechSupported ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title={isListening ? 'Stop recording voice' : `Voice input (${voiceLang.toUpperCase()})`}
                aria-label="Voice input microphone"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Voice Language Selector */}
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value as LanguageCode)}
                className="hidden sm:block text-[11px] font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[44px]"
                aria-label="Select speech recognition language"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="mr">MR</option>
                <option value="ml">ML</option>
                <option value="as">AS</option>
              </select>
            </div>
          ) : (
            <span
              className="text-[10px] text-slate-400 italic px-2 hidden sm:inline"
              title="Speech-to-text API not supported on this browser engine"
            >
              Mic unavailable
            </span>
          )}

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Ask about medicine stockouts, surplus depots, or staff duty...'
            }
            disabled={loading || isOffline}
            className="flex-1 p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
            aria-label="Ask PHC Pulse question input"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading || isOffline}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40 min-h-[44px]"
            aria-label="Send query"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}

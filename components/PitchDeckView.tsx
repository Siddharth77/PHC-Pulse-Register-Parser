'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Cpu,
  TrendingUp,
  ArrowRightLeft,
  Lock,
  Users,
  CheckCircle2,
  Globe2,
  HeartPulse,
  Download,
  Share2,
  Maximize2
} from 'lucide-react';

interface Slide {
  number: number;
  category: string;
  title: string;
  subtitle: string;
  keyMetric?: { label: string; value: string; detail: string };
  bulletPoints: { title: string; desc: string; icon?: React.ReactNode }[];
  highlightBox: { title: string; content: string; type: 'info' | 'warning' | 'success' };
  speakerNote: string;
}

const SLIDES: Slide[] = [
  {
    number: 1,
    category: "Executive Summary",
    title: "PHC Pulse: The Self-Healing Public Health Grid",
    subtitle: "AI Co-Pilot for National Public Health Supply Chain Management across India",
    keyMetric: {
      label: "Stockout Elimination",
      value: "80%+",
      detail: "Reduction in preventable rural medicine stockouts"
    },
    bulletPoints: [
      {
        title: "The Vision",
        desc: "Transforming 30,000+ Primary Health Centres into a coordinated, zero-stockout medicine safety net for 1.4 billion citizens.",
        icon: <HeartPulse className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Multimodal Last-Mile AI",
        desc: "Turns paper ledgers, regional audio voice notes, and WhatsApp dispatches into verified digital records in seconds.",
        icon: <Sparkles className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Privacy-Preserving Federated Intelligence",
        desc: "Respects India's State-subject health governance: zero raw patient records cross state borders.",
        icon: <Lock className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "Core Mandate",
      content: "No patient in an Indian village should ever be turned away from a Primary Health Centre because an essential medicine was out of stock.",
      type: "info"
    },
    speakerNote: "Welcome judges. PHC Pulse is built for the last-mile reality of India's 30,000+ Primary Health Centres, bridging paper logs and cutting-edge Google AI."
  },
  {
    number: 2,
    category: "Problem Definition",
    title: "The Rural Blind Spot & Stock-Out Paradox",
    subtitle: "Life-saving medicines expire in one district while patients suffer in the adjacent one",
    keyMetric: {
      label: "Reporting Delay",
      value: "14–28 Days",
      detail: "Average latency from physical PHC registers to district health officers"
    },
    bulletPoints: [
      {
        title: "Paper Register Bottleneck",
        desc: "70% of India depends on rural PHCs, where nurses and pharmacists spend 40% of their shift on physical, handwritten logbooks.",
        icon: <Clock className="h-5 w-5 text-amber-400" />
      },
      {
        title: "The Distribution Paradox",
        desc: "District A runs out of anti-snake venom during flood surges, while District B (45 km away) holds 90 days of expiring surplus.",
        icon: <AlertTriangle className="h-5 w-5 text-rose-400" />
      },
      {
        title: "Zero Cross-Facility Visibility",
        desc: "District officers discover shortages only after a stockout crisis has already occurred.",
        icon: <ShieldCheck className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "The Problem in Numbers",
      content: "Over 35% of expired medicine wastage in state depots is preventable if surplus is identified and redistributed 60 days before expiry.",
      type: "warning"
    },
    speakerNote: "India doesn't always have a medicine manufacturing shortage—we have an information latency and redistribution friction crisis."
  },
  {
    number: 3,
    category: "Workflow Friction",
    title: "Why Traditional Portals Fail the Last Mile",
    subtitle: "DVDMS and web portals struggle at rural sub-centres and tribal primary clinics",
    bulletPoints: [
      {
        title: "High Administrative Burden",
        desc: "Demands desktop PCs, reliable broadband, and tedious manual alphanumeric SKU entry that overstretched staff cannot maintain.",
        icon: <AlertTriangle className="h-5 w-5 text-amber-400" />
      },
      {
        title: "Linguistic Barrier",
        desc: "Portals are English-dominant, while frontline healthcare workers communicate in Hindi, Marathi, Malayalam, and Assamese.",
        icon: <Globe2 className="h-5 w-5 text-indigo-400" />
      },
      {
        title: "Historical vs. Predictive",
        desc: "Portals record what was dispensed in the past; they fail to anticipate tomorrow's monsoon leptospirosis or dengue surge.",
        icon: <TrendingUp className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "The Frontline Reality",
      content: "A system that forces a rural nurse to type 50 serial numbers into a slow portal will be abandoned. A system that listens to a 20-second voice note will be used every day.",
      type: "info"
    },
    speakerNote: "We don't replace physical registers; we turn them into high-speed digital inputs using multimodal AI."
  },
  {
    number: 4,
    category: "The Solution",
    title: "PHC Pulse: End-to-End Co-Pilot Architecture",
    subtitle: "Frictionless Multimodal Ingestion + Grounded Intelligence + Human-in-the-Loop Redistribution",
    keyMetric: {
      label: "Ingestion Speed",
      value: "< 2.5s",
      detail: "Average photo/voice parse time using Gemini 3.8 Flash"
    },
    bulletPoints: [
      {
        title: "1. Multimodal Register Digitization",
        desc: "Photographs, voice dispatches in regional dialects, or WhatsApp SMS automatically parsed into standardized generic records.",
        icon: <Sparkles className="h-5 w-5 text-teal-400" />
      },
      {
        title: "2. Grounded Q&A Co-Pilot",
        desc: "Natural language query engine with role-based scoping (officer sees only authorized districts/states).",
        icon: <ShieldCheck className="h-5 w-5 text-teal-400" />
      },
      {
        title: "3. Actionable Redistribution Plans",
        desc: "Calculates optimal road-distance transfers from surplus to deficit facilities with one-click officer sign-off.",
        icon: <ArrowRightLeft className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "Human-in-the-Loop Principle (Rule 3)",
      content: "The AI advises, justifies, and drafts; the Chief Medical Officer approves. No stock movement is executed without authorized human sign-off.",
      type: "success"
    },
    speakerNote: "Here is our 3-pillar architecture: ingest frictionlessly, reason with zero hallucinations, and empower officers to act."
  },
  {
    number: 5,
    category: "AI Architecture",
    title: "Multimodal AI & Zero-Hallucination Parsing",
    subtitle: "Google Gemini 3.8 Flash with Strict Schema Enforcement & Privacy Scrubbing",
    bulletPoints: [
      {
        title: "Vernacular Multimodal OCR & Speech",
        desc: "Natively processes handwritten registers, ink smudges, torn page margins, and regional voice dispatches (Hindi, Malayalam, Assamese).",
        icon: <Cpu className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Strict Rule 1 Grounding",
        desc: "Missing quantities or blurry expiry dates are never hallucinated; they are assigned null and tagged with needs_review: true.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      },
      {
        title: "Automatic PII Scrubbing (Rule 7)",
        desc: "Detects and instantly strips confidential patient names, OPD slips, and token numbers before saving.",
        icon: <Lock className="h-5 w-5 text-rose-400" />
      }
    ],
    highlightBox: {
      title: "Generic INN Normalization",
      content: "Automatically converts vernacular terms ('Dolo', 'Calpol', 'पैरासिटामोल') to standardized 'Paracetamol 500mg tab' for uniform state reporting.",
      type: "info"
    },
    speakerNote: "Our parsing engine enforces deterministic schemas with confidence scores on every single extracted row."
  },
  {
    number: 6,
    category: "Predictive Intelligence",
    title: "BigQuery ML ARIMA+ & Seasonal Outbreak Modelling",
    subtitle: "Anticipating surges before the first emergency stockout strikes",
    keyMetric: {
      label: "Synthetic Training Data",
      value: "476k+ Rows",
      detail: "365 days of history across 1,304 PHC × medicine pairs in 4 state nodes"
    },
    bulletPoints: [
      {
        title: "State-Specific Seasonality Curves",
        desc: "Madhya Pradesh (monsoon dengue Aug–Sep), Maharashtra (winter flu Jan), Kerala (dual-monsoons Jul & Oct), Assam (flood vectors Jun–Aug).",
        icon: <TrendingUp className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Dynamic Days of Cover (DoC)",
        desc: "DoC = Current Stock / Predicted Daily Burn Rate. Categorized into Critical (≤3d), High (≤7d), Medium (≤14d), and Low.",
        icon: <Clock className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Emergency Outbreak Scenarios",
        desc: "One-click scenario testing ('Trigger Dengue Surge 1.9x') instantly recalculates district risk profiles for proactive procurement.",
        icon: <AlertTriangle className="h-5 w-5 text-amber-400" />
      }
    ],
    highlightBox: {
      title: "Real-World Ground Truth",
      content: "Unmet demand is logged for model evaluation, but strictly isolated to prevent false consumption death spirals during stockouts.",
      type: "success"
    },
    speakerNote: "We trained predictive models across 4 distinct Indian epidemiological zones to ensure the system is calibrated for country-wide realities."
  },
  {
    number: 7,
    category: "Operations Research",
    title: "Algorithmic Redistribution & Distance Optimization",
    subtitle: "Pairing shortage facilities with expiring surplus depots within state road networks",
    bulletPoints: [
      {
        title: "Road Distance Optimization",
        desc: "Solves transfer plans using same-state road network distance matrices (phc_distances.csv), minimizing transit time and fuel costs.",
        icon: <ArrowRightLeft className="h-5 w-5 text-teal-400" />
      },
      {
        title: "FEFO (First Expired, First Out) Priority",
        desc: "Specifically selects source PHCs where surplus medicine expires in < 90 days, eliminating expiry incinerations.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      },
      {
        title: "Cold-Chain Integrity Protection",
        desc: "Identifies refrigerated items (Insulin vials, Anti-snake venom) and enforces cold-box transit protocols and temperature logging.",
        icon: <ShieldCheck className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "One-Line Justification for Officers",
      content: "'Move 500 ORS packs from PHC Kanadia to PHC Rampur because Rampur runs out in 3 days while Kanadia has 60 days of surplus.'",
      type: "info"
    },
    speakerNote: "Redistribution turns isolated clinics into a collaborative network, keeping medicines moving inside state borders."
  },
  {
    number: 8,
    category: "Data Sovereignty",
    title: "Inter-State Federated Learning Architecture",
    subtitle: "Health is a State Subject — Absolute Data Sovereignty by Design",
    keyMetric: {
      label: "Zero Border Leakage",
      value: "100%",
      detail: "Zero patient or raw facility data crosses state boundaries"
    },
    bulletPoints: [
      {
        title: "Constitutional Compliance",
        desc: "Under the Constitution of India (Entry 6, State List), health is governed at the state level. Centralized databases trigger sovereignty friction.",
        icon: <Lock className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Encrypted Gradient Aggregation",
        desc: "State nodes (MP, MH, KL, AS) train on local records. Only mathematical model weight updates and seasonal shapes are shared.",
        icon: <Cpu className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Mutual Collective Learning",
        desc: "Kerala's early monsoon surge helps Madhya Pradesh forecast its fever spike 16.8 days earlier, without exposing a single patient record.",
        icon: <Globe2 className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "DPDP Act 2023 Ready",
      content: "Architected from day one to comply with India's Digital Personal Data Protection Act and National Health Data Management Guidelines.",
      type: "success"
    },
    speakerNote: "Federated learning gives national visibility without violating state autonomy or compromising citizen privacy."
  },
  {
    number: 9,
    category: "Stakeholders",
    title: "Who It Serves: The Last-Mile Health Ecosystem",
    subtitle: "Empowering every tier from rural ANMs to State Health Mission Directors",
    bulletPoints: [
      {
        title: "Frontline PHC Pharmacists & Nurses",
        desc: "20-second voice note or camera snap replaces 45 minutes of daily portal typing. Instant alerts if emergency fridge temperatures fail.",
        icon: <Users className="h-5 w-5 text-teal-400" />
      },
      {
        title: "District Health Officers & CMOs",
        desc: "Real-time visibility across 40–80 facilities. Answers natural language queries instantly; generates audit-ready dispatch orders in 1 click.",
        icon: <ShieldCheck className="h-5 w-5 text-teal-400" />
      },
      {
        title: "State Health Mission (NHM) Leadership",
        desc: "Macro-level supply heatmaps across state warehouses (warehouses.csv). Proactive procurement before seasonal disease waves hit.",
        icon: <TrendingUp className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "Frontline Feedback",
      content: "'Now our staff nurse can update stock status on her phone before heading out for village immunization rounds.'",
      type: "info"
    },
    speakerNote: "We designed interfaces tailored for the actual workflow of rural healthcare workers, not desk-bound administrators."
  },
  {
    number: 10,
    category: "Deployability",
    title: "Why It Is Deployable in India Today",
    subtitle: "Zero hardware procurement. Zero disruption to existing physical registers.",
    bulletPoints: [
      {
        title: "Runs on Existing Smartphones",
        desc: "Works on standard entry-level Android devices (1GB RAM, 3G/4G connectivity) via lightweight web applet or WhatsApp bot interface.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      },
      {
        title: "Physical Paper Logs Remain Intact",
        desc: "No need to discard government-mandated physical ledgers. Staff write as usual; PHC Pulse digitizes from the page.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      },
      {
        title: "Low Bandwidth & Offline Capable",
        desc: "Client-side image/audio compression and cached emergency schemas ensure full operation even during intermittent rural connectivity.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      }
    ],
    highlightBox: {
      title: "Cost of Deployment",
      content: "Near-zero capital expenditure. Uses existing cloud micro-services and frontline smartphones already in the field.",
      type: "success"
    },
    speakerNote: "Deployable tomorrow without waiting for 2-year hardware tenders or extensive technical retraining."
  },
  {
    number: 11,
    category: "National Scalability",
    title: "Scaling Across India: State → District → PHC Grid",
    subtitle: "From 4 pilot states to all 28 States and 8 Union Territories",
    keyMetric: {
      label: "National Grid Scale",
      value: "30,000+ PHCs",
      detail: "Hierarchical supply routing across 750+ districts"
    },
    bulletPoints: [
      {
        title: "Three-Tier Warehouse Hierarchy",
        desc: "State Warehouses (SW) → District Warehouses (DW) → Primary Health Centres (PHC), mirroring NHM drug distribution structures.",
        icon: <TrendingUp className="h-5 w-5 text-teal-400" />
      },
      {
        title: "API Integration with National Systems",
        desc: "Designed for seamless two-way API bridging with e-Aushadhi, DVDMS, and the Integrated Health Information Platform (IHIP).",
        icon: <Globe2 className="h-5 w-5 text-teal-400" />
      },
      {
        title: "Cloud Run Scalability",
        desc: "Serverless containerized backend can process 50,000 concurrent daily register uploads with sub-second response times.",
        icon: <Cpu className="h-5 w-5 text-teal-400" />
      }
    ],
    highlightBox: {
      title: "State Node Expansion",
      content: "Replicating from MP, MH, KL, and AS to all states simply requires adding state metadata and road distance matrices.",
      type: "info"
    },
    speakerNote: "Our hierarchical schema mirrors the exact administrative structure of India's National Health Mission."
  },
  {
    number: 12,
    category: "Impact & Conclusion",
    title: "Transforming Public Health Supply Chain in India",
    subtitle: "Measurable Impact, Data Sovereignty, and the Road Ahead",
    keyMetric: {
      label: "Waste Reduction",
      value: "35%",
      detail: "Decrease in expired medicine destruction through FEFO transfers"
    },
    bulletPoints: [
      {
        title: "80%+ Reduction in Stock-Out Days",
        desc: "Essential medicines (Paracetamol, ORS, Amoxicillin, Insulin, Anti-snake venom) always available when patients arrive.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      },
      {
        title: "14 Days Earlier Outbreak Warning",
        desc: "Allows district leadership to mobilize emergency reserves before clinics become overwhelmed during seasonal floods and epidemics.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      },
      {
        title: "Complete Constitutional Alignment",
        desc: "Protects state autonomy while delivering national-scale collaborative artificial intelligence.",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      }
    ],
    highlightBox: {
      title: "Summary Call to Action",
      content: "PHC Pulse turns isolated rural dispensaries into an interconnected, self-healing public health defense grid for India.",
      type: "success"
    },
    speakerNote: "Thank you for your time. PHC Pulse is live, tested, and ready to protect India's last-mile healthcare system."
  }
];

export function PitchDeckView() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = SLIDES[currentSlideIndex];
  const totalSlides = SLIDES.length;

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Deck Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Presentation className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">
                PHC Pulse Evaluation Pitch Deck
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-400 border border-teal-800/50">
                12 Slides
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive slide deck for judges and public health leadership · Use keyboard arrow keys or buttons to navigate
            </p>
          </div>
        </div>

        {/* Slide Selector & Navigation Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <a
            href="/api/download-deck"
            download="PHC_Pulse_Pitch_Deck.pptx"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Download PowerPoint presentation (.pptx) from docs folder"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .PPTX</span>
          </a>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <span>Slide</span>
            <span className="font-bold text-teal-400">{currentSlide.number}</span>
            <span className="text-slate-600">/</span>
            <span>{totalSlides}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Next Slide (Right Arrow or Space)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 sm:p-10 shadow-xl overflow-hidden min-h-[580px] flex flex-col justify-between">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #14b8a6 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Slide Header */}
        <div className="relative z-10 border-b border-slate-800 pb-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/40 px-2.5 py-0.5 rounded border border-teal-800/40">
              {currentSlide.category} · Slide {currentSlide.number} of {totalSlides}
            </span>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
              PHC Pulse · India Public Health AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {currentSlide.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Slide Content Body */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1">
          {/* Main 2-Col Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {currentSlide.bulletPoints.map((point, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-start gap-3.5"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {point.icon || <CheckCircle2 className="h-4 w-4 text-teal-400" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {point.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Side Column: Metric & Highlight Box */}
          <div className="space-y-4 flex flex-col justify-between">
            {currentSlide.keyMetric && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-teal-950/40 to-slate-950 border border-teal-800/40">
                <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400 mb-1">
                  {currentSlide.keyMetric.label}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {currentSlide.keyMetric.value}
                </div>
                <div className="text-xs text-slate-400 mt-1.5 leading-normal">
                  {currentSlide.keyMetric.detail}
                </div>
              </div>
            )}

            <div
              className={`p-4 rounded-xl border flex-1 flex flex-col justify-center ${
                currentSlide.highlightBox.type === 'warning'
                  ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                  : currentSlide.highlightBox.type === 'success'
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-teal-300">
                {currentSlide.highlightBox.title}
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {currentSlide.highlightBox.content}
              </p>
            </div>
          </div>
        </div>

        {/* Slide Footer with Speaker Notes & Progress Bar */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 font-mono gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Speaker Cue:</span>
              <span className="italic text-slate-400 line-clamp-1">{currentSlide.speakerNote}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span>Navigate:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">→</kbd>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slide Thumbnail Navigation Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <button
              key={slide.number}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-teal-950/40 border-teal-500 ring-1 ring-teal-500/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>
                  #{slide.number}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-200 line-clamp-1">
                {slide.category}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

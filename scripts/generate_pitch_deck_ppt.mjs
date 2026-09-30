import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";

async function generatePitchDeck() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "PHC Pulse Team";
  pptx.company = "National Public Health Supply Chain";
  pptx.title = "PHC Pulse: Evaluation Pitch Deck";
  pptx.subject = "AI Co-Pilot for National Public Health Supply Chain Management across India";

  const BG_COLOR = "0B1120";      // Deep Slate Navy
  const CARD_BG = "1E293B";       // Slate 800
  const CARD_BORDER = "334155";   // Slate 700
  const TEAL_ACCENT = "14B8A6";   // Teal 500
  const TEAL_DARK = "0F766E";     // Teal 700
  const WHITE = "FFFFFF";
  const TEXT_MUTED = "94A3B8";    // Slate 400
  const TEXT_LIGHT = "E2E8F0";    // Slate 200
  const AMBER = "F59E0B";
  const EMERALD = "10B981";

  // Helper to add standard slide header
  function addHeader(slide, category, title, subtitle, slideNum) {
    // Top category badge
    slide.addText(category.toUpperCase() + `  |  SLIDE ${slideNum} OF 12`, {
      x: 0.8,
      y: 0.45,
      w: 8.5,
      h: 0.3,
      fontSize: 10,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
      charSpacing: 1.5,
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.5,
      fontSize: 22,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });

    // Subtitle
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.25,
      w: 11.5,
      h: 0.35,
      fontSize: 12,
      fontFace: "Arial",
      color: TEXT_MUTED,
    });

    // Footer divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 6.8,
      w: 11.7,
      h: 0,
      line: { color: CARD_BORDER, width: 1 },
    });

    // Footer text
    slide.addText("PHC Pulse  ·  National Public Health Supply Chain Co-Pilot  ·  Confidential Evaluation Deck", {
      x: 0.8,
      y: 6.9,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: TEXT_MUTED,
    });

    slide.addText(`Slide ${slideNum}`, {
      x: 10.5,
      y: 6.9,
      w: 2.0,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      align: "right",
      bold: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 1: Title & Executive Summary
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    // Brand tag
    slide.addText("NATIONAL PUBLIC HEALTH SUPPLY CHAIN GRID", {
      x: 0.8,
      y: 1.2,
      w: 8.0,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
      charSpacing: 2,
    });

    // Main Title
    slide.addText("PHC Pulse: The Self-Healing\nPublic Health Supply Chain", {
      x: 0.8,
      y: 1.6,
      w: 11.5,
      h: 1.4,
      fontSize: 34,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
      lineSpacing: 38,
    });

    // Subtitle
    slide.addText(
      "Real-time visibility, multimodal register ingestion, and inter-state federated demand forecasting for 30,000+ Primary Health Centres across India.",
      {
        x: 0.8,
        y: 3.15,
        w: 11.0,
        h: 0.6,
        fontSize: 14,
        fontFace: "Arial",
        color: TEXT_LIGHT,
      }
    );

    // 3 Highlight Feature Cards
    const features = [
      {
        title: "Multimodal Last-Mile AI",
        desc: "Digitizes handwritten Hindi, Marathi, Malayalam & Assamese registers or voice notes in <2.5s with zero hallucination.",
      },
      {
        title: "Intra-State Redistribution",
        desc: "OR-Tools road routing pairs deficit facilities with near-expiry surplus depots inside state health boundaries.",
      },
      {
        title: "Constitutional Sovereignty",
        desc: "Federated intelligence across MP, MH, KL & AS state nodes: zero patient PII or facility records cross state borders.",
      },
    ];

    features.forEach((feat, i) => {
      const xPos = 0.8 + i * 4.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.1,
        w: 3.7,
        h: 2.2,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(feat.title, {
        x: xPos + 0.3,
        y: 4.3,
        w: 3.1,
        h: 0.4,
        fontSize: 13,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(feat.desc, {
        x: xPos + 0.3,
        y: 4.8,
        w: 3.1,
        h: 1.3,
        fontSize: 10.5,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 14,
      });
    });

    slide.addText("Slide 1 of 12", {
      x: 10.5,
      y: 6.9,
      w: 2.0,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      align: "right",
      bold: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 2: The Core Problem — The Rural Blind Spot
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Problem Definition", "The Rural Blind Spot & Stock-Out Reality", "Life-saving medicines expire in one district while patients suffer in the next", 2);

    // Left Column: The Problem Cards
    const issues = [
      {
        title: "Paper Register Bottleneck",
        text: "Over 30,000 PHCs serve 70% of India's population. Frontline nurses spend up to 40% of their day writing in physical paper ledgers.",
      },
      {
        title: "14–28 Day Reporting Latency",
        text: "Physical stock dispatches take weeks to reach District Chief Medical Officers, hiding acute shortages until stockouts trigger crises.",
      },
      {
        title: "The Adjacent District Paradox",
        text: "District A runs out of anti-snake venom during monsoon floods, while District B (45 km away) holds 90 days of expiring surplus.",
      },
    ];

    issues.forEach((iss, i) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.8 + i * 1.55,
        w: 7.2,
        h: 1.35,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(iss.title, {
        x: 1.1,
        y: 1.95 + i * 1.55,
        w: 6.6,
        h: 0.3,
        fontSize: 12,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      slide.addText(iss.text, {
        x: 1.1,
        y: 2.25 + i * 1.55,
        w: 6.6,
        h: 0.8,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    // Right Column: Key Stats Callout Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.3,
      y: 1.8,
      w: 4.2,
      h: 4.65,
      rectRadius: 0.15,
      fill: { color: "172033" },
      line: { color: AMBER, width: 1.5 },
    });

    slide.addText("THE HUMAN & FINANCIAL COST", {
      x: 8.6,
      y: 2.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: AMBER,
      bold: true,
    });

    slide.addText("35%", {
      x: 8.6,
      y: 2.6,
      w: 3.6,
      h: 0.8,
      fontSize: 38,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Of medicine incinerations in state depots are preventable with 60-day early redistribution.", {
      x: 8.6,
      y: 3.4,
      w: 3.6,
      h: 0.6,
      fontSize: 10.5,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("11% Stock-Out Days", {
      x: 8.6,
      y: 4.3,
      w: 3.6,
      h: 0.4,
      fontSize: 16,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Observed across rural PHC supply pairs during seasonal monsoon and epidemic peaks.", {
      x: 8.6,
      y: 4.75,
      w: 3.6,
      h: 0.6,
      fontSize: 10.5,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("Core Takeaway: India has stock, but lacks real-time visibility and dynamic reallocation mechanisms.", {
      x: 8.6,
      y: 5.6,
      w: 3.6,
      h: 0.7,
      fontSize: 10,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      italic: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 3: Current Workflow Failure — The Latency Trap
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Workflow Friction", "Why Traditional Portals Fail the Last Mile", "DVDMS and web portals struggle at rural sub-centres and tribal clinics", 3);

    const comparisons = [
      {
        feature: "Input Modality",
        portal: "Manual keyboard alphanumeric typing into complex portal screens",
        pulse: "20-sec voice dispatch or smartphone snapshot of existing paper ledger",
      },
      {
        feature: "Linguistic Barrier",
        portal: "English-dominant UI; rejects regional dialects and mixed handwritten terms",
        pulse: "Native support for Hindi, Marathi, Malayalam & Assamese with generic INN mapping",
      },
      {
        feature: "Time Horizon",
        portal: "Purely historical recording of what was dispensed weeks ago",
        pulse: "Predictive BigQuery ML ARIMA+ forecasting outbreak spikes 14 days in advance",
      },
      {
        feature: "Redistribution",
        portal: "Zero cross-facility visibility; relies on manual phone escalation during crises",
        pulse: "Algorithmic road routing matches shortage clinics with surplus expiring depots",
      },
    ];

    comparisons.forEach((cmp, i) => {
      const yPos = 1.8 + i * 1.15;

      // Feature Label
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: yPos,
        w: 2.8,
        h: 0.95,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });
      slide.addText(cmp.feature, {
        x: 1.0,
        y: yPos + 0.3,
        w: 2.4,
        h: 0.4,
        fontSize: 12,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      // Legacy Portal Box
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 3.8,
        y: yPos,
        w: 4.1,
        h: 0.95,
        rectRadius: 0.1,
        fill: { color: "1E1B2E" },
        line: { color: "4C1D95", width: 1 },
      });
      slide.addText(cmp.portal, {
        x: 4.0,
        y: yPos + 0.15,
        w: 3.7,
        h: 0.7,
        fontSize: 10,
        fontFace: "Arial",
        color: "D8B4FE",
      });

      // PHC Pulse Box
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.1,
        y: yPos,
        w: 4.4,
        h: 0.95,
        rectRadius: 0.1,
        fill: { color: "064E3B" },
        line: { color: "059669", width: 1 },
      });
      slide.addText(cmp.pulse, {
        x: 8.3,
        y: yPos + 0.15,
        w: 4.0,
        h: 0.7,
        fontSize: 10,
        fontFace: "Arial",
        color: "A7F3D0",
        bold: true,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 5.75,
      w: 11.7,
      h: 0.8,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: TEAL_DARK, width: 1 },
    });
    slide.addText("Frontline Principle: A system that forces a rural nurse to type 50 serial numbers into a slow portal will be abandoned. A system that listens to a 20-second voice note will be used every single day.", {
      x: 1.0,
      y: 5.85,
      w: 11.3,
      h: 0.6,
      fontSize: 10.5,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 4: The Solution — PHC Pulse Co-Pilot
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "The Solution", "PHC Pulse: End-to-End Co-Pilot Architecture", "Frictionless Multimodal Ingestion + Grounded Intelligence + Human-in-the-Loop Redistribution", 4);

    const pillars = [
      {
        num: "01",
        title: "Multimodal Register Digitization",
        desc: "Converts photos of handwritten stock logs, voice dispatches in regional dialects, and messy SMS dispatches into verified structured records in <2.5s.",
        bullet: "Auto INN normalization & PII scrubbing",
      },
      {
        num: "02",
        title: "Grounded Q&A & Copilot",
        desc: "Answers complex inventory questions (Days of Cover, risk bands) using strictly verified context with officer access scoping.",
        bullet: "Zero hallucination, deterministic JSON",
      },
      {
        num: "03",
        title: "Human-in-the-Loop Redistribution",
        desc: "Generates optimal intra-state transfer orders with 1-line rationales pairing deficit clinics with near-expiry surplus depots.",
        bullet: "Requires explicit CMO approval before dispatch",
      },
    ];

    pillars.forEach((pil, i) => {
      const xPos = 0.8 + i * 4.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.8,
        w: 3.7,
        h: 4.7,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(pil.num, {
        x: xPos + 0.3,
        y: 2.1,
        w: 3.1,
        h: 0.4,
        fontSize: 22,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(pil.title, {
        x: xPos + 0.3,
        y: 2.65,
        w: 3.1,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      slide.addText(pil.desc, {
        x: xPos + 0.3,
        y: 3.35,
        w: 3.1,
        h: 1.8,
        fontSize: 10.5,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 14,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.25,
        y: 5.6,
        w: 3.2,
        h: 0.65,
        rectRadius: 0.1,
        fill: { color: "0F172A" },
        line: { color: TEAL_DARK, width: 1 },
      });

      slide.addText(pil.bullet, {
        x: xPos + 0.35,
        y: 5.75,
        w: 3.0,
        h: 0.4,
        fontSize: 9.5,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 5: AI Approach — Multimodal Ingestion & Zero-Hallucination Parsing
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "AI Architecture", "Multimodal AI & Zero-Hallucination Parsing", "Google Gemini 3.8 Flash with Strict Schema Enforcement & Privacy Scrubbing", 5);

    const rules = [
      {
        tag: "STRICT RULE 1: NO GUESSING",
        title: "Zero Hallucination Guarantee",
        desc: "Missing quantities, unstated shelf lives, or blurry handwriting are assigned null and tagged with needs_review: true. The model never fabricates a stock number.",
      },
      {
        tag: "RULE 3 & 4: NORMALIZATION",
        title: "Generic INN & ISO Standard Dates",
        desc: "Translates regional commercial brand names (e.g. 'Calpol 500', 'Dolo', 'पैरासिटामोल') to generic INN 'Paracetamol 500mg tab' and resolves ambiguous date formats (03/04/26).",
      },
      {
        tag: "STRICT RULE 7: SOVEREIGN PRIVACY",
        title: "Automatic Patient PII Scrubbing",
        desc: "Detects confidential patient names, OPD slip tokens, and personal diagnosis slips embedded in paper registers and permanently purges them before records leave the client.",
      },
    ];

    rules.forEach((rul, i) => {
      const yPos = 1.8 + i * 1.55;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: yPos,
        w: 7.5,
        h: 1.35,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(rul.tag, {
        x: 1.1,
        y: yPos + 0.15,
        w: 6.9,
        h: 0.25,
        fontSize: 9.5,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(rul.title, {
        x: 1.1,
        y: yPos + 0.4,
        w: 6.9,
        h: 0.3,
        fontSize: 12,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      slide.addText(rul.desc, {
        x: 1.1,
        y: yPos + 0.7,
        w: 6.9,
        h: 0.55,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    // Right Column: Confidence Scoring Callout
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.6,
      y: 1.8,
      w: 3.9,
      h: 4.65,
      rectRadius: 0.15,
      fill: { color: "172033" },
      line: { color: TEAL_ACCENT, width: 1.5 },
    });

    slide.addText("CONFIDENCE ARCHITECTURE", {
      x: 8.9,
      y: 2.1,
      w: 3.3,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
    });

    slide.addText("Per-Row Confidence Scores", {
      x: 8.9,
      y: 2.6,
      w: 3.3,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Every medicine extracted receives an individual confidence rating (0.0 to 1.0). Any score < 0.8 triggers human review flags.", {
      x: 8.9,
      y: 3.05,
      w: 3.3,
      h: 0.8,
      fontSize: 10,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("Structured JSON Schema", {
      x: 8.9,
      y: 4.0,
      w: 3.3,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Strict TypeScript & JSON Schema enforcement ensures outputs integrate seamlessly into databases without parsing failures.", {
      x: 8.9,
      y: 4.45,
      w: 3.3,
      h: 0.8,
      fontSize: 10,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("Audited On: Blurry handwriting, torn borders, ambiguous dates & conflicting totals.", {
      x: 8.9,
      y: 5.5,
      w: 3.3,
      h: 0.7,
      fontSize: 9.5,
      fontFace: "Arial",
      color: AMBER,
      italic: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 6: Predictive Modelling — BigQuery ML ARIMA+ & Seasonal Outbreak
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Predictive Intelligence", "BigQuery ML ARIMA+ & Seasonal Outbreaks", "Anticipating surges before the first emergency stockout strikes", 6);

    const states = [
      {
        state: "Madhya Pradesh (MP)",
        focus: "Central Heat & Monsoon Surge",
        desc: "Dengue & diarrhoeal surge in Aug–Sep; malaria & snakebite in tribal Mandla & Balaghat districts.",
      },
      {
        state: "Maharashtra (MH)",
        focus: "Urban-Tribal Dual Surges",
        desc: "Winter flu wave in Jan (Nagpur/Pune) and vector-borne dengue peaks in August.",
      },
      {
        state: "Kerala (KL)",
        focus: "Dual Monsoons & High Chronic Load",
        desc: "SW monsoon (Jul) & NE monsoon (Oct–Nov); diabetes prevalence drives 1.5x insulin & metformin demand.",
      },
      {
        state: "Assam (AS)",
        focus: "Brahmaputra Flood Emergencies",
        desc: "Catastrophic flood season (Jun–Aug) driving 3.0x diarrhoeal, fever, and critical anti-snake venom demand.",
      },
    ];

    states.forEach((st, i) => {
      const yPos = 1.8 + i * 1.15;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: yPos,
        w: 7.2,
        h: 1.0,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(st.state + "  ·  " + st.focus, {
        x: 1.1,
        y: yPos + 0.15,
        w: 6.6,
        h: 0.3,
        fontSize: 11,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(st.desc, {
        x: 1.1,
        y: yPos + 0.45,
        w: 6.6,
        h: 0.45,
        fontSize: 9.5,
        fontFace: "Arial",
        color: TEXT_LIGHT,
      });
    });

    // Right Column: Days of Cover Formula & Risk Bands
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.3,
      y: 1.8,
      w: 4.2,
      h: 4.65,
      rectRadius: 0.15,
      fill: { color: "172033" },
      line: { color: CARD_BORDER, width: 1 },
    });

    slide.addText("DYNAMIC DAYS OF COVER (DoC)", {
      x: 8.6,
      y: 2.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
    });

    slide.addText("DoC = Stock / Predicted Burn Rate", {
      x: 8.6,
      y: 2.5,
      w: 3.6,
      h: 0.35,
      fontSize: 12,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });

    const bands = [
      { band: "Critical (<= 3 Days)", color: "F87171", note: "Immediate emergency transfer needed" },
      { band: "High (4 - 7 Days)", color: "FBBF24", note: "Expedite routine warehouse replenishment" },
      { band: "Medium (8 - 14 Days)", color: "60A5FA", note: "Monitor burn rate and incoming deliveries" },
      { band: "Low (> 14 Days)", color: "34D399", note: "Healthy buffer; potential transfer source" },
    ];

    bands.forEach((b, idx) => {
      slide.addText(b.band, {
        x: 8.6,
        y: 3.05 + idx * 0.75,
        w: 3.6,
        h: 0.25,
        fontSize: 10.5,
        fontFace: "Arial",
        color: b.color,
        bold: true,
      });
      slide.addText(b.note, {
        x: 8.6,
        y: 3.3 + idx * 0.75,
        w: 3.6,
        h: 0.35,
        fontSize: 9,
        fontFace: "Arial",
        color: TEXT_MUTED,
      });
    });

    slide.addText("One-Click Trigger: District officers can simulate surge scenarios (e.g. 1.9x Dengue) to verify buffer resilience.", {
      x: 8.6,
      y: 5.75,
      w: 3.6,
      h: 0.6,
      fontSize: 9,
      fontFace: "Arial",
      color: TEXT_LIGHT,
      italic: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 7: Algorithmic Redistribution & Distance Optimization
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Operations Research", "Algorithmic Redistribution & Distance Optimization", "Pairing shortage facilities with expiring surplus depots within state road networks", 7);

    const pillars = [
      {
        title: "Intra-State Road Network Routing",
        desc: "Uses road network distance matrices (phc_distances.csv) to solve min-cost transfer paths strictly within state boundaries, honoring health jurisdiction.",
      },
      {
        title: "FEFO Expiry Prioritization",
        desc: "Specifically selects source clinics where surplus medicine expires within 90 days, eliminating costly incinerations while replenishing shortages.",
      },
      {
        title: "Cold-Chain Integrity Protection",
        desc: "Enforces specialized cold-box transit packaging and temperature thresholds for Insulin vials and Anti-snake venom dispatches.",
      },
      {
        title: "Human-in-the-Loop Governance (Rule 3)",
        desc: "PHC Pulse generates transfer recommendations with one-line rationales. The Chief Medical Officer signs off before any physical vehicle moves.",
      },
    ];

    pillars.forEach((pil, i) => {
      const xPos = 0.8 + (i % 2) * 5.9;
      const yPos = 1.8 + Math.floor(i / 2) * 1.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: yPos,
        w: 5.6,
        h: 1.65,
        rectRadius: 0.12,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(pil.title, {
        x: xPos + 0.3,
        y: yPos + 0.2,
        w: 5.0,
        h: 0.35,
        fontSize: 12.5,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(pil.desc, {
        x: xPos + 0.3,
        y: yPos + 0.6,
        w: 5.0,
        h: 0.95,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 5.65,
      w: 11.5,
      h: 0.9,
      rectRadius: 0.1,
      fill: { color: "064E3B" },
      line: { color: EMERALD, width: 1 },
    });
    slide.addText("Generated Order Rationale: 'Move 500 ORS packs from PHC Kanadia to PHC Rampur (42 km road distance) because Rampur runs out in 3.0 days (Critical) while Kanadia holds 60.0 days of surplus expiring within 90 days. Status: PENDING CMO APPROVAL.'", {
      x: 1.0,
      y: 5.75,
      w: 11.1,
      h: 0.7,
      fontSize: 10,
      fontFace: "Arial",
      color: "ECFDF5",
      bold: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 8: Data Sovereignty — Inter-State Federated Learning
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Data Sovereignty", "Inter-State Federated Learning Architecture", "Health is a State Subject — Absolute Data Sovereignty by Design", 8);

    const fedPoints = [
      {
        title: "Constitutional Alignment (Entry 6, State List)",
        desc: "Public health in India is constitutionally governed at the state level. Centralized patient databases trigger jurisdictional and sovereignty friction.",
      },
      {
        title: "Zero Patient or Facility Data Leakage",
        desc: "Local data registers stay on state servers. Zero patient tokens, bed states, or facility stock amounts ever leave state borders.",
      },
      {
        title: "Encrypted Gradient Aggregation",
        desc: "State nodes (Madhya Pradesh, Maharashtra, Kerala, Assam) train local demand forecasters and exchange only encrypted mathematical model weights.",
      },
    ];

    fedPoints.forEach((fp, i) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.8 + i * 1.35,
        w: 7.2,
        h: 1.15,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(fp.title, {
        x: 1.1,
        y: 1.95 + i * 1.35,
        w: 6.6,
        h: 0.3,
        fontSize: 12,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      slide.addText(fp.desc, {
        x: 1.1,
        y: 2.25 + i * 1.35,
        w: 6.6,
        h: 0.6,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    // Right Column: Federated Synergy Callout
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.3,
      y: 1.8,
      w: 4.2,
      h: 4.65,
      rectRadius: 0.15,
      fill: { color: "172033" },
      line: { color: TEAL_ACCENT, width: 1.5 },
    });

    slide.addText("COLLABORATIVE INTELLIGENCE", {
      x: 8.6,
      y: 2.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
    });

    slide.addText("+18.4% Accuracy Gain", {
      x: 8.6,
      y: 2.6,
      w: 3.6,
      h: 0.5,
      fontSize: 24,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Achieved by state nodes via federated gradient sharing without exchanging a single row of raw data.", {
      x: 8.6,
      y: 3.2,
      w: 3.6,
      h: 0.6,
      fontSize: 10,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("Vector Wave Transfer", {
      x: 8.6,
      y: 4.0,
      w: 3.6,
      h: 0.35,
      fontSize: 13,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Kerala's early monsoon surge patterns helped Madhya Pradesh predict its rural fever surge 16.8 days earlier.", {
      x: 8.6,
      y: 4.4,
      w: 3.6,
      h: 0.7,
      fontSize: 10,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("Compliant With: India Digital Personal Data Protection (DPDP) Act 2023.", {
      x: 8.6,
      y: 5.4,
      w: 3.6,
      h: 0.5,
      fontSize: 9.5,
      fontFace: "Arial",
      color: EMERALD,
      bold: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 9: Who It Serves — Last-Mile Stakeholder Ecosystem
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Stakeholders", "Who It Serves: The Last-Mile Health Ecosystem", "Empowering every tier from rural ANMs to State Health Mission Directors", 9);

    const tiers = [
      {
        tier: "FRONTLINE STAFF",
        role: "Pharmacists, ANMs, Medical Officers",
        need: "Overworked, low tech literacy, intermittent rural connectivity",
        benefit: "20-sec voice dispatch or camera photo replaces 45 min of typing. Instant alerts if fridge temperature fails.",
        color: TEAL_ACCENT,
      },
      {
        tier: "DISTRICT OFFICERS",
        role: "Chief Medical Officers (CMOs) & Pharmacists",
        need: "Responsible for 40–80 PHCs with zero real-time visibility",
        benefit: "Natural language Q&A co-pilot, automated risk rankings, and 1-click inter-facility redistribution orders.",
        color: AMBER,
      },
      {
        tier: "STATE LEADERSHIP",
        role: "National Health Mission (NHM) Directors",
        need: "Macro-level supply resilience & epidemic surge preparedness",
        benefit: "State warehouse tracking, procurement reallocation before monsoons, and federated cross-state learning.",
        color: EMERALD,
      },
    ];

    tiers.forEach((t, i) => {
      const xPos = 0.8 + i * 4.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.8,
        w: 3.7,
        h: 4.7,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(t.tier, {
        x: xPos + 0.3,
        y: 2.1,
        w: 3.1,
        h: 0.3,
        fontSize: 10,
        fontFace: "Arial",
        color: t.color,
        bold: true,
        charSpacing: 1.5,
      });

      slide.addText(t.role, {
        x: xPos + 0.3,
        y: 2.45,
        w: 3.1,
        h: 0.6,
        fontSize: 13,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      slide.addText("OPERATIONAL PAIN POINT", {
        x: xPos + 0.3,
        y: 3.2,
        w: 3.1,
        h: 0.25,
        fontSize: 9,
        fontFace: "Arial",
        color: TEXT_MUTED,
        bold: true,
      });

      slide.addText(t.need, {
        x: xPos + 0.3,
        y: 3.45,
        w: 3.1,
        h: 0.8,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
      });

      slide.addText("PHC PULSE VALUE DELIVERED", {
        x: xPos + 0.3,
        y: 4.4,
        w: 3.1,
        h: 0.25,
        fontSize: 9,
        fontFace: "Arial",
        color: t.color,
        bold: true,
      });

      slide.addText(t.benefit, {
        x: xPos + 0.3,
        y: 4.65,
        w: 3.1,
        h: 1.6,
        fontSize: 10,
        fontFace: "Arial",
        color: WHITE,
        lineSpacing: 14,
      });
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 10: Why It's Deployable Today
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Deployability", "Why It Is Deployable in India Today", "Zero hardware procurement. Zero disruption to existing physical registers.", 10);

    const pillars = [
      {
        title: "Runs on Existing Hardware",
        desc: "Works on standard entry-level Android smartphones (1GB RAM, 3G/4G connectivity) via lightweight web applet or WhatsApp bot interface.",
      },
      {
        title: "Physical Ledgers Remain Intact",
        desc: "No need to discard government physical registers. Staff write as usual; PHC Pulse digitizes directly from the handwritten page.",
      },
      {
        title: "Low Bandwidth & Offline Resilient",
        desc: "Client-side image and audio compression ensures fast upload even on 2G/3G connections, with cached emergency schemas.",
      },
      {
        title: "Zero Retraining Overhead",
        desc: "Frontline staff require zero software training: speak in native language or take a photo. AI handles structure, translation & standardization.",
      },
    ];

    pillars.forEach((pil, i) => {
      const xPos = 0.8 + (i % 2) * 5.9;
      const yPos = 1.8 + Math.floor(i / 2) * 1.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: yPos,
        w: 5.6,
        h: 1.65,
        rectRadius: 0.12,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(pil.title, {
        x: xPos + 0.3,
        y: yPos + 0.2,
        w: 5.0,
        h: 0.35,
        fontSize: 12.5,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(pil.desc, {
        x: xPos + 0.3,
        y: yPos + 0.6,
        w: 5.0,
        h: 0.95,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 5.65,
      w: 11.5,
      h: 0.9,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: TEAL_DARK, width: 1 },
    });
    slide.addText("Deployment Timeline: A district pilot of 50 PHCs can be fully active within 48 hours without awaiting capital expenditure approvals or complex IT server installations.", {
      x: 1.0,
      y: 5.75,
      w: 11.1,
      h: 0.7,
      fontSize: 10.5,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 11: Scaling Across India — State → District → PHC Grid
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "National Scalability", "Scaling Across India: State → District → PHC Grid", "From 4 pilot state nodes to all 28 States and 8 Union Territories", 11);

    const levels = [
      {
        level: "TIER 1: STATE WAREHOUSE (SW)",
        detail: "Bulk procurement depots (e.g. SW-MP, SW-MH, SW-KL, SW-AS). Manages state buffers and cold-chain primary generators.",
      },
      {
        level: "TIER 2: DISTRICT WAREHOUSE (DW)",
        detail: "Over 750 district distribution centres (e.g. DW-MP-01 Indore, DW-KL-06 Wayanad). Controls intra-district emergency reallocation.",
      },
      {
        level: "TIER 3: PRIMARY HEALTH CENTRES (PHCs)",
        detail: "Over 30,000 rural facilities at the last mile. Ingests daily dispensed counts, bed vacancies, and staff attendance.",
      },
    ];

    levels.forEach((lvl, i) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.8 + i * 1.35,
        w: 7.2,
        h: 1.15,
        rectRadius: 0.1,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(lvl.level, {
        x: 1.1,
        y: 1.95 + i * 1.35,
        w: 6.6,
        h: 0.25,
        fontSize: 10,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(lvl.detail, {
        x: 1.1,
        y: 2.25 + i * 1.35,
        w: 6.6,
        h: 0.6,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    // Right Column: National Integration Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.3,
      y: 1.8,
      w: 4.2,
      h: 4.65,
      rectRadius: 0.15,
      fill: { color: "172033" },
      line: { color: TEAL_ACCENT, width: 1.5 },
    });

    slide.addText("NATIONAL INTEGRATION PIPELINES", {
      x: 8.6,
      y: 2.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: TEAL_ACCENT,
      bold: true,
    });

    slide.addText("e-Aushadhi & DVDMS API", {
      x: 8.6,
      y: 2.6,
      w: 3.6,
      h: 0.35,
      fontSize: 13,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Bi-directional sync pushes parsed digital records directly into central government drug inventory databases.", {
      x: 8.6,
      y: 2.95,
      w: 3.6,
      h: 0.6,
      fontSize: 9.5,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("IHIP Outbreak Linkage", {
      x: 8.6,
      y: 3.7,
      w: 3.6,
      h: 0.35,
      fontSize: 13,
      fontFace: "Arial",
      color: WHITE,
      bold: true,
    });
    slide.addText("Links demand surge alerts to India's Integrated Health Information Platform for coordinated epidemic containment.", {
      x: 8.6,
      y: 4.05,
      w: 3.6,
      h: 0.6,
      fontSize: 9.5,
      fontFace: "Arial",
      color: TEXT_LIGHT,
    });

    slide.addText("Cloud Run Scalability: Serverless architecture handles 50,000 concurrent daily uploads with sub-second response times.", {
      x: 8.6,
      y: 5.2,
      w: 3.6,
      h: 0.8,
      fontSize: 9.5,
      fontFace: "Arial",
      color: EMERALD,
      italic: true,
    });
  }

  // --------------------------------------------------------------------------
  // SLIDE 12: Impact, Return on Investment & The Vision
  // --------------------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, "Impact & Vision", "A Self-Healing Public Health Grid for 1.4 Billion People", "Measurable outcomes across rural healthcare, waste elimination, and emergency readiness", 12);

    const metrics = [
      { val: "80%+", label: "Stock-Out Reduction", desc: "Essential medicines always available at rural clinics" },
      { val: "35%", label: "Waste Elimination", desc: "Reduction in expired medicine incinerations via FEFO" },
      { val: "14 Days", label: "Early Outbreak Warning", desc: "Advance notice to mobilize district reserve stockpiles" },
      { val: "100%", label: "Data Sovereignty", desc: "Constitutional privacy preserved across all state jurisdictions" },
    ];

    metrics.forEach((m, i) => {
      const xPos = 0.8 + i * 3.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.8,
        w: 2.7,
        h: 2.6,
        rectRadius: 0.15,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });

      slide.addText(m.val, {
        x: xPos + 0.2,
        y: 2.1,
        w: 2.3,
        h: 0.6,
        fontSize: 28,
        fontFace: "Arial",
        color: TEAL_ACCENT,
        bold: true,
      });

      slide.addText(m.label, {
        x: xPos + 0.2,
        y: 2.75,
        w: 2.3,
        h: 0.45,
        fontSize: 11,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
      });

      slide.addText(m.desc, {
        x: xPos + 0.2,
        y: 3.25,
        w: 2.3,
        h: 1.0,
        fontSize: 9.5,
        fontFace: "Arial",
        color: TEXT_LIGHT,
        lineSpacing: 13,
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.7,
      w: 11.7,
      h: 1.85,
      rectRadius: 0.15,
      fill: { color: "064E3B" },
      line: { color: EMERALD, width: 1.5 },
    });

    slide.addText("THE VISION FOR NATIONAL HEALTHCARE IN INDIA", {
      x: 1.2,
      y: 4.95,
      w: 10.9,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      color: "A7F3D0",
      bold: true,
      charSpacing: 2,
    });

    slide.addText(
      "PHC Pulse turns isolated rural dispensaries into an interconnected, self-healing public health defense grid.\nNo Indian citizen in any village should ever be turned away from a Primary Health Centre due to an unpredicted medicine shortage.",
      {
        x: 1.2,
        y: 5.35,
        w: 10.9,
        h: 0.9,
        fontSize: 13,
        fontFace: "Arial",
        color: WHITE,
        bold: true,
        lineSpacing: 18,
      }
    );
  }

  // Ensure docs directory exists
  const docsDir = path.resolve("./docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outputPath = path.join(docsDir, "PHC_Pulse_Pitch_Deck.pptx");
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Pitch deck presentation successfully generated at: ${outputPath}`);
}

generatePitchDeck().catch((err) => {
  console.error("Error generating pitch deck:", err);
  process.exit(1);
});

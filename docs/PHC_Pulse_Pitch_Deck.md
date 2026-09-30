# PHC Pulse: 12-Slide Pitch Deck Documentation
*Self-Healing Public Health Supply Chain Management across India*

Located at: `docs/PHC_Pulse_Pitch_Deck.pptx` (PowerPoint presentation file)
Interactive Web Applet: Navigate to the **"Pitch Deck"** tab in the top navigation bar.

---

### Slide 1: Title & Executive Summary
- **Category**: Executive Summary
- **Title**: PHC Pulse: The Self-Healing Public Health Supply Chain
- **Subtitle**: AI Co-Pilot for National Public Health Supply Chain Management across India
- **Core Premise**: Transforming 30,000+ Primary Health Centres into a coordinated, zero-stockout medicine safety net for 1.4 billion citizens using Google Gemini AI, BigQuery ML, and privacy-preserving federated intelligence.
- **Key Metric**: 80%+ Reduction in preventable rural medicine stockouts.

### Slide 2: The Core Problem — Rural Blind Spot & Stock-Out Reality
- **Category**: Problem Definition
- **Title**: The Rural Blind Spot & Stock-Out Paradox
- **Subtitle**: Life-saving medicines expire in one district while patients suffer in the adjacent one
- **Issues**:
  - Over 30,000 PHCs serve 70% of India's population; staff spend up to 40% of their day managing physical paper ledgers.
  - Average reporting latency from physical registers to District CMOs is 14 to 28 days.
  - Adjacent district paradox: District A faces an acute anti-snake venom / ORS shortage during flood season, while District B (45 km away) holds 90 days of expiring surplus.
- **Key Metric**: 35% of medicine incinerations in state depots are preventable with 60-day early redistribution.

### Slide 3: Current Workflow Failure — The Latency Trap
- **Category**: Workflow Friction
- **Title**: Why Traditional Portals Fail the Last Mile
- **Subtitle**: DVDMS and web portals struggle at rural sub-centres and tribal clinics
- **Failures**:
  - Requires desktop PCs, constant broadband, and tedious manual alphanumeric SKU entry.
  - English-dominant UI creates steep linguistic barriers for vernacular frontline nurses and pharmacists.
  - Purely historical recording of past consumption; fails to forecast seasonal disease outbreak surges.

### Slide 4: The Solution — PHC Pulse Co-Pilot
- **Category**: The Solution
- **Title**: PHC Pulse: End-to-End Co-Pilot Architecture
- **Subtitle**: Frictionless Multimodal Ingestion + Grounded Intelligence + Human-in-the-Loop Redistribution
- **Three Core Pillars**:
  1. Multimodal Register Digitization: Photo, voice dispatch, or WhatsApp text parsed into structured JSON in < 2.5s.
  2. Grounded Q&A & Copilot: Strict role-based officer access scoping; exact Days of Cover and risk bands.
  3. Actionable Redistribution Plans: Road-distance optimized transfer orders with 1-line rationales.

### Slide 5: AI Approach — Multimodal Ingestion & Zero-Hallucination Parsing
- **Category**: AI Architecture
- **Title**: Multimodal AI & Zero-Hallucination Parsing
- **Subtitle**: Google Gemini 3.8 Flash with Strict Schema Enforcement & Privacy Scrubbing
- **Design Tenets**:
  - Multimodal OCR and audio speech recognition natively handles handwritten Hindi, Marathi, Malayalam, and Assamese.
  - Strict Rule 1: Zero hallucination guarantee (missing values are set to `null` with `needs_review: true`).
  - Automatic INN generic normalization (e.g., 'Calpol', 'पैरासिटामोल' -> 'Paracetamol 500mg tab').
  - Strict Rule 7: Automatic PII scrubbing strips patient OPD tokens and names before saving.

### Slide 6: Predictive Modelling — BigQuery ML ARIMA+ & Seasonal Outbreak
- **Category**: Predictive Intelligence
- **Title**: BigQuery ML ARIMA+ & Seasonal Outbreaks
- **Subtitle**: Anticipating surges before the first emergency stockout strikes
- **State-Specific Seasonality Curves**:
  - Madhya Pradesh: Central heat & monsoon surge (dengue Aug–Sep, malaria in Mandla/Balaghat).
  - Maharashtra: Mixed urban-tribal surges (winter flu Jan, monsoon dengue Aug).
  - Kerala: Dual-monsoons (Jul & Oct) with 1.5x chronic diabetes demand (Metformin & Insulin).
  - Assam: Brahmaputra flood surges (Jun–Aug) driving diarrhoeal, fever, and critical anti-snake venom spikes.
- **Dynamic Days of Cover (DoC)**: Categorized into Critical (<=3d), High (<=7d), Medium (<=14d), and Low.

### Slide 7: Algorithmic Redistribution & Distance Optimization
- **Category**: Operations Research
- **Title**: Algorithmic Redistribution & Distance Optimization
- **Subtitle**: Pairing shortage facilities with expiring surplus depots within state road networks
- **Highlights**:
  - Intra-state road distance optimization using distance matrices (`phc_distances.csv`).
  - FEFO (First Expired, First Out) priority: draws from surplus clinics expiring within 90 days.
  - Cold-chain integrity protection for insulin and anti-snake venom dispatches.
  - Human-in-the-loop governance: CMO approval required before dispatch.

### Slide 8: Data Sovereignty — Inter-State Federated Learning
- **Category**: Data Sovereignty
- **Title**: Inter-State Federated Learning Architecture
- **Subtitle**: Health is a State Subject — Absolute Data Sovereignty by Design
- **Core Principles**:
  - Constitutional alignment with Entry 6, State List (Seventh Schedule).
  - Zero raw patient or facility data crosses state boundaries.
  - Encrypted gradient aggregation: MP, MH, KL, and AS state nodes share only model parameters.
  - +18.4% model accuracy gain through collective multi-state seasonal pattern sharing.

### Slide 9: Who It Serves — Last-Mile Stakeholder Ecosystem
- **Category**: Stakeholders
- **Title**: Who It Serves: The Last-Mile Health Ecosystem
- **Subtitle**: Empowering every tier from rural ANMs to State Health Mission Directors
- **Stakeholders**:
  - Frontline Staff: 20-sec voice dispatch or camera photo replaces 45 min of typing.
  - District Officers (CMOs): Natural language Q&A co-pilot, 1-click transfer orders.
  - State Leadership (NHM): Macro-level supply heatmaps, disaster response procurement.

### Slide 10: Why It's Deployable Today
- **Category**: Deployability
- **Title**: Why It Is Deployable in India Today
- **Subtitle**: Zero hardware procurement. Zero disruption to existing physical registers.
- **Key Factors**:
  - Runs on existing frontline Android smartphones (1GB RAM, 3G/4G connectivity).
  - Physical paper ledgers remain untouched; staff write as usual.
  - Low bandwidth and offline resilient with client-side image compression.
  - District pilot can be activated within 48 hours.

### Slide 11: Scaling Across India — State → District → PHC Grid
- **Category**: National Scalability
- **Title**: Scaling Across India: State → District → PHC Grid
- **Subtitle**: From 4 pilot state nodes to all 28 States and 8 Union Territories
- **Hierarchy**:
  - Tier 1: State Warehouses (`SW-<STATE>`)
  - Tier 2: District Warehouses (`DW-<DISTRICT>`)
  - Tier 3: Primary Health Centres (`PHC-<STATE>-<ID>`)
- **API Integration**: Compatible with e-Aushadhi, DVDMS, and IHIP.

### Slide 12: Impact, Return on Investment & The Vision
- **Category**: Impact & Vision
- **Title**: A Self-Healing Public Health Grid for 1.4 Billion People
- **Subtitle**: Measurable outcomes across rural healthcare, waste elimination, and emergency readiness
- **Target Outcomes**:
  - 80%+ Reduction in preventable rural medicine stockouts.
  - 35% Elimination of expired medicine destruction.
  - 14 Days earlier outbreak notice during seasonal epidemics.
  - 100% Data sovereignty preserved across state jurisdictions.

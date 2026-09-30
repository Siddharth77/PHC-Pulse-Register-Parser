# PHC Pulse — AI Co-Pilot for National Public Health Supply Chain

## Brief Description
PHC Pulse is an AI-powered public health supply chain management co-pilot for India that provides real-time visibility into medicine stocks, bed availability, and staff attendance across Primary Health Centres (PHCs). It leverages Gemini multimodal AI, predictive demand forecasting, and inter-state federated learning to prevent stock-outs during health emergencies while preserving absolute data sovereignty.

---

## Key Features
1. **Multilingual Register Parser**: Converts photos of stock registers, voice-note dispatches (Hindi, Marathi, Malayalam, Assamese), and messy WhatsApp text into verified structured JSON while automatically stripping patient-level details.
2. **Q&A Agent & Officer Workbench**: Answers complex queries about district-level stockouts, days of cover, and risk levels (Low/Medium/High/Critical) with strict role-based access scoping.
3. **Supply Chain Copilot**: Drafts inter-facility redistribution transfer orders for district officer approval (human-in-the-loop) and generates early-warning emergency bulletins.
4. **Inter-State Federated Network**: Simulates decentralized demand forecasting and gradient aggregation across four Indian state nodes (**Madhya Pradesh, Maharashtra, Kerala, and Assam**) without exposing raw patient or facility records.
5. **Interactive Pitch Deck (12 Slides)**: Built-in presentation deck covering the problem, solution, AI architecture, stakeholder ecosystem, deployability, and national scaling strategy. See `PITCH_DECK.md` for full presentation notes.

---

## Evaluation Pitch Deck (12 Slides)
Access the interactive presentation directly from the top navigation bar (**Pitch Deck** tab) or view the raw slide notes in [`PITCH_DECK.md`](./PITCH_DECK.md):
- **Slide 1**: Executive Summary & Mission
- **Slide 2**: The Core Problem — Rural Blind Spot & Stock-Out Reality
- **Slide 3**: Current Workflow Failure — The Latency Trap of Legacy Portals
- **Slide 4**: The Solution — Frictionless Multimodal Ingestion + Grounded Intelligence
- **Slide 5**: AI Architecture — Multimodal OCR, Audio & Zero-Hallucination Parsing
- **Slide 6**: Predictive Modelling — BigQuery ML ARIMA+ & Seasonal Outbreak Forecasting
- **Slide 7**: Algorithmic Redistribution — OR-Tools Road Routing & Human-in-the-Loop Governance
- **Slide 8**: Data Sovereignty — Inter-State Federated Learning across 4 State Nodes
- **Slide 9**: Who It Serves — Last-Mile Stakeholder Ecosystem (Pharmacists, CMOs, NHM)
- **Slide 10**: Deployability — Zero New Hardware, WhatsApp/Browser Ready, Low Bandwidth
- **Slide 11**: National Scalability — State → District → PHC Grid (All 28 States & 8 UTs)
- **Slide 12**: Measurable Impact & Future Vision (80%+ stockout reduction, 35% waste reduction)

---

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons, Motion.
- **AI Engine**: Google GenAI TypeScript SDK (`@google/genai`) using `gemini-3.8-flash` for server-side register parsing, Q&A, and copilot reasoning.
- **Data & Simulation**: Python-based synthetic data generator modeling 200 PHCs across 4 states, 365 days of daily stock movements (~476k rows), state warehouses, and outbreak event scenarios.

---

## Getting Started

### 1. Generate Synthetic Data Context
To generate the local data context (`phcs.csv`, `medicines.csv`, `daily_stock.csv`, `current_snapshot.json`, etc.):
```bash
pip install numpy pandas
python generate_synthetic_data.py --out data --seed 42
```

### 2. Configure Environment Variables
Set your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm install
npm run dev
```
The applet will run on port `3000`.

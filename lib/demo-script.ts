import { UserRole } from './config';
import { NavigationViewId } from '@/components/LeftNavigation';

export interface DemoStepDefinition {
  id: number;
  title: string;
  route: NavigationViewId;
  roleRequired: UserRole;
  stateFocus?: string;
  targetSelector: string;
  caption: string;
  presenterNote: string;
  durationMs: number;
  requiresScenario?: boolean;
}

export const DEMO_STEPS: DemoStepDefinition[] = [
  {
    id: 1,
    title: '1. The Problem',
    route: 'dashboard',
    roleRequired: 'state_national_officer',
    stateFocus: 'Madhya Pradesh',
    targetSelector: '[data-demo-target="kpi-strip"]',
    caption: 'Stock-outs are a visibility problem. Here is the state at a glance.',
    presenterNote:
      'Start by showing real-time visibility across 200 PHC facilities in Madhya Pradesh. Notice reporting rates, critical stockouts, and bed availability.',
    durationMs: 18000,
  },
  {
    id: 2,
    title: '2. Early Warning',
    route: 'dashboard',
    roleRequired: 'state_national_officer',
    stateFocus: 'Madhya Pradesh',
    requiresScenario: true,
    targetSelector: '[data-demo-target="national-map"]',
    caption:
      'Proactive forecasting detects a +40% fever surge 10 days early before stock runs out.',
    presenterNote:
      'Simulate a dengue outbreak. Demand spikes 40%, immediately updating risk levels on the map and bringing critical facilities to the top of the queue.',
    durationMs: 20000,
  },
  {
    id: 3,
    title: '3. The Alert',
    route: 'alerts',
    roleRequired: 'state_national_officer',
    targetSelector: '[data-demo-target="alerts-list"]',
    caption: 'Automated early warning alert drafted with instant SMS dispatcher text.',
    presenterNote:
      'The system automatically drafts SMS and WhatsApp alerts for district officers with days-of-cover analysis and character-counted SMS templates.',
    durationMs: 18000,
  },
  {
    id: 4,
    title: '4. The Plan',
    route: 'redistribution',
    roleRequired: 'district_officer',
    targetSelector: '[data-demo-target="transfer-card-top"]',
    caption: 'Linear optimizer pairs surplus facilities with critical deficit PHCs.',
    presenterNote:
      'The optimizer calculates exact transfer quantities, showing before-and-after days of cover, transport time, and batch expiry "watch out" warnings.',
    durationMs: 20000,
  },
  {
    id: 5,
    title: '5. Human in the Loop',
    route: 'redistribution',
    roleRequired: 'district_officer',
    targetSelector: '[data-demo-target="transfer-approval-btn"]',
    caption: 'An officer approves. Nothing moves automatically.',
    presenterNote:
      'Emphasize human agency: AI suggests optimal logistics, but the District Health Officer must review and sign off before dispatch.',
    durationMs: 18000,
  },
  {
    id: 6,
    title: '6. Ask in Plain Language',
    route: 'ask',
    roleRequired: 'district_officer',
    targetSelector: '[data-demo-target="chat-response"]',
    caption: 'Ask grounded questions in natural language with verified data citations.',
    presenterNote:
      'Officers can ask conversational questions. Every answer is strictly grounded in live inventory data with zero hallucinated numbers.',
    durationMs: 20000,
  },
  {
    id: 7,
    title: '7. From the Last Mile',
    route: 'report',
    roleRequired: 'phc_staff',
    targetSelector: '[data-demo-target="report-form"]',
    caption: 'PHC staff report with a photo or a voice note, in their own language.',
    presenterNote:
      'ANMs in remote clinics take a photo of paper registers. Multimodal Gemini extracts stock levels, flagging uncertain numbers for human confirmation.',
    durationMs: 22000,
  },
  {
    id: 8,
    title: '8. Cooperation & Impact',
    route: 'impact',
    roleRequired: 'state_national_officer',
    targetSelector: '[data-demo-target="impact-headline-cards"]',
    caption: 'See it. Predict it. Move it. Together.',
    presenterNote:
      'Conclude by showing how state models improve together via privacy-preserving federated updates, reducing stock-out days by 80%.',
    durationMs: 22000,
  },
];

export const JUDGE_SUMMARY_QUESTIONS = [
  {
    question: '1. Where will we run out?',
    answer:
      'ARIMA+ demand forecasting detects stockout risks 10–14 days in advance, highlighting affected PHCs on interactive maps.',
  },
  {
    question: '2. What should we move?',
    answer:
      'Linear programming pairs surplus facilities with critical deficit PHCs, recommending exact quantities and routes.',
  },
  {
    question: '3. Who approves?',
    answer:
      'District Health Officers retain 100% human-in-the-loop control, approving generated transfer orders before dispatch.',
  },
  {
    question: '4. How do states learn together?',
    answer:
      'Privacy-preserving Federated Learning shares model gradient weights across states with zero raw patient data egress.',
  },
];

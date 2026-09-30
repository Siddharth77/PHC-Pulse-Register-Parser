'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { FederatedMetricsResponse } from '@/types/supply-chain';
import { LanguageCode, UserRole } from '@/lib/config';
import { ApiClient } from '@/lib/api-client';
import { NetworkTopologyDiagram } from './NetworkTopologyDiagram';
import { TrainingRoundController } from './TrainingRoundController';
import { StateNodeCards } from './StateNodeCards';
import { AccuracyTrendChart } from './AccuracyTrendChart';
import { StateInsightExplainer } from './StateInsightExplainer';
import { PrivacyBoundaryPanel } from './PrivacyBoundaryPanel';

interface FederatedNetworkPageProps {
  currentLanguage: LanguageCode;
  currentRole: UserRole;
}

export function FederatedNetworkPage({
  currentLanguage,
  currentRole,
}: FederatedNetworkPageProps) {
  const [data, setData] = useState<FederatedMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('Assam');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [announcement, setAnnouncement] = useState<string>('');

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await ApiClient.getFederatedMetrics();
      setData(metrics);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to federated aggregation service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setError(null);
        const metrics = await ApiClient.getFederatedMetrics();
        if (isMounted) {
          setData(metrics);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to connect to federated aggregation service');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Simulate training round with 4-step sequence animation
  const handleSimulateRound = async () => {
    if (isSimulating || !data || data.current_round >= data.total_rounds) return;

    try {
      setIsSimulating(true);
      setActiveStepIndex(0);

      // Step 1: Local Training
      await new Promise((r) => setTimeout(r, 600));
      setActiveStepIndex(1);

      // Step 2: Model Dispatch
      await new Promise((r) => setTimeout(r, 600));
      setActiveStepIndex(2);

      // Step 3: FedAvg Synthesis
      await new Promise((r) => setTimeout(r, 600));
      setActiveStepIndex(3);

      // Step 4: Global Broadcast & API update
      const updated = await ApiClient.simulateFederatedRound();
      setData(updated);

      const assamNode = updated.nodes.find((n) => n.state === 'Assam');
      const assamMape = assamNode?.mape_federated.toFixed(1) || '12.1';
      setAnnouncement(`Round ${updated.current_round} complete. Assam error improved to ${assamMape}%.`);
    } catch (err: any) {
      setError(err?.message || 'Simulation step failed');
    } finally {
      setIsSimulating(false);
      setActiveStepIndex(0);
    }
  };

  const handleResetRounds = async () => {
    try {
      setIsSimulating(true);
      const resetData = await ApiClient.resetFederatedRounds();
      setData(resetData);
      setAnnouncement('Federated training reset to Round 0.');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset training rounds');
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-center max-w-md mx-auto my-8 space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
          Federated Telemetry Unavailable
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs min-h-[44px]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Screen Reader Live Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* 1. Network Topology Diagram */}
      <div data-demo-target="federated-diagram">
        <NetworkTopologyDiagram
          nodes={data.nodes}
          currentRound={data.current_round}
          isSimulating={isSimulating}
          selectedState={selectedState}
          onSelectState={setSelectedState}
        />
      </div>

      {/* 2. Training Round Control */}
      <TrainingRoundController
        currentRound={data.current_round}
        totalRounds={data.total_rounds}
        isSimulating={isSimulating}
        activeStepIndex={activeStepIndex}
        onSimulateRound={handleSimulateRound}
        onResetRounds={handleResetRounds}
      />

      {/* 3. Per-State Cards */}
      <StateNodeCards
        nodes={data.nodes}
        selectedState={selectedState}
        onSelectState={setSelectedState}
        currentRole={currentRole}
      />

      {/* 4. Accuracy Convergence Line Chart */}
      <AccuracyTrendChart
        history={data.history}
        selectedState={selectedState}
      />

      {/* 5. "What Did This State Learn?" Explainer */}
      <StateInsightExplainer
        nodes={data.nodes}
        selectedState={selectedState}
        onSelectState={setSelectedState}
      />

      {/* 6. Privacy & Data Sovereignty Boundary Panel */}
      <PrivacyBoundaryPanel
        sharedItems={data.shared_items}
        neverSharedItems={data.never_shared_items}
      />
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scenarioStore, applyScenarioToRecords } from '@/lib/scenario-state';
import { OutbreakScenarioParams, OutbreakScenarioResult, KpiSummary, SnapshotRecord, PhcMaster } from '@/types/supply-chain';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }

    if (action === 'reset' || body.reset) {
      scenarioStore.activeScenario = null;
      scenarioStore.params = null;
      return NextResponse.json({ success: true, message: 'Scenario reset to live baseline', is_active: false });
    }

    const params: OutbreakScenarioParams = {
      disease_class: body.disease_class || 'fever_vector',
      states: body.states || ['All'],
      districts: body.districts || ['All'],
      demand_increase_pct: Number(body.demand_increase_pct) || 40,
      horizon_days: Number(body.horizon_days) || 10,
    };

    // Load mock baseline snapshot
    const dataDir = path.resolve('./data');
    const snapshotPath = path.join(dataDir, 'current_snapshot.json');
    const phcsPath = path.join(dataDir, 'phcs.json');

    if (!fs.existsSync(snapshotPath) || !fs.existsSync(phcsPath)) {
      return NextResponse.json({ error: 'Baseline snapshot not found' }, { status: 404 });
    }

    const snapshotRaw = fs.readFileSync(snapshotPath, 'utf-8');
    const phcsRaw = fs.readFileSync(phcsPath, 'utf-8');

    const snapshotData = JSON.parse(snapshotRaw);
    const phcs: PhcMaster[] = JSON.parse(phcsRaw);
    const baselineRecords: SnapshotRecord[] = snapshotData.records || [];

    // Apply scenario multiplier in the mock API layer
    const { records: adjustedRecords, criticalIncreaseCount, affectedPhcIds } =
      applyScenarioToRecords(baselineRecords, params);

    // Compute updated KPIs
    const reportingPhcIds = new Set(adjustedRecords.map((r) => r.phc_id));
    const reportingCount = reportingPhcIds.size;
    const totalPhcs = phcs.length;
    const reportingPct = Math.round((reportingCount / totalPhcs) * 100);

    const criticalCount = adjustedRecords.filter((r) => r.days_of_cover <= 3.0).length;

    const expiringSurplusCount = adjustedRecords.filter(
      (r) => r.nearest_expiry && r.nearest_expiry <= "2026-12-31" && r.days_of_cover > 14
    ).length;

    const bedsAvailable = adjustedRecords.reduce((acc, r) => acc + (r.beds_available || 0), 0);
    const totalBeds = adjustedRecords.reduce((acc, r) => acc + (r.total_beds || 6), 0);
    const bedsPct = totalBeds > 0 ? Math.round((bedsAvailable / totalBeds) * 100) : 55;

    const staffPresent = adjustedRecords.reduce((acc, r) => acc + (r.staff_present || 0), 0);
    const staffSanctioned = adjustedRecords.reduce((acc, r) => acc + (r.staff_sanctioned || 5), 0);
    const staffPct = staffSanctioned > 0 ? Math.round((staffPresent / staffSanctioned) * 100) : 85;

    const updatedKpi: KpiSummary = {
      phcs_reporting_today: reportingCount,
      total_phcs: totalPhcs,
      reporting_percentage: reportingPct,
      critical_stockouts_count: criticalCount,
      expiring_surplus_batches: expiringSurplusCount,
      beds_available_count: bedsAvailable,
      total_beds_count: totalBeds,
      beds_available_percentage: bedsPct,
      staff_present_count: staffPresent,
      total_staff_sanctioned: staffSanctioned,
      staff_attendance_percentage: staffPct,
    };

    const diseaseLabelMap: Record<string, string> = {
      fever_vector: 'fever & dengue',
      diarrhoeal: 'diarrhoeal & enteric',
      respiratory: 'respiratory infection',
      chronic_metabolic: 'diabetes/chronic',
      emergency_trauma: 'snakebite & trauma',
    };

    const targetArea =
      params.states && !params.states.includes('All')
        ? params.states.join(', ')
        : 'All 4 State Nodes';

    const result: OutbreakScenarioResult = {
      scenario_id: `SCN-${Date.now().toString().slice(-4)}`,
      is_active: true,
      title: `Simulated Outbreak: +${params.demand_increase_pct}% ${diseaseLabelMap[params.disease_class] || params.disease_class} surge in ${targetArea}`,
      description: `Projected outbreak scenario over ${params.horizon_days} days. Daily demand elevated by ${params.demand_increase_pct}%.`,
      projected_surge_label: `Projected: +${params.demand_increase_pct}% ${diseaseLabelMap[params.disease_class] || params.disease_class} in ${params.horizon_days} days`,
      updated_kpi: updatedKpi,
      critical_increase_count: criticalIncreaseCount,
      affected_phc_ids: affectedPhcIds,
    };

    scenarioStore.activeScenario = result;
    scenarioStore.params = params;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error executing outbreak scenario:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    activeScenario: scenarioStore.activeScenario,
    params: scenarioStore.params,
  });
}

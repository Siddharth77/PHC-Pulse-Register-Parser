import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { scenarioStore, applyScenarioToRecords } from '@/lib/scenario-state';
import { SnapshotRecord, PhcMaster, KpiSummary } from '@/types/supply-chain';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const medicine = searchParams.get('medicine');
    const diseaseClass = searchParams.get('disease_class');
    const riskLevel = searchParams.get('risk_level');
    const search = searchParams.get('search');

    const dataDir = path.resolve('./data');
    const snapshotPath = path.join(dataDir, 'current_snapshot.json');
    const phcsPath = path.join(dataDir, 'phcs.json');

    if (!fs.existsSync(snapshotPath) || !fs.existsSync(phcsPath)) {
      return NextResponse.json({ error: 'Mock data files not found' }, { status: 404 });
    }

    const snapshotRaw = fs.readFileSync(snapshotPath, 'utf-8');
    const phcsRaw = fs.readFileSync(phcsPath, 'utf-8');

    const snapshotData = JSON.parse(snapshotRaw);
    const phcs: PhcMaster[] = JSON.parse(phcsRaw);
    let records: SnapshotRecord[] = snapshotData.records || [];

    // If a scenario is active, apply the multiplier inside the mock API layer
    if (scenarioStore.params) {
      const adjusted = applyScenarioToRecords(records, scenarioStore.params);
      records = adjusted.records;
    }

    // Filter logic
    if (state && state !== 'All') {
      records = records.filter((r) => r.state.toLowerCase() === state.toLowerCase());
    }
    if (district && district !== 'All') {
      records = records.filter((r) => r.district.toLowerCase() === district.toLowerCase());
    }
    if (medicine && medicine !== 'All') {
      records = records.filter((r) => r.medicine.toLowerCase().includes(medicine.toLowerCase()));
    }
    if (diseaseClass && diseaseClass !== 'All') {
      records = records.filter((r) => r.disease_class === diseaseClass);
    }
    if (riskLevel && riskLevel !== 'All') {
      records = records.filter((r) => r.risk_level === riskLevel);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.phc_name.toLowerCase().includes(q) ||
          r.phc_id.toLowerCase().includes(q) ||
          r.medicine.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q)
      );
    }

    // Compute dynamic KPI
    const reportingPhcIds = new Set(records.map((r) => r.phc_id));
    const reportingCount = reportingPhcIds.size;
    const totalPhcs = phcs.length;
    const reportingPct = Math.round((reportingCount / totalPhcs) * 100);

    const criticalCount = records.filter((r) => r.days_of_cover <= 3.0).length;

    // Expiring surplus within 90 days (< 2026-12-31 and stock > 500)
    const expiringSurplusCount = records.filter(
      (r) => r.nearest_expiry && r.nearest_expiry <= "2026-12-31" && r.days_of_cover > 14
    ).length;

    const bedsAvailable = records.reduce((acc, r) => acc + (r.beds_available || 0), 0);
    const totalBeds = records.reduce((acc, r) => acc + (r.total_beds || 6), 0);
    const bedsPct = totalBeds > 0 ? Math.round((bedsAvailable / totalBeds) * 100) : 55;

    const staffPresent = records.reduce((acc, r) => acc + (r.staff_present || 0), 0);
    const staffSanctioned = records.reduce((acc, r) => acc + (r.staff_sanctioned || 5), 0);
    const staffPct = staffSanctioned > 0 ? Math.round((staffPresent / staffSanctioned) * 100) : 85;

    const kpi: KpiSummary = {
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

    return NextResponse.json({
      as_of: snapshotData.as_of,
      records,
      kpi,
      phc_masters: phcs,
      active_scenario: scenarioStore.activeScenario,
    });
  } catch (error: any) {
    console.error('Error serving snapshot data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

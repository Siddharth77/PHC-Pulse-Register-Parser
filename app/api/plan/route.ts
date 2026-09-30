import { NextRequest, NextResponse } from 'next/server';
import { planStore, generateRedistributionPlan, computePlanSummary } from '@/lib/plan-store';
import { TransferPlanItem, TransferActivityLog } from '@/types/supply-chain';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const district = searchParams.get('district');
    const state = searchParams.get('state');

    let transfers = [...planStore.transfers];

    // Role-based filtering rules:
    // 1. PHC Staff: restricted
    if (role === 'phc_staff') {
      return NextResponse.json({
        restricted: true,
        message: 'Redistribution planning is restricted to District and State Officers.',
        transfers: [],
        summary: computePlanSummary([]),
      });
    }

    // 2. District Officer: see only transfers within their district
    if (role === 'district_officer') {
      const targetDistrict = district && district !== 'All' ? district.toLowerCase() : 'dewas';
      transfers = transfers.filter(
        (t) =>
          t.from_district.toLowerCase() === targetDistrict ||
          t.to_district.toLowerCase() === targetDistrict
      );
    } else if (state && state !== 'All') {
      transfers = transfers.filter((t) => t.state.toLowerCase() === state.toLowerCase());
    }

    const summary = computePlanSummary(transfers);

    return NextResponse.json({
      plan_id: planStore.planId,
      generated_at: planStore.generatedAt,
      transfers,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching redistribution plan:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }

    const { action, role, district, state, approverName } = body;

    // Action: Approve all Critical & High
    if (action === 'approve_all') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const approver = approverName || 'District Chief Medical Officer';
      let approvedCount = 0;

      planStore.transfers = planStore.transfers.map((t) => {
        if (
          (t.urgency === 'Critical' || t.urgency === 'High') &&
          t.status === 'PENDING_APPROVAL'
        ) {
          approvedCount++;
          const logItem: TransferActivityLog = {
            id: `LOG-${Date.now()}-${t.id}`,
            action: 'APPROVED',
            actor: approver,
            timestamp: `Today, ${nowTime}`,
            note: 'Bulk approved via "Approve All Critical/High" one-tap command.',
          };

          planStore.activityHistory.unshift(logItem);

          return {
            ...t,
            status: 'APPROVED',
            approved_at: `Today, ${nowTime}`,
            approved_by: approver,
            activity_logs: [logItem, ...(t.activity_logs || [])],
          };
        }
        return t;
      });

      return NextResponse.json({
        success: true,
        message: `Successfully approved ${approvedCount} Critical and High priority transfers.`,
        plan_id: planStore.planId,
        transfers: planStore.transfers,
        summary: computePlanSummary(planStore.transfers),
      });
    }

    // Default POST: Generate / re-optimize redistribution plan
    const generated = generateRedistributionPlan();
    return NextResponse.json({
      plan_id: generated.planId,
      generated_at: planStore.generatedAt,
      transfers: generated.transfers,
      summary: generated.summary,
    });
  } catch (error: any) {
    console.error('Error in plan API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

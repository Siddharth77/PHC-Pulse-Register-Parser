import { NextRequest, NextResponse } from 'next/server';
import { planStore, computePlanSummary } from '@/lib/plan-store';
import { TransferActivityLog } from '@/types/supply-chain';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }

    const approverName = body.officerName || 'District Chief Medical Officer';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const transfer = planStore.transfers.find((t) => t.id === id);
    if (!transfer) {
      return NextResponse.json({ error: `Transfer order ${id} not found` }, { status: 404 });
    }

    transfer.status = 'APPROVED';
    transfer.approved_at = `Today, ${nowTime}`;
    transfer.approved_by = approverName;

    const logItem: TransferActivityLog = {
      id: `LOG-${Date.now()}`,
      action: 'APPROVED',
      actor: approverName,
      timestamp: `Today, ${nowTime}`,
      note: `Transfer approved and authorized for road dispatch.`,
    };

    transfer.activity_logs = [logItem, ...(transfer.activity_logs || [])];
    planStore.activityHistory.unshift(logItem);

    return NextResponse.json({
      success: true,
      transfer,
      summary: computePlanSummary(planStore.transfers),
    });
  } catch (error: any) {
    console.error('Error approving transfer:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

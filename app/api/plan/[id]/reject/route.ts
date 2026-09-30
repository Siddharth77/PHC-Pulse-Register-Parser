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

    const rejectionReason = body.reason || 'Declined by district health officer upon review';
    const officerName = body.officerName || 'District Chief Medical Officer';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const transfer = planStore.transfers.find((t) => t.id === id);
    if (!transfer) {
      return NextResponse.json({ error: `Transfer order ${id} not found` }, { status: 404 });
    }

    transfer.status = 'REJECTED';
    transfer.rejection_reason = rejectionReason;

    const logItem: TransferActivityLog = {
      id: `LOG-${Date.now()}`,
      action: 'REJECTED',
      actor: officerName,
      timestamp: `Today, ${nowTime}`,
      note: `Transfer rejected: ${rejectionReason}`,
    };

    transfer.activity_logs = [logItem, ...(transfer.activity_logs || [])];
    planStore.activityHistory.unshift(logItem);

    return NextResponse.json({
      success: true,
      transfer,
      summary: computePlanSummary(planStore.transfers),
    });
  } catch (error: any) {
    console.error('Error rejecting transfer:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

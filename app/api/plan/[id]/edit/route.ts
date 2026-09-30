import { NextRequest, NextResponse } from 'next/server';
import { planStore, computePlanSummary } from '@/lib/plan-store';
import { TransferActivityLog } from '@/types/supply-chain';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const newQuantity = Number(body.newQuantity);
    const officerName = body.officerName || 'District Chief Medical Officer';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!newQuantity || newQuantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
    }

    const transfer = planStore.transfers.find((t) => t.id === id);
    if (!transfer) {
      return NextResponse.json({ error: `Transfer order ${id} not found` }, { status: 404 });
    }

    const oldQty = transfer.quantity;
    const ratio = newQuantity / (oldQty || 1);

    // Calculate updated before/after numbers
    const sourceDeltaDoc = (transfer.from_days_before - transfer.from_days_after) * ratio;
    const newFromDaysAfter = Number(Math.max(1.0, transfer.from_days_before - sourceDeltaDoc).toFixed(1));

    const destDeltaDoc = (transfer.to_days_after - transfer.to_days_before) * ratio;
    const newToDaysAfter = Number((transfer.to_days_before + destDeltaDoc).toFixed(1));

    // Safety checks
    const warnings: string[] = [];
    if (newFromDaysAfter < 7.0) {
      warnings.push(`Caution: Source facility (${transfer.from_name}) will be left with only ${newFromDaysAfter} days of cover (below 7-day safe buffer threshold).`);
    }

    transfer.quantity = newQuantity;
    transfer.from_days_after = newFromDaysAfter;
    transfer.to_days_after = newToDaysAfter;
    transfer.one_line_reason = `Adjusted order: Reallocates ${newQuantity.toLocaleString()} ${transfer.unit} from ${transfer.from_name} to ${transfer.to_name}. Source retains ${newFromDaysAfter}d cover; destination gains ${newToDaysAfter}d buffer.`;

    const logItem: TransferActivityLog = {
      id: `LOG-${Date.now()}`,
      action: 'EDITED',
      actor: officerName,
      timestamp: `Today, ${nowTime}`,
      note: `Quantity modified from ${oldQty.toLocaleString()} to ${newQuantity.toLocaleString()} ${transfer.unit}.`,
    };

    transfer.activity_logs = [logItem, ...(transfer.activity_logs || [])];
    planStore.activityHistory.unshift(logItem);

    return NextResponse.json({
      success: true,
      transfer,
      warnings,
      summary: computePlanSummary(planStore.transfers),
    });
  } catch (error: any) {
    console.error('Error editing transfer quantity:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

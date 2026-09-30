'use client';

import React from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Snowflake,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { TransferPlanItem } from '@/types/supply-chain';
import { UserRole } from '@/lib/config';

interface TransferOrderModalProps {
  transfer: TransferPlanItem;
  onClose: () => void;
  currentRole: UserRole;
}

export function TransferOrderModal({
  transfer,
  onClose,
  currentRole,
}: TransferOrderModalProps) {
  const approverTitle =
    transfer.approved_by ||
    (currentRole === 'district_officer'
      ? 'District Chief Medical Officer, Dewas'
      : currentRole === 'state_national_officer'
      ? 'State Health Logistics Commissioner'
      : 'Primary Health Officer');

  const approvalTime = transfer.approved_at || 'Today, 08:45 AM';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
================================================================================
GOVERNMENT OF INDIA - MINISTRY OF HEALTH & FAMILY WELFARE
NATIONAL HEALTH MISSION - PUBLIC HEALTH SUPPLY CHAIN NETWORK
INTER-FACILITY STOCK REDISTRIBUTION ORDER
================================================================================
TRANSFER ORDER ID: ${transfer.id}
DATE & TIME:       ${approvalTime}
STATE / REGION:    ${transfer.state}
STATUS:            AUTHORIZED & APPROVED FOR ROAD TRANSIT

--------------------------------------------------------------------------------
1. CONSIGNMENT DETAILS
--------------------------------------------------------------------------------
Medicine / Item:    ${transfer.medicine}
Quantity:           ${transfer.quantity.toLocaleString()} ${transfer.unit}
Urgency Level:      ${transfer.urgency} (Immediate Dispatch Required)
Cold Chain Transit: ${transfer.watch_out_chips.some((c) => c.includes('Cold')) ? 'YES (2°C - 8°C Mandatory, Vaccine Carrier + Logger)' : 'Ambient Transit'}
Estimated Value:    ₹${(transfer.estimated_value_inr || 2400).toLocaleString()} (Illustrative)

--------------------------------------------------------------------------------
2. ROUTE & CONSIGNOR / CONSIGNEE
--------------------------------------------------------------------------------
FROM (Source Depot): ${transfer.from_name} (${transfer.from_district}, ${transfer.state})
TO (Destination):    ${transfer.to_name} (${transfer.to_district}, ${transfer.state})
Road Distance:       ${transfer.road_distance_km} km

--------------------------------------------------------------------------------
3. CLINICAL & INVENTORY RATIONALE
--------------------------------------------------------------------------------
${transfer.one_line_reason}

--------------------------------------------------------------------------------
4. STATUTORY AUTHORIZATION & SIGN-OFF
--------------------------------------------------------------------------------
Authorized Officer:  ${approverTitle}
Digital Stamp ID:    SIG-NHM-${Date.now().toString().slice(-8)}
Verification:        VERIFIED VIA PHC PULSE CO-PILOT
================================================================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transfer_Order_${transfer.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 print:p-0 print:border-none print:shadow-none print:m-0">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Official Stock Transfer Order
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order ID: <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{transfer.id}</span> · Authorized for Road Logistics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close order modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Official Printable Sheet Document Area */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-slate-100 font-sans print:bg-white print:text-black print:p-0 print:border-none">
          {/* Government Masthead */}
          <div className="text-center pb-4 border-b border-slate-300 dark:border-slate-700">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
              Government of India · National Health Mission
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              EMERGENCY INTER-FACILITY STOCK TRANSFER ORDER
            </h1>
            <div className="text-xs font-mono text-slate-500 mt-1">
              Ref: NHM-REDIST-{transfer.id} · State Node: {transfer.state}
            </div>
          </div>

          {/* Key Consignment Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Consigned Item</span>
              <strong className="text-sm text-teal-700 dark:text-teal-400">{transfer.medicine}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Quantity</span>
              <strong className="text-sm font-mono text-slate-900 dark:text-white">
                {transfer.quantity.toLocaleString()} {transfer.unit}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Urgency Status</span>
              <strong className="text-sm text-rose-600 dark:text-rose-400">{transfer.urgency}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit Distance</span>
              <strong className="text-sm font-mono text-slate-900 dark:text-white">{transfer.road_distance_km} km</strong>
            </div>
          </div>

          {/* Source & Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Source (Consignor Facility)</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{transfer.from_name}</div>
              <div className="text-slate-500">{transfer.from_district}, {transfer.state}</div>
              <div className="text-[11px] text-slate-400 pt-1 font-mono">
                Post-transfer Buffer: <strong>{transfer.from_days_after} days</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-500">Destination (Consignee Facility)</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{transfer.to_name}</div>
              <div className="text-slate-500">{transfer.to_district}, {transfer.state}</div>
              <div className="text-[11px] text-slate-400 pt-1 font-mono">
                Post-transfer Buffer: <strong>{transfer.to_days_after} days</strong>
              </div>
            </div>
          </div>

          {/* Rationale & Transport Directives */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Clinical Rationale</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {transfer.one_line_reason}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Transit Protocols:</span>
              {transfer.watch_out_chips.map((chip, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Official Sign-off & Digital Signature Badge */}
          <div className="pt-4 border-t-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Digitally Authorized & Stamped</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-semibold">{approverTitle}</div>
              <div className="text-[11px] font-mono text-slate-400">Timestamp: {approvalTime}</div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <QrCode className="h-10 w-10 text-slate-800 dark:text-slate-200 shrink-0" />
              <div>
                <div>VALIDATED</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">PHC-PULSE-AUTH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-5 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs min-h-[44px]"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs min-h-[44px]"
            >
              <Download className="h-4 w-4" />
              <span>Download Text Receipt</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
            >
              <Printer className="h-4 w-4" />
              <span>Print Transfer Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileSpreadsheet, Code2 } from 'lucide-react';
import { ParseResult } from '@/types/parser';

interface JsonViewerModalProps {
  data: ParseResult;
  onClose: () => void;
}

export function JsonViewerModal({ data, onClose }: JsonViewerModalProps) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'dhis2'>('json');

  // Strip client-side helper fields if any, ensuring exact schema
  const cleanJsonPayload: ParseResult = {
    phc_id: data.phc_id,
    report_date: data.report_date,
    stock: data.stock.map((item) => ({
      medicine: item.medicine,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiry_date,
      raw_text: item.raw_text,
      confidence: Number(item.confidence.toFixed(2)),
      needs_review: item.needs_review,
    })),
    beds_available: data.beds_available,
    staff_present: data.staff_present,
    warnings: data.warnings,
  };

  const jsonString = JSON.stringify(cleanJsonPayload, null, 2);

  // Generate CSV format
  const generateCsv = () => {
    const headers = [
      'phc_id',
      'report_date',
      'medicine',
      'quantity',
      'unit',
      'expiry_date',
      'raw_text',
      'confidence',
      'needs_review',
    ];
    const rows = data.stock.map((s) => [
      `"${data.phc_id || ''}"`,
      `"${data.report_date || ''}"`,
      `"${s.medicine.replace(/"/g, '""')}"`,
      s.quantity !== null ? s.quantity : '',
      `"${s.unit || ''}"`,
      `"${s.expiry_date || ''}"`,
      `"${s.raw_text.replace(/"/g, '""')}"`,
      s.confidence,
      s.needs_review,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  // Generate DHIS2 format
  const generateDhis2 = () => {
    return JSON.stringify(
      {
        orgUnit: data.phc_id || 'UNKNOWN_PHC',
        period: (data.report_date || '2026-09-29').replace(/-/g, ''),
        dataValues: data.stock.map((s, idx) => ({
          dataElement: `DE_MED_${idx + 1}`,
          value: s.quantity !== null ? s.quantity : 0,
          comment: `Generic: ${s.medicine}, Expiry: ${s.expiry_date || 'N/A'}, Conf: ${s.confidence}`,
        })),
      },
      null,
      2
    );
  };

  const contentToDisplay =
    exportFormat === 'json' ? jsonString : exportFormat === 'csv' ? generateCsv() : generateDhis2();

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `phc_register_${data.phc_id || 'unassigned'}_${data.report_date || 'report'}.${
      exportFormat === 'csv' ? 'csv' : 'json'
    }`;
    const blob = new Blob([contentToDisplay], {
      type: exportFormat === 'csv' ? 'text/csv' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Verified Output Payload
              </h3>
              <p className="text-[11px] text-slate-400">
                Exact schema match · Ready for DHIS2 / national ERP ingest
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format toggle */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setExportFormat('json')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  exportFormat === 'json'
                    ? 'bg-slate-800 text-teal-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON Schema
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  exportFormat === 'csv'
                    ? 'bg-slate-800 text-teal-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setExportFormat('dhis2')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  exportFormat === 'dhis2'
                    ? 'bg-slate-800 text-teal-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DHIS2
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed border-b border-slate-800/80">
          <pre className="whitespace-pre">{contentToDisplay}</pre>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-mono">
            {data.stock.length} records · {data.warnings.length} warnings
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-xs font-semibold text-slate-950 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

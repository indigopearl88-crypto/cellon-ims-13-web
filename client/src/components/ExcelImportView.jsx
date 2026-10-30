import React, { useState } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ExcelImportView() {
  const [pastedData, setPastedData] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const handleProcessImport = async () => {
    if (!pastedData.trim()) {
      alert('Please paste IMEI lines or data into the box.');
      return;
    }

    setIsProcessing(true);
    const lines = pastedData.trim().split('\n');
    const items = [];

    for (let line of lines) {
      const parts = line.split(/[,\t]+/).map(p => p.trim());
      if (parts.length > 0 && parts[0].length >= 10) {
        items.push({
          mobNo: parts[0],
          itemId: 1, // Default iPhone / Handset
          purchasePrice: parseFloat(parts[1] || 100000),
          salePrice: parseFloat(parts[2] || 105000),
          warrantyId: 1,
          locationId: 1
        });
      }
    }

    if (items.length === 0) {
      alert('No valid 15-digit IMEIs recognized.');
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierAccountId: selectedSupplierId,
          refNo: 'EXCEL-IMPORT-' + Date.now().toString().slice(-4),
          items
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImportSummary({
        success: true,
        count: items.length,
        billNo: data.billNo
      });
      setPastedData('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto text-xs">
      <div className="win-bevel p-2 bg-[#F0EDE0] flex items-center justify-between border-b border-[#ACA899]">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
          <span className="font-bold text-sm text-[#0A246A]">Bulk Excel / CSV IMEI Importer (IMPORT_FROM_PURCHASE.xlsx)</span>
        </div>
        <span className="text-gray-500 text-[11px]">Wholesale Batch Receiving</span>
      </div>

      <div className="win-bevel p-3 bg-white space-y-3">
        <p className="text-gray-700">
          Paste high-volume IMEI numbers directly from <strong>Excel</strong>, <strong>WhatsApp invoices</strong>, or supplier files.
          Format: <code>IMEI, CostPrice, SalePrice</code> (or simply one 15-digit IMEI per line).
        </p>

        <textarea
          rows={10}
          value={pastedData}
          onChange={(e) => setPastedData(e.target.value)}
          placeholder={`Paste Excel columns or IMEIs here, example:\n358742110984991, 120000, 126000\n358742110984992, 120000, 126000\n358742110984993, 120000, 126000`}
          className="win-input w-full font-mono text-xs leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-gray-500 font-medium">
            Lines entered: {pastedData.trim() ? pastedData.trim().split('\n').length : 0}
          </span>

          <button
            onClick={handleProcessImport}
            disabled={isProcessing || !pastedData.trim()}
            className="win-button py-2 px-6 bg-emerald-700 text-white font-bold flex items-center space-x-2 hover:bg-emerald-800 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Importing...' : 'Batch Import IMEIs into Stock'}</span>
          </button>
        </div>
      </div>

      {importSummary && (
        <div className="win-bevel p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Batch Import Complete!</p>
            <p className="text-xs">
              Successfully imported <strong>{importSummary.count} Handsets</strong> into live inventory under Purchase Bill #{importSummary.billNo}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

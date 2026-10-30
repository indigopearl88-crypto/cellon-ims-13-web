import React, { useState, useEffect } from 'react';
import { Printer, X, FileText, Smartphone, Send, Download } from 'lucide-react';

export default function CrystalPrintModal({ billNo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printFormat, setPrintFormat] = useState('full'); // 'full' (A4) or 'thermal' (80mm)

  useEffect(() => {
    if (!billNo) return;
    setLoading(true);
    fetch(`/api/sales/${billNo}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [billNo]);

  if (!billNo) return null;

  const handleShareWhatsapp = () => {
    if (!data || !data.sale) return;
    const phone = data.sale.CustomerPhone || data.sale.NicNo || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone || '923000000000');

    let msg = `*HAMZA PHONE STORE - OFFICIAL SALE BILL*\n`;
    msg += `Bill No: SI-${data.sale.BillNo}\n`;
    msg += `Date: ${data.sale.Date} ${data.sale.BillTime || ''}\n`;
    msg += `Customer: ${data.sale.CustomerName || 'Walk-In Customer'}\n`;
    msg += `--------------------------------\n`;
    data.items?.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.ModelName}*\n   IMEI: \`${it.MobNo}\`\n   Warranty: ${it.WarrantyName || 'Official'}\n   Price: Rs. ${it.Price.toLocaleString()}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*Net Payable: Rs. ${data.sale.NetTotal.toLocaleString()}*\n`;
    msg += `Cash Received: Rs. ${data.sale.CashReceived?.toLocaleString() || data.sale.NetTotal.toLocaleString()}\n`;
    msg += `--------------------------------\n`;
    msg += `Software: BitDev Enterprise ERP\n`;
    msg += `Thank you for choosing HAMZA PHONE STORE!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 overflow-y-auto select-none backdrop-blur-xs">
      <div className="bg-white win-window-frame w-full max-w-4xl shadow-2xl overflow-hidden my-auto border-4 border-[#808080]">
        {/* Crystal Reports Viewer Toolbar (Authentic Crystal Reports 8.5/XI UI) */}
        <div className="no-print h-9 bg-gradient-to-r from-[#0A246A] via-[#2A5C99] to-[#76A5D9] text-white flex items-center justify-between px-3 text-xs font-bold border-b border-[#000080]">
          <div className="flex items-center space-x-2">
            <img src="/icons/cellonx.ico" alt="" className="w-4 h-4 object-contain" />
            <span>Crystal Reports Viewer - [rptSaleBillFull.rpt]</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Format Selector */}
            <div className="bg-[#ECE9D8] text-black px-1.5 py-0.5 win-bevel-sunken flex items-center space-x-1 text-[11px]">
              <span className="font-bold text-gray-700">Format:</span>
              <button
                onClick={() => setPrintFormat('full')}
                className={`px-1.5 py-0.5 font-bold ${printFormat === 'full' ? 'bg-[#0A246A] text-white' : 'hover:bg-gray-200'}`}
              >
                A4 Full Bill
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-1.5 py-0.5 font-bold ${printFormat === 'thermal' ? 'bg-[#0A246A] text-white' : 'hover:bg-gray-200'}`}
              >
                80mm Thermal
              </button>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsapp}
              className="win-btn py-0.5 px-2 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center space-x-1"
              title="Share Bill via WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="win-btn py-0.5 px-3 bg-white text-black font-bold flex items-center space-x-1 hover:brightness-105"
            >
              <Printer className="w-3.5 h-3.5 text-blue-800" />
              <span>Print (Ctrl+P)</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="win-titlebar-btn hover:bg-red-600 hover:text-white"
              title="Close Report"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Viewer Paper Canvas */}
        <div className="p-4 bg-[#606060] overflow-auto max-h-[85vh] flex justify-center">
          {loading ? (
            <div className="text-center py-24 text-white font-bold text-sm">
              Rendering Crystal Report [rptSaleBillFull.rpt]...
            </div>
          ) : !data || !data.sale ? (
            <div className="text-center py-24 text-red-300 font-bold">Failed to load invoice #{billNo}</div>
          ) : printFormat === 'thermal' ? (
            /* 80mm Thermal Receipt Layout */
            <div className="bg-white p-4 w-[320px] shadow-2xl text-black font-mono text-[11px] leading-tight border border-black" id="printable-thermal">
              <div className="text-center border-b border-dashed border-black pb-2 mb-2">
                <img src="/icons/toheedsoft-logo.png" alt="" className="h-6 mx-auto mb-1 opacity-85" />
                <h2 className="text-sm font-black uppercase tracking-wider">{data.company?.Name || 'HAMZA PHONE STORE'}</h2>
                <p className="text-[10px]">{data.company?.Address}</p>
                <p className="text-[10px]">Ph: {data.company?.Phone}</p>
                <p className="font-bold uppercase text-[10px] mt-1 border-t border-b border-black py-0.5">
                  POS RETAIL CASH BILL
                </p>
              </div>

              <div className="space-y-0.5 text-[10px] border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Bill #: SI-{data.sale.BillNo}</span>
                  <span>Date: {data.sale.Date}</span>
                </div>
                <div>Customer: {data.sale.CustomerName || 'Walk-In'}</div>
                {data.sale.CustomerPhone && <div>Mobile: {data.sale.CustomerPhone}</div>}
                <div>Salesman: Administrator</div>
              </div>

              {/* Items */}
              <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1.5">
                <div className="font-bold flex justify-between border-b border-black pb-0.5 text-[10px]">
                  <span>ITEM / 15-DIGIT IMEI</span>
                  <span>AMOUNT</span>
                </div>
                {data.items?.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-[11px]">{it.ModelName}</div>
                    <div className="flex justify-between text-[10px]">
                      <span className="font-mono text-gray-700">IMEI: {it.MobNo}</span>
                      <span className="font-bold">Rs. {it.Price.toLocaleString()}</span>
                    </div>
                    <div className="text-[9px] text-gray-500">Warranty: {it.WarrantyName}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-1 text-right text-[11px] border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Gross Value:</span>
                  <span>Rs. {data.sale.NetTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-xs border-t border-black pt-1">
                  <span>NET TOTAL:</span>
                  <span>Rs. {data.sale.NetTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Cash Tendered:</span>
                  <span>Rs. {data.sale.CashReceived?.toLocaleString() || data.sale.NetTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div className="text-center pt-1 space-y-1">
                <div className="font-mono font-bold text-xs tracking-widest bg-gray-100 py-1 border border-black">
                  *SI{data.sale.BillNo}*
                </div>
                <p className="text-[9px] text-gray-700">Items once sold cannot be returned without warranty seal.</p>
                <div className="text-[9px] font-bold text-gray-600 border-t border-gray-400 pt-1">
                  Powered by BitDev Enterprise ERP
                </div>
              </div>
            </div>
          ) : (
            /* Standard A4 Full Sheet Bill Layout (rptSaleBillFull.rpt) */
            <div className="bg-white p-8 w-[720px] shadow-2xl text-black font-sans text-xs border border-gray-400" id="printable-full">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-black tracking-wider uppercase text-[#0A246A]">
                    {data.company?.Name || 'HAMZA PHONE STORE'}
                  </h1>
                  <p className="text-xs text-gray-800">{data.company?.Address}</p>
                  <p className="text-xs text-gray-800">Phone: {data.company?.Phone} • Mobile Handset Wholesale & Retail</p>
                </div>
                <div className="text-right space-y-1">
                  <img src="/icons/toheedsoft-logo.png" alt="Toheed Soft" className="h-8 ml-auto opacity-85 object-contain" />
                  <div className="border border-black px-3 py-0.5 font-bold uppercase text-[10px] bg-gray-100">
                    TAX / RETAIL INVOICE
                  </div>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-2.5 border border-gray-300 mt-3">
                <div className="space-y-1">
                  <div><strong>Invoice #: </strong> <span className="font-mono text-sm font-bold text-red-700">SI-{data.sale.BillNo}</span></div>
                  <div><strong>Invoice Date: </strong> {data.sale.Date} {data.sale.BillTime || ''}</div>
                  <div><strong>Salesperson / Counter: </strong> Administrator (Counter 1)</div>
                </div>

                <div className="space-y-1">
                  <div><strong>Customer Name: </strong> <span className="font-bold">{data.sale.CustomerName || 'Walk-In Customer'}</span></div>
                  <div><strong>CNIC / Mobile: </strong> <span className="font-mono">{data.sale.CustomerPhone || data.sale.NicNo || 'N/A'}</span></div>
                  <div><strong>Account Status: </strong> Registered Market Party</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border border-black border-collapse text-left text-xs mt-3">
                <thead>
                  <tr className="bg-gray-200 border-b border-black font-bold">
                    <th className="p-1.5 border-r border-black w-8 text-center">Sr#</th>
                    <th className="p-1.5 border-r border-black">Handset Model Description</th>
                    <th className="p-1.5 border-r border-black w-48">15-Digit IMEI Serial</th>
                    <th className="p-1.5 border-r border-black w-36">Warranty Status</th>
                    <th className="p-1.5 text-right w-28">Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((it, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="p-1.5 border-r border-black text-center font-bold text-gray-600">{idx + 1}</td>
                      <td className="p-1.5 border-r border-black font-bold">{it.ModelName}</td>
                      <td className="p-1.5 border-r border-black font-mono font-bold text-blue-900">{it.MobNo}</td>
                      <td className="p-1.5 border-r border-black text-gray-700 text-[11px]">{it.WarrantyName}</td>
                      <td className="p-1.5 text-right font-mono font-bold">{it.Price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Summary */}
              <div className="flex justify-between items-start mt-3 pt-2">
                <div className="text-[11px] text-gray-700 max-w-sm space-y-1">
                  <div className="font-bold text-black uppercase">Terms & Conditions:</div>
                  <p>1. Check phone on counter. Physical damage or water damage voids official warranty.</p>
                  <p>2. PTA verification is official. Claims can be serviced at authorized brand service centers.</p>
                </div>

                <div className="w-64 border border-black p-2 bg-gray-50 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Gross Value:</span>
                    <span>Rs. {data.sale.NetTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm border-t border-black pt-1 text-blue-900">
                    <span>Net Payable:</span>
                    <span>Rs. {data.sale.NetTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Cash Received:</span>
                    <span>Rs. {data.sale.CashReceived?.toLocaleString() || data.sale.NetTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signature Stamps */}
              <div className="flex justify-between items-end mt-12 pt-4 border-t border-gray-400 text-xs">
                <div className="text-center w-40">
                  <div className="border-t border-black pt-1 font-bold">Customer Signature</div>
                </div>
                <div className="text-center font-mono text-[10px] text-gray-500">
                  Generated by BitDev Enterprise ERP
                </div>
                <div className="text-center w-40">
                  <div className="border-t border-black pt-1 font-bold">Authorized Signature</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

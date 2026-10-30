import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Send, Printer, User, ArrowDownRight, Clock } from 'lucide-react';

export default function InstallmentReceiptView() {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);

  // Form Inputs
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash', 'bank', 'split'
  const [cashAmount, setCashAmount] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('Meezan Bank');
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiptResult, setReceiptResult] = useState(null);

  const fetchContracts = () => {
    setLoading(true);
    fetch('/api/installments')
      .then(r => r.json())
      .then(d => {
        setContracts(d);
        if (d.length > 0) {
          setSelectedContractId(d[0].ID);
          setSelectedContract(d[0]);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleContractChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedContractId(id);
    const found = contracts.find(c => c.ID === id);
    setSelectedContract(found || null);
    setReceiptResult(null);
  };

  // Keep amounts synchronized
  const handleAmountChange = (val) => {
    setAmountReceived(val);
    if (paymentMode === 'cash') {
      setCashAmount(val);
      setBankAmount('0');
    } else if (paymentMode === 'bank') {
      setBankAmount(val);
      setCashAmount('0');
    }
  };

  const handlePostReceipt = async (e) => {
    e.preventDefault();
    const totalVal = parseFloat(amountReceived);
    if (!totalVal || totalVal <= 0) {
      alert('Please enter a valid amount received.');
      return;
    }
    if (!selectedContract) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/installments/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hInstallmentId: selectedContract.ID,
          customerAccountId: selectedContract.CustomerAccountID,
          amountReceived: totalVal,
          cashAmount: paymentMode === 'cash' ? totalVal : (paymentMode === 'bank' ? 0 : parseFloat(cashAmount || 0)),
          bankAmount: paymentMode === 'bank' ? totalVal : (paymentMode === 'cash' ? 0 : parseFloat(bankAmount || 0)),
          bankName: selectedBank,
          remarks: remarks || `Installment payment for ${selectedContract.CustomerName}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReceiptResult(data);
      alert(data.message);
      fetchContracts();
      setAmountReceived('');
      setCashAmount('');
      setBankAmount('');
      setRemarks('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareWhatsAppReceipt = () => {
    if (!receiptResult || !selectedContract) return;
    const phone = selectedContract.CustomerPhone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone || '923000000000');

    let msg = `*HAMZA PHONE STORE - INSTALLMENT RECEIPT*\n`;
    msg += `Receipt No: ${receiptResult.receiptNo}\n`;
    msg += `Date: ${new Date().toLocaleDateString()}\n`;
    msg += `Customer: ${selectedContract.CustomerName}\n`;
    msg += `Contract: ${selectedContract.ContractNo}\n`;
    msg += `------------------------------------\n`;
    msg += `Amount Received: *Rs. ${receiptResult.settledList?.reduce((s,i)=>s+i.amount,0).toLocaleString()}*\n`;
    receiptResult.settledList?.forEach(it => {
      msg += `• Installment #${it.installmentNo}: Rs. ${it.amount.toLocaleString()} (${it.status})\n`;
    });
    msg += `------------------------------------\n`;
    msg += `Thank you for your payment!\n`;
    msg += `BitDev IMS 13 Enterprise ERP`;

    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-3 p-2 max-w-5xl mx-auto select-none font-sans text-xs pb-8">
      {/* 1. Window Header Bar */}
      <div className="win-bevel p-2 bg-[#ECE9D8] border border-[#707070] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-700" />
          <div>
            <h1 className="font-extrabold text-sm text-[#0A246A]">Installment Receipt Voucher (frmInstallmentReceipt)</h1>
            <p className="text-[10px] text-gray-600">BitDev IMS 13 Automated Lump-Sum Installment Allocation Engine</p>
          </div>
        </div>
        <span className="font-mono text-gray-700 font-bold bg-white px-2 py-0.5 border border-[#808080] rounded">
          Date: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* 2. Customer & Contract Selector */}
      <div className="win-bevel p-3 bg-white space-y-2 border border-[#808080]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="md:col-span-2">
            <label className="font-bold text-gray-800 block text-[11px] mb-0.5">
              Select Active Installment Customer / Contract:
            </label>
            <select
              value={selectedContractId}
              onChange={handleContractChange}
              className="win-select w-full font-bold text-sm text-[#0A246A] py-1"
            >
              {contracts.map(c => (
                <option key={c.ID} value={c.ID}>
                  {c.ContractNo} — {c.CustomerName} ({c.Notes || 'Handset'}) — Total: Rs. {c.TotalAmount.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer CNIC:</span>
              <span className="font-mono font-bold">{selectedContract?.CustomerCNIC || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Mobile:</span>
              <span className="font-mono font-bold text-blue-900">{selectedContract?.CustomerPhone}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-0.5">
              <span className="text-gray-700 font-bold">Monthly EMI:</span>
              <span className="font-mono font-black text-blue-900">Rs. {selectedContract?.MonthlyEMI?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Installment Schedule Table (Shows Pending vs Paid EMIs) */}
      <div className="win-window-frame bg-white p-1">
        <div className="bg-[#E0DFD8] p-1.5 border-b border-[#808080] font-bold text-gray-800 text-[11px] flex justify-between">
          <span>Contract Schedule & Outstanding EMIs ({selectedContract?.ContractNo})</span>
          <span className="text-gray-600">Plan: {selectedContract?.PlanMonths} Months | Payment Day: {selectedContract?.PaymentDay}th of each month</span>
        </div>

        <div className="overflow-x-auto max-h-56">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#F0EDE0] sticky top-0 border-b border-[#808080] text-[11px]">
              <tr>
                <th className="dbgrid-header text-center w-12">EMI #</th>
                <th className="dbgrid-header">Due Date</th>
                <th className="dbgrid-header text-right">Scheduled Amount</th>
                <th className="dbgrid-header text-right">Paid Amount</th>
                <th className="dbgrid-header text-right">Remaining Due</th>
                <th className="dbgrid-header text-center">Status</th>
                <th className="dbgrid-header">Notes / Reference</th>
              </tr>
            </thead>
            <tbody>
              {selectedContract?.schedule?.map((s) => {
                const remaining = s.Amount - s.PaidAmount;
                const isPaid = s.Status === 'PAID';
                const isOverdue = s.Status === 'OVERDUE';

                return (
                  <tr key={s.ID} className={`border-b border-gray-200 ${isPaid ? 'bg-green-50/60' : isOverdue ? 'bg-red-50' : 'bg-white'}`}>
                    <td className="dbgrid-cell text-center font-bold font-mono">{s.InstallmentNo}</td>
                    <td className="dbgrid-cell font-mono">{s.DueDate}</td>
                    <td className="dbgrid-cell text-right font-mono">Rs. {s.Amount.toLocaleString()}</td>
                    <td className="dbgrid-cell text-right font-mono font-bold text-green-700">Rs. {s.PaidAmount.toLocaleString()}</td>
                    <td className="dbgrid-cell text-right font-mono font-black text-red-700">Rs. {remaining.toLocaleString()}</td>
                    <td className="dbgrid-cell text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPaid ? 'bg-green-600 text-white' : isOverdue ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {s.Status}
                      </span>
                    </td>
                    <td className="dbgrid-cell text-gray-600 truncate max-w-xs">{s.Notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Voucher Payment Entry & Lump-Sum Allocation Box */}
      <form onSubmit={handlePostReceipt} className="win-bevel p-3 bg-[#ECE9D8] border border-[#707070] space-y-3">
        <div className="font-bold text-sm text-[#0A246A] border-b border-[#808080] pb-1 flex justify-between">
          <span>Receipt Settlement & Auto-Allocation</span>
          <span className="text-[10px] text-gray-600">BitDev splits lump-sum across multiple EMIs automatically</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Amount Input */}
          <div className="md:col-span-2">
            <label className="font-bold text-gray-800 block text-xs mb-1">
              Total Amount Received from Customer (Lump-Sum):
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 font-bold text-gray-500 text-sm">Rs.</span>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter any amount (e.g. 15,000)..."
                className="win-input w-full pl-9 pr-3 py-1.5 font-mono text-base font-black text-[#0A246A]"
                required
                autoFocus
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">
              * BitDev will clear due installments in order and apply any extra towards the next EMI!
            </p>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="font-bold text-gray-800 block text-xs mb-1">Payment Method:</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="win-select w-full py-1.5 text-xs font-bold"
            >
              <option value="cash">Full Cash Payment</option>
              <option value="bank">Direct Bank / Online Transfer</option>
              <option value="split">Split Cash + Bank</option>
            </select>
          </div>

          {/* Bank Selector */}
          <div>
            <label className="font-bold text-gray-800 block text-xs mb-1">Deposit Account:</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="win-select w-full py-1.5 text-xs font-bold"
              disabled={paymentMode === 'cash'}
            >
              <option value="Meezan Bank">Meezan Bank Ltd</option>
              <option value="HBL">Habib Bank Ltd (HBL)</option>
              <option value="Bank Alfalah">Bank Alfalah</option>
              <option value="JazzCash">JazzCash Merchant</option>
            </select>
          </div>
        </div>

        {/* Remarks Input */}
        <div>
          <label className="font-bold text-gray-800 block text-[11px] mb-0.5">Remarks / Payment Reference:</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Received by Counter 1, monthly installment deposit..."
            className="win-input w-full text-xs py-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[#808080] pt-2 flex justify-between items-center">
          <div>
            {receiptResult && (
              <button
                type="button"
                onClick={handleShareWhatsAppReceipt}
                className="win-btn bg-emerald-600 text-white font-bold py-1.5 px-3 flex items-center space-x-1.5 hover:bg-emerald-700"
              >
                <Send className="w-4 h-4" />
                <span>Send WhatsApp Receipt (Receipt #{receiptResult.receiptNo})</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !amountReceived}
            className="win-btn bg-[#0A246A] text-white font-black py-1.5 px-6 text-sm hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? 'Allocating & Posting...' : '✔ Post Installment Voucher (Enter)'}
          </button>
        </div>
      </form>
    </div>
  );
}

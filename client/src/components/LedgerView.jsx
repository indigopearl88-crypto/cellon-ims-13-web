import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function LedgerView() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Voucher quick modal state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherType, setVoucherType] = useState('CP'); // 'CP' or 'CR'
  const [voucherAmount, setVoucherAmount] = useState('');
  const [voucherDesc, setVoucherDesc] = useState('');
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  useEffect(() => {
    fetch('/api/coa')
      .then(r => r.json())
      .then(d => {
        setAccounts(d);
        if (d.length > 0) {
          setSelectedAccountId(d[0].ID);
          loadLedger(d[0].ID);
        }
      });
  }, []);

  const loadLedger = (accId) => {
    setLoading(true);
    fetch(`/api/reports/ledger/${accId}`)
      .then(r => r.json())
      .then(d => {
        setLedgerData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  const handleAccountChange = (e) => {
    const id = parseInt(e.target.value);
    setSelectedAccountId(id);
    loadLedger(id);
  };

  const handlePostVoucher = async (e) => {
    e.preventDefault();
    if (!voucherAmount || parseFloat(voucherAmount) <= 0) {
      alert('Please enter a valid voucher amount.');
      return;
    }

    setSubmittingVoucher(true);
    const endpoint = voucherType === 'CP' ? '/api/vouchers/cash-payment' : '/api/vouchers/cash-receipt';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          amount: parseFloat(voucherAmount),
          description: voucherDesc || `${voucherType === 'CP' ? 'Payment to' : 'Receipt from'} Account`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setShowVoucherModal(false);
      setVoucherAmount('');
      setVoucherDesc('');
      loadLedger(selectedAccountId);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingVoucher(false);
    }
  };

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto text-xs">
      <div className="win-bevel p-2 bg-[#F0EDE0] flex items-center justify-between border-b border-[#ACA899]">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-teal-700" />
          <span className="font-bold text-sm text-[#0A246A]">Party & Financial Ledger (frmAccLedger)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setVoucherType('CP'); setShowVoucherModal(true); }}
            className="win-button bg-red-100 text-red-900 font-bold flex items-center space-x-1"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Cash Payment (CP)</span>
          </button>
          <button
            onClick={() => { setVoucherType('CR'); setShowVoucherModal(true); }}
            className="win-button bg-green-100 text-green-900 font-bold flex items-center space-x-1"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Cash Receipt (CR)</span>
          </button>
        </div>
      </div>

      {/* Account Selector & Summary */}
      <div className="win-bevel p-2.5 bg-white grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="md:col-span-2">
          <label className="font-bold text-gray-700 block mb-0.5">Select Account / Party:</label>
          <select
            value={selectedAccountId}
            onChange={handleAccountChange}
            className="win-input w-full font-bold text-xs"
          >
            {accounts.map(a => (
              <option key={a.ID} value={a.ID}>
                [{a.AccountNo}] {a.Title} (Balance: Rs. {a.CurrentBalance.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-gray-500 block">Current Closing Balance:</span>
          <span className={`font-mono font-extrabold text-base ${
            (ledgerData?.ledger?.slice(-1)[0]?.Balance || ledgerData?.openingBalance || 0) >= 0 ? 'text-red-700' : 'text-green-700'
          }`}>
            Rs. {Math.abs(ledgerData?.ledger?.slice(-1)[0]?.Balance || ledgerData?.openingBalance || 0).toLocaleString()} {
              (ledgerData?.ledger?.slice(-1)[0]?.Balance || ledgerData?.openingBalance || 0) >= 0 ? 'Dr (Receivable)' : 'Cr (Payable)'
            }
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="win-bevel-sunken bg-white min-h-[320px] overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#E0DFD8] text-[11px] font-bold text-gray-700">
            <tr>
              <th className="dbgrid-header w-20">Date</th>
              <th className="dbgrid-header w-14 text-center">Type</th>
              <th className="dbgrid-header w-20">Doc #</th>
              <th className="dbgrid-header">Particulars / Description</th>
              <th className="dbgrid-header w-24">Ref</th>
              <th className="dbgrid-header w-28 text-right">Debit (Dr)</th>
              <th className="dbgrid-header w-28 text-right">Credit (Cr)</th>
              <th className="dbgrid-header w-32 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {/* Opening Balance Row */}
            <tr className="bg-gray-50 font-semibold border-b border-gray-200">
              <td className="dbgrid-cell text-gray-500">-</td>
              <td className="dbgrid-cell text-center font-bold text-gray-500">OB</td>
              <td className="dbgrid-cell text-gray-500">-</td>
              <td className="dbgrid-cell font-bold text-gray-800">Opening Balance Brought Forward</td>
              <td className="dbgrid-cell text-gray-500">-</td>
              <td className="dbgrid-cell text-right font-mono">{ledgerData?.account?.OpenDrBal ? ledgerData.account.OpenDrBal.toLocaleString() : '-'}</td>
              <td className="dbgrid-cell text-right font-mono">{ledgerData?.account?.OpenCrBal ? ledgerData.account.OpenCrBal.toLocaleString() : '-'}</td>
              <td className="dbgrid-cell text-right font-mono font-bold text-blue-900">
                {ledgerData?.openingBalance ? Math.abs(ledgerData.openingBalance).toLocaleString() : '0'}
              </td>
            </tr>

            {loading ? (
              <tr><td colSpan="8" className="text-center py-10 text-gray-500 font-bold">Loading transactions...</td></tr>
            ) : !ledgerData?.ledger || ledgerData.ledger.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">No transactions recorded for this account.</td></tr>
            ) : (
              ledgerData.ledger.map((e, idx) => (
                <tr key={idx} className="hover:bg-blue-50 border-b border-gray-200">
                  <td className="dbgrid-cell text-gray-700">{e.Date}</td>
                  <td className="dbgrid-cell text-center font-bold font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      e.DocType === 'SI' ? 'bg-green-100 text-green-800' :
                      e.DocType === 'PI' ? 'bg-blue-100 text-blue-800' :
                      e.DocType === 'CP' ? 'bg-red-100 text-red-800' :
                      e.DocType === 'CR' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {e.DocType}
                    </span>
                  </td>
                  <td className="dbgrid-cell font-mono font-bold text-gray-700">#{e.DocNo}</td>
                  <td className="dbgrid-cell font-medium text-gray-900">{e.Particular}</td>
                  <td className="dbgrid-cell text-gray-500">{e.Ref || '-'}</td>
                  <td className="dbgrid-cell text-right font-mono font-bold text-red-700">{e.Debit > 0 ? e.Debit.toLocaleString() : '-'}</td>
                  <td className="dbgrid-cell text-right font-mono font-bold text-green-700">{e.Credit > 0 ? e.Credit.toLocaleString() : '-'}</td>
                  <td className="dbgrid-cell text-right font-mono font-extrabold text-gray-900">
                    {Math.abs(e.Balance).toLocaleString()} {e.Balance >= 0 ? 'Dr' : 'Cr'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="win-bevel p-4 bg-[#ECE9D8] w-96 shadow-2xl rounded">
            <div className="flex items-center justify-between border-b border-[#ACA899] pb-2 mb-3">
              <span className="font-bold text-sm text-[#0A246A]">
                {voucherType === 'CP' ? 'Post Cash Payment Voucher (CP)' : 'Post Cash Receipt Voucher (CR)'}
              </span>
              <button onClick={() => setShowVoucherModal(false)} className="font-bold text-gray-600 hover:text-black">✕</button>
            </div>

            <form onSubmit={handlePostVoucher} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Account / Party:</label>
                <input
                  type="text"
                  readOnly
                  value={ledgerData?.account?.Title || ''}
                  className="win-input w-full bg-gray-100 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Amount (Rs):</label>
                <input
                  type="number"
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="win-input w-full font-mono font-bold text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-0.5">Remarks / Particulars:</label>
                <input
                  type="text"
                  value={voucherDesc}
                  onChange={(e) => setVoucherDesc(e.target.value)}
                  placeholder="e.g. Paid against Bill #1024 / Cash collection"
                  className="win-input w-full"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#ACA899]">
                <button type="button" onClick={() => setShowVoucherModal(false)} className="win-button">Cancel</button>
                <button
                  type="submit"
                  disabled={submittingVoucher}
                  className={`win-button font-bold text-white ${voucherType === 'CP' ? 'bg-red-700' : 'bg-green-700'}`}
                >
                  {submittingVoucher ? 'Posting...' : 'Post to Journal (Enter)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

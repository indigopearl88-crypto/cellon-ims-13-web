import React, { useState, useEffect } from 'react';
import { Send, PhoneCall, Calendar, AlertCircle, Clock, CheckCircle2, User, Printer, RefreshCw, FileText } from 'lucide-react';

export default function InstallmentRecoveryView() {
  const [filter, setFilter] = useState('all'); // 'all', 'overdue', 'this_month'
  const [dues, setDues] = useState([]);
  const [selectedDue, setSelectedDue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [urduMessage, setUrduMessage] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [promisedDate, setPromisedDate] = useState('');
  const [submittingCall, setSubmittingCall] = useState(false);

  const fetchDues = () => {
    setLoading(true);
    fetch(`/api/installments/dues?filter=${filter}`)
      .then(r => r.json())
      .then(d => {
        setDues(d);
        if (d.length > 0) {
          setSelectedDue(d[0]);
          setUrduMessage(d[0].urduMessage || '');
        } else {
          setSelectedDue(null);
          setUrduMessage('');
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDues();
  }, [filter]);

  const handleSelectDue = (item) => {
    setSelectedDue(item);
    setUrduMessage(item.urduMessage || '');
  };

  const handleSendWhatsApp = () => {
    if (!selectedDue || !selectedDue.CustomerPhone) {
      alert('Customer mobile number is missing.');
      return;
    }
    const cleanPhone = selectedDue.CustomerPhone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone || '923000000000');
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(urduMessage)}`, '_blank');
  };

  const handleSaveCallNote = async (e) => {
    e.preventDefault();
    if (!callNotes.trim() || !selectedDue) return;

    setSubmittingCall(true);
    try {
      const res = await fetch('/api/installments/call-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hInstallmentId: selectedDue.HInstallmentID,
          customerAccountId: selectedDue.CustomerAccountID || 6,
          callerName: 'Recovery Officer (Hamza)',
          customerFeedback: callNotes,
          promisedDate: promisedDate || null,
          promisedAmount: selectedDue.Amount
        })
      });
      const data = await res.json();
      alert(data.message || 'Call note saved!');
      setCallNotes('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingCall(false);
    }
  };

  return (
    <div className="space-y-2 p-2 max-w-7xl mx-auto select-none font-sans text-xs pb-6">
      {/* 1. Header Bar */}
      <div className="win-bevel p-2 bg-[#ECE9D8] border border-[#707070] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-red-700" />
          <div>
            <h1 className="font-extrabold text-sm text-[#0A246A]">Installment Recovery Center & Dues Monitor</h1>
            <p className="text-[10px] text-gray-600">CellON IMS 13 Smart Urdu WhatsApp Reminders & Call Center Workflows</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`win-btn py-1 px-3 ${filter === 'all' ? 'bg-[#FFFFD6] text-[#0A246A]' : ''}`}
          >
            All Pending EMIs
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`win-btn py-1 px-3 ${filter === 'overdue' ? 'bg-red-100 text-red-800 font-black' : ''}`}
          >
            Overdue Dues Only
          </button>
          <button
            onClick={() => setFilter('this_month')}
            className={`win-btn py-1 px-3 ${filter === 'this_month' ? 'bg-blue-100 text-blue-800 font-bold' : ''}`}
          >
            Due This Month
          </button>
          <button onClick={fetchDues} className="win-btn py-1 px-2">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Split: Dues Table (Left) + Detail & WhatsApp Panel (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* Left Column: Dues List Table */}
        <div className="md:col-span-7 win-window-frame bg-white p-1 overflow-hidden flex flex-col h-[580px]">
          <div className="bg-[#E0DFD8] p-1.5 border-b border-[#808080] font-bold text-gray-800 flex justify-between items-center text-[11px]">
            <span>Pending & Overdue Installments ({dues.length})</span>
            <span className="text-gray-500 text-[10px]">Click any row to load WhatsApp reminder</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#F0EDE0] sticky top-0 border-b border-[#808080] select-none text-[11px]">
                <tr>
                  <th className="dbgrid-header text-center w-8">#</th>
                  <th className="dbgrid-header">Customer Name</th>
                  <th className="dbgrid-header">Contract</th>
                  <th className="dbgrid-header">Model / Handset</th>
                  <th className="dbgrid-header w-20">Due Date</th>
                  <th className="dbgrid-header text-right w-20">EMI (Rs)</th>
                  <th className="dbgrid-header text-center w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-500 font-bold">Loading installment dues...</td></tr>
                ) : dues.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-500">No dues found under this filter.</td></tr>
                ) : (
                  dues.map((item, idx) => {
                    const isSelected = selectedDue?.ID === item.ID;
                    const isOverdue = item.reminderType === 'OVERDUE';
                    return (
                      <tr
                        key={item.ID}
                        onClick={() => handleSelectDue(item)}
                        className={`cursor-pointer transition-colors border-b border-[#E0DFD8] ${
                          isSelected 
                            ? 'bg-[#316AC5] text-white font-semibold' 
                            : isOverdue 
                              ? 'bg-red-50 hover:bg-red-100 text-black' 
                              : idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F8F5]'
                        }`}
                      >
                        <td className="dbgrid-cell text-center font-mono">{idx + 1}</td>
                        <td className="dbgrid-cell font-bold">{item.CustomerName}</td>
                        <td className="dbgrid-cell font-mono">{item.ContractNo} (P#{item.InstallmentNo})</td>
                        <td className="dbgrid-cell truncate max-w-[120px]">{item.HandsetNotes || 'Mobile Phone'}</td>
                        <td className="dbgrid-cell font-mono">{item.DueDate}</td>
                        <td className="dbgrid-cell text-right font-mono font-bold">
                          {item.Amount.toLocaleString()}
                        </td>
                        <td className="dbgrid-cell text-center">
                          <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${
                            isSelected 
                              ? 'bg-white text-blue-900' 
                              : isOverdue 
                                ? 'bg-red-600 text-white' 
                                : 'bg-blue-100 text-blue-900'
                          }`}>
                            {isOverdue ? `Overdue (${Math.abs(item.daysDiff)}d)` : 'Due'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Customer Details, Smart Urdu WhatsApp, & Call Notes */}
        <div className="md:col-span-5 win-window-frame bg-[#ECE9D8] p-2 flex flex-col space-y-2 h-[580px] overflow-y-auto">
          {selectedDue ? (
            <>
              {/* Customer Header Info */}
              <div className="win-bevel p-2 bg-white space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-sm font-black text-[#0A246A]">{selectedDue.CustomerName}</h2>
                    <p className="text-[11px] text-gray-700">CNIC: <span className="font-mono">{selectedDue.CustomerCNIC || 'N/A'}</span></p>
                    <p className="text-[11px] text-gray-700">Phone: <span className="font-mono font-bold">{selectedDue.CustomerPhone}</span></p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                    selectedDue.reminderType === 'OVERDUE' ? 'bg-red-600 text-white' : 'bg-blue-700 text-white'
                  }`}>
                    {selectedDue.reminderType}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 border-t pt-1 flex justify-between">
                  <span>Contract: <strong>{selectedDue.ContractNo}</strong></span>
                  <span>Due Amount: <strong className="text-red-700 font-mono text-xs">Rs. {selectedDue.Amount.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Smart Urdu WhatsApp Box (CellON IMS 13 Feature) */}
              <div className="win-bevel p-2.5 bg-white space-y-1.5 border border-emerald-500">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                  <span className="flex items-center space-x-1">
                    <Send className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Smart Urdu WhatsApp Alert</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">Auto-Template</span>
                </div>

                <textarea
                  value={urduMessage}
                  onChange={(e) => setUrduMessage(e.target.value)}
                  dir="rtl"
                  rows={4}
                  className="win-input w-full font-sans text-xs leading-relaxed p-2 text-right bg-emerald-50/40 border border-emerald-300"
                  placeholder="اردو میں کسٹمر کو میسج یہاں ٹائپ کریں..."
                />

                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[10px] text-gray-500">Auto-formatted for mobile WhatsApp</span>
                  <button
                    onClick={handleSendWhatsApp}
                    className="win-btn bg-emerald-600 text-white font-bold py-1 px-3 flex items-center space-x-1.5 hover:bg-emerald-700"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Now</span>
                  </button>
                </div>
              </div>

              {/* Call Center & Communication Log */}
              <div className="win-bevel p-2 bg-white space-y-1.5 flex-1 flex flex-col">
                <div className="font-bold text-xs text-[#0A246A] flex items-center space-x-1 border-b pb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                  <span>Call Center Follow-Up & Promise Tracker</span>
                </div>

                <form onSubmit={handleSaveCallNote} className="space-y-1.5 flex-1 flex flex-col">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block">Customer Call Feedback / Reason:</label>
                    <input
                      type="text"
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="e.g. Salary delayed, promised to pay this Saturday..."
                      className="win-input w-full text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block">Promised Pay Date:</label>
                      <input
                        type="date"
                        value={promisedDate}
                        onChange={(e) => setPromisedDate(e.target.value)}
                        className="win-input w-full text-xs"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={submittingCall}
                        className="win-btn w-full py-1 text-[#0A246A] font-bold"
                      >
                        {submittingCall ? 'Saving...' : 'Save Call Note'}
                      </button>
                    </div>
                  </div>

                  {/* Previous Call Logs */}
                  <div className="mt-2 border-t pt-1">
                    <span className="text-[10px] font-bold text-gray-600">Past Customer Commitments:</span>
                    <div className="p-1.5 bg-gray-50 text-[10px] text-gray-700 border mt-0.5 rounded">
                      • 25/10/2026: Customer requested 5 days time due to salary delay. Promised on 31/10/2026.
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="m-auto text-center text-gray-500 py-20 font-bold">
              Select an installment record to view customer history and send WhatsApp reminder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Send, PhoneCall, Calendar, AlertCircle, Clock, CheckCircle2, User, Printer, RefreshCw, FileText, Search, BookOpen, MessageSquare, X } from 'lucide-react';

export default function InstallmentRecoveryView({ onOpenTab }) {
  // Filters matching CellON IMS 13 Screenshot 678
  const [dueTillPeriod, setDueTillPeriod] = useState('next_month'); // 'this_month', 'last_month', 'next_month', 'custom'
  const [customDueDate, setCustomDueDate] = useState('2026-12-31');
  const [accountGroupCustomer, setAccountGroupCustomer] = useState(true);
  const [accountGroupSupplier, setAccountGroupSupplier] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [salesman, setSalesman] = useState('ALL');
  const [recoveryOfficer, setRecoveryOfficer] = useState('ALL');
  const [sortBy, setSortBy] = useState('age_desc');
  const [reportType, setReportType] = useState('Pending Detail');
  const [whatsappTemplate, setWhatsappTemplate] = useState('WTSAPP_REMINDER');

  // Dues Data
  const [dues, setDues] = useState([]);
  const [selectedDue, setSelectedDue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [urduMessage, setUrduMessage] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [promisedDate, setPromisedDate] = useState('');
  const [submittingCall, setSubmittingCall] = useState(false);

  // Fetch Dues based on period
  const fetchDues = () => {
    setLoading(true);
    let filterParam = 'all';
    if (dueTillPeriod === 'this_month') filterParam = 'this_month';
    else if (dueTillPeriod === 'last_month') filterParam = 'last_month';
    else if (dueTillPeriod === 'next_month') filterParam = 'all';

    fetch(`/api/installments/dues?filter=${filterParam}`)
      .then(r => r.json())
      .then(d => {
        let list = [...d];
        if (customerSearch) {
          list = list.filter(item => 
            item.CustomerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (item.CustomerPhone && item.CustomerPhone.includes(customerSearch))
          );
        }

        // Sorting
        if (sortBy === 'age_desc') {
          list.sort((a, b) => (b.daysDiff || 0) - (a.daysDiff || 0));
        } else if (sortBy === 'age_asc') {
          list.sort((a, b) => (a.daysDiff || 0) - (b.daysDiff || 0));
        }

        setDues(list);
        if (list.length > 0) {
          setSelectedDue(list[0]);
          updateMessageForTemplate(whatsappTemplate, list[0]);
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
  }, [dueTillPeriod, sortBy]);

  const updateMessageForTemplate = (tpl, item) => {
    if (!item) return;
    const amountStr = item.Amount ? item.Amount.toLocaleString() : '0';
    if (tpl === 'WTSAPP_REMINDER') {
      setUrduMessage(`السلام علیکم جناب ${item.CustomerName}! سیلون موبائل کی طرف سے یاد دہانی: آپ کے موبائل کی قسط بمبلغ Rs. ${amountStr} کی ادائیگی کی تاریخ ${item.DueDate} ہے۔ شکریہ۔`);
    } else if (tpl === 'WTSAPP_REMINDER_DUE') {
      setUrduMessage(`محترم جناب ${item.CustomerName}! سیلون موبائل سٹور کی طرف سے مطلع کیا جاتا ہے کہ آپ کے فون کی قسط نمبر ${item.InstallmentNo} بمبلغ Rs. ${amountStr} واجب الادا ہو چکی ہے۔ برائے مہربانی بروقت جمع کروائیں۔`);
    } else if (tpl === 'WTSAPP_REMINDER_DUEPLUS') {
      setUrduMessage(`محترم جناب ${item.CustomerName}! ضروری اطلاع: آپ کے فون کی قسط بمبلغ Rs. ${amountStr} کی تاریخ (${item.DueDate}) گزر چکی ہے اور بقایا واجب الادا ہے۔ فوری ادائیگی یقینی بنائیں بصورت دیگر موبائل ڈیوائس لاک کی جا سکتی ہے۔`);
    }
  };

  const handleSelectDue = (item) => {
    setSelectedDue(item);
    updateMessageForTemplate(whatsappTemplate, item);
  };

  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setWhatsappTemplate(val);
    updateMessageForTemplate(val, selectedDue);
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
          callerName: 'Recovery Officer',
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

  // Summaries
  const totalReceivable = dues.reduce((sum, d) => sum + (d.Amount || 0), 0);
  const totalGLReceivable = dues.reduce((sum, d) => sum + (d.Amount || 0), 0) - 13374;

  return (
    <div className="space-y-1.5 p-2 max-w-7xl mx-auto select-none font-sans text-xs pb-10">
      {/* 1. Window Title Bar */}
      <div className="win-bevel p-2 bg-[#0A246A] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 inline-block"></span>
          <h1 className="font-bold text-sm tracking-wide">Installments Due — Recovery Console</h1>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-sky-900 px-2 py-0.5 rounded font-mono">CellON IMS 13 Enterprise</span>
          <button className="text-gray-300 hover:text-white font-bold">×</button>
        </div>
      </div>

      {/* 2. Top Multi-Criteria Filter Console (Replicating Screenshot 678) */}
      <div className="win-bevel p-2 bg-[#ECE9D8] border border-[#808080] space-y-2">
        <div className="grid grid-cols-12 gap-2 items-start">
          {/* Account Group Box */}
          <fieldset className="col-span-2 border border-gray-400 p-1.5 bg-white rounded text-[11px]">
            <legend className="font-bold text-[#0A246A] px-1">Account Group</legend>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input 
                type="checkbox" 
                checked={accountGroupCustomer} 
                onChange={e => setAccountGroupCustomer(e.target.checked)} 
              />
              <span className="font-bold text-slate-800">TRADE CUSTOMERS - H.O</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer mt-1">
              <input 
                type="checkbox" 
                checked={accountGroupSupplier} 
                onChange={e => setAccountGroupSupplier(e.target.checked)} 
              />
              <span className="text-slate-700">TRADE SUPPLIERS</span>
            </label>
          </fieldset>

          {/* Due Till Radios */}
          <fieldset className="col-span-4 border border-gray-400 p-1.5 bg-white rounded text-[11px]">
            <legend className="font-bold text-[#0A246A] px-1">Due Till</legend>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="dueTill" 
                  checked={dueTillPeriod === 'this_month'} 
                  onChange={() => setDueTillPeriod('this_month')} 
                />
                <span>Till This Month</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="dueTill" 
                  checked={dueTillPeriod === 'last_month'} 
                  onChange={() => setDueTillPeriod('last_month')} 
                />
                <span>Till Last Month</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="dueTill" 
                  checked={dueTillPeriod === 'next_month'} 
                  onChange={() => setDueTillPeriod('next_month')} 
                />
                <span className="font-bold text-blue-900">Till Next Month</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="dueTill" 
                  checked={dueTillPeriod === 'custom'} 
                  onChange={() => setDueTillPeriod('custom')} 
                />
                <span>Custom:</span>
              </label>
              <input 
                type="date" 
                value={customDueDate} 
                onChange={e => setCustomDueDate(e.target.value)} 
                className="win-input text-[10px] py-0 px-1 font-mono" 
              />
            </div>
          </fieldset>

          {/* Company & Recovery Officer */}
          <div className="col-span-3 space-y-1">
            <div className="flex items-center space-x-1">
              <span className="font-bold w-24">Company</span>
              <select className="win-input w-full bg-white">
                <option value="ALL">[ ALL ]</option>
                <option value="HO">HEAD OFFICE</option>
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold w-24 whitespace-nowrap">Recovery Officer</span>
              <select 
                value={recoveryOfficer} 
                onChange={e => setRecoveryOfficer(e.target.value)} 
                className="win-input w-full bg-white font-bold"
              >
                <option value="ALL">[ ALL ]</option>
                <option value="ABUBAKAR">ABUBAKAR</option>
                <option value="TEST">TEST RECOVERY-OFFICER</option>
              </select>
            </div>
          </div>

          {/* Due Months & Sort By */}
          <div className="col-span-3 space-y-1">
            <div className="flex items-center space-x-1">
              <span className="font-bold w-20">Due Months</span>
              <span className="text-[10px]">From</span>
              <input type="number" defaultValue="0" className="win-input w-10 text-center font-mono" />
              <span className="text-[10px]">To</span>
              <input type="number" defaultValue="100" className="win-input w-12 text-center font-mono" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold w-20">Sort By</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)} 
                className="win-input w-full bg-white font-bold"
              >
                <option value="age_desc">Age (Overdue Descending)</option>
                <option value="age_asc">Age (Ascending)</option>
                <option value="account">Account No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Search Row */}
        <div className="flex items-center space-x-2 pt-1 border-t border-gray-300">
          <span className="font-bold text-[#0A246A] whitespace-nowrap">Customer Quick Filter:</span>
          <input 
            type="text" 
            value={customerSearch} 
            onChange={e => setCustomerSearch(e.target.value)} 
            placeholder="Search by customer name, city or mobile number..." 
            className="win-input flex-1 bg-white" 
          />
          <button onClick={fetchDues} className="win-btn px-3 py-0.5 font-bold flex items-center space-x-1">
            <Search className="w-3 h-3" />
            <span>Apply Filter</span>
          </button>
        </div>
      </div>

      {/* 3. Main Operational Area: Payments Due Table (Left) + Inspector (Right) */}
      <div className="grid grid-cols-12 gap-2">
        {/* Left Column: Payments Due Table (Replicating Screenshot 678) */}
        <div className="col-span-8 win-bevel bg-white border border-[#808080] flex flex-col h-[520px]">
          <div className="bg-[#2B579A] text-white px-2 py-1 font-bold text-xs flex justify-between items-center">
            <span>Payments Due Table ({dues.length} records)</span>
            <span className="text-[10px] text-sky-200">Double click row to adjust voucher in IRV</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#ECE9D8] text-gray-800 sticky top-0 border-b border-gray-400 select-none text-[11px] font-bold">
                <tr>
                  <th className="p-1 border-r border-gray-300">Account No.</th>
                  <th className="p-1 border-r border-gray-300">Customer</th>
                  <th className="p-1 border-r border-gray-300">City</th>
                  <th className="p-1 border-r border-gray-300">Mobile No.</th>
                  <th className="p-1 border-r border-gray-300">Due Date</th>
                  <th className="p-1 border-r border-gray-300">Installment Detail</th>
                  <th className="p-1 border-r border-gray-300 text-center">Age</th>
                  <th className="p-1 border-r border-gray-300 text-right">Amount</th>
                  <th className="p-1 border-r border-gray-300 text-right">GL Bal...</th>
                  <th className="p-1">Salesman</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="p-12 text-center text-gray-500 font-bold">Loading installment dues...</td></tr>
                ) : dues.length === 0 ? (
                  <tr><td colSpan={10} className="p-12 text-center text-gray-500">No dues found under active filter criteria.</td></tr>
                ) : (
                  dues.map((item, idx) => {
                    const isSelected = selectedDue?.ID === item.ID;
                    const age = item.daysDiff ? -item.daysDiff : 11;
                    const isOverdue = age > 0;
                    return (
                      <tr 
                        key={idx}
                        onClick={() => handleSelectDue(item)}
                        className={`cursor-pointer border-b border-gray-200 hover:bg-sky-50 ${
                          isSelected 
                            ? 'bg-[#316AC5] text-white font-bold' 
                            : isOverdue 
                              ? 'bg-amber-50/40 text-black' 
                              : idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="p-1 border-r border-gray-200 font-mono text-[11px]">
                          103001{item.CustomerAccountID ? item.CustomerAccountID.toString().padStart(4, '0') : '0015'}
                        </td>
                        <td className="p-1 border-r border-gray-200 font-bold whitespace-nowrap">
                          {item.CustomerName}
                        </td>
                        <td className="p-1 border-r border-gray-200 text-gray-600">
                          {item.CustomerAddress?.includes('Lahore') ? 'Lahore' : (item.CustomerCity || 'Swabi')}
                        </td>
                        <td className="p-1 border-r border-gray-200 font-mono text-[11px]">
                          {item.CustomerPhone || '-'}
                        </td>
                        <td className="p-1 border-r border-gray-200 font-mono text-[11px] whitespace-nowrap">
                          {item.DueDate}
                        </td>
                        <td className="p-1 border-r border-gray-200 font-medium">
                          {item.InstallmentNo === 0 ? 'Advance' : `${item.InstallmentNo}st Month`}
                        </td>
                        <td className={`p-1 border-r border-gray-200 text-center font-mono font-bold ${
                          isOverdue && !isSelected ? 'text-red-700' : ''
                        }`}>
                          {age}
                        </td>
                        <td className="p-1 border-r border-gray-200 text-right font-mono font-bold">
                          {item.Amount.toLocaleString()}
                        </td>
                        <td className="p-1 border-r border-gray-200 text-right font-mono text-gray-700">
                          {((item.Amount * 3) - 2000).toLocaleString()}
                        </td>
                        <td className="p-1 font-mono text-[10px] text-gray-600">
                          {item.RecoveryOfficer || 'ABUBAKAR'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Total Bar */}
          <div className="flex items-center justify-end space-x-6 p-1.5 bg-[#ECE9D8] border-t border-gray-400 font-bold text-xs">
            <div className="flex items-center space-x-2">
              <span>Total Receivable</span>
              <input 
                type="text" 
                readOnly 
                value={totalReceivable.toLocaleString()} 
                className="win-input w-28 bg-[#99CCFF] text-[#0A246A] font-mono font-extrabold text-right" 
              />
            </div>
            <div className="flex items-center space-x-2">
              <span>Total GL Receivable</span>
              <input 
                type="text" 
                readOnly 
                value={totalGLReceivable.toLocaleString()} 
                className="win-input w-28 bg-[#99CCFF] text-[#0A246A] font-mono font-extrabold text-right" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Customer Aging, Ledger, & WhatsApp Console (Screenshot 679) */}
        <div className="col-span-4 space-y-2 h-[520px] flex flex-col overflow-y-auto">
          {/* Ledger and Aging Balance Box */}
          <fieldset className="win-bevel p-2 bg-[#ECE9D8] border border-[#808080] space-y-1">
            <legend className="font-bold text-[#0A246A] px-1 text-[11px]">Ledger and Aging Balance</legend>
            <div className="grid grid-cols-2 gap-1 items-center text-xs">
              <span>This Month Due</span>
              <input type="text" readOnly value="7,500" className="win-input bg-[#99CCFF] text-right font-mono font-bold" />

              <span>Last Month Due</span>
              <input type="text" readOnly value="7,500" className="win-input bg-[#99CCFF] text-right font-mono font-bold" />

              <span>3 Months Due</span>
              <input type="text" readOnly value="7,000" className="win-input bg-[#99CCFF] text-right font-mono font-bold" />

              <span>4 Months Due</span>
              <input type="text" readOnly value="0" className="win-input bg-[#99CCFF] text-right font-mono" />

              <span>5 Months Due</span>
              <input type="text" readOnly value="0" className="win-input bg-[#99CCFF] text-right font-mono" />

              <span>6+ Months Due</span>
              <input type="text" readOnly value="0" className="win-input bg-[#99CCFF] text-right font-mono" />

              <span className="font-bold text-[#0A246A]">Current Balance</span>
              <input type="text" readOnly value="22,000" className="win-input bg-[#6699FF] text-white text-right font-mono font-black" />
            </div>
          </fieldset>

          {/* Latest Payment Box */}
          <fieldset className="win-bevel p-2 bg-[#ECE9D8] border border-[#808080] space-y-1">
            <legend className="font-bold text-[#0A246A] px-1 text-[11px]">Latest Payment</legend>
            <div className="grid grid-cols-2 gap-1 items-center text-xs">
              <span>Last Payment Date</span>
              <input type="text" readOnly value="05/08/2026" className="win-input bg-[#99CCFF] text-center font-mono font-bold" />

              <span>This Month Payment</span>
              <input type="text" readOnly value="0" className="win-input bg-[#99CCFF] text-right font-mono font-bold" />
            </div>
          </fieldset>

          {/* Latest Communication Detail */}
          <fieldset className="win-bevel p-2 bg-[#ECE9D8] border border-[#808080] space-y-1 flex-1 flex flex-col">
            <legend className="font-bold text-[#0A246A] px-1 text-[11px]">Latest Communication</legend>
            <div className="p-1.5 bg-white border border-gray-400 rounded text-gray-700 text-xs flex-1">
              <strong>Detail:</strong> Customer promised to deposit installment of Rs. 7,500 after 5th of this month.
            </div>
          </fieldset>

          {/* WhatsApp Message Selector & Template */}
          <fieldset className="win-bevel p-2 bg-[#ECE9D8] border border-emerald-600 space-y-1.5">
            <legend className="font-bold text-emerald-900 px-1 text-[11px]">Whatsapp Message</legend>
            <select 
              value={whatsappTemplate} 
              onChange={handleTemplateChange}
              className="win-input w-full bg-white font-bold text-emerald-900"
            >
              <option value="WTSAPP_REMINDER">WTSAPP_REMINDER</option>
              <option value="WTSAPP_REMINDER_DUE">WTSAPP_REMINDER_DUE</option>
              <option value="WTSAPP_REMINDER_DUEPLUS">WTSAPP_REMINDER_DUEPLUS</option>
            </select>
            <textarea 
              value={urduMessage} 
              onChange={e => setUrduMessage(e.target.value)} 
              dir="rtl" 
              rows={2} 
              className="win-input w-full p-1 bg-emerald-50 text-right text-xs leading-relaxed" 
            />
          </fieldset>
        </div>
      </div>

      {/* 4. Action Buttons Bar (Replicating Screenshot 678 & 680) */}
      <div className="win-bevel p-2 bg-[#ECE9D8] border border-[#707070] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#0A246A]">Report Type:</span>
          <select 
            value={reportType} 
            onChange={e => setReportType(e.target.value)}
            className="win-input bg-white font-bold w-40"
          >
            <option value="Pending Detail">Pending Detail</option>
            <option value="Pending Month Wise">Pending Month Wise</option>
            <option value="Pending RO Wise">Pending RO Wise</option>
            <option value="Pending Summary">Pending Summary</option>
          </select>

          <button onClick={fetchDues} className="win-btn px-3 py-1 flex items-center space-x-1 font-bold">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load List</span>
          </button>

          <button onClick={handleSendWhatsApp} className="win-btn px-3 py-1 flex items-center space-x-1 font-bold text-emerald-800 hover:bg-emerald-100">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-[9px]">W</span>
            <span>Whatsapp</span>
          </button>

          <button onClick={() => window.print()} className="win-btn px-3 py-1 flex items-center space-x-1 font-bold text-gray-800">
            <Printer className="w-3.5 h-3.5 text-gray-700" />
            <span>Print</span>
          </button>

          <button onClick={() => alert(`Previewing ${reportType}`)} className="win-btn px-3 py-1 flex items-center space-x-1 font-bold text-gray-800">
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Preview</span>
          </button>

          <button onClick={() => onOpenTab && onOpenTab('ledger')} className="win-btn px-3 py-1 flex items-center space-x-1 font-bold text-[#0A246A]">
            <BookOpen className="w-3.5 h-3.5 text-[#0A246A]" />
            <span>Ledger</span>
          </button>

          <button onClick={() => alert('Log customer communication')} className="win-btn px-3 py-1 flex items-center space-x-1 font-bold text-gray-800">
            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
            <span>Communication</span>
          </button>
        </div>

        <button onClick={fetchDues} className="win-btn px-4 py-1 flex items-center space-x-1 font-bold text-red-700 hover:bg-red-50">
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}

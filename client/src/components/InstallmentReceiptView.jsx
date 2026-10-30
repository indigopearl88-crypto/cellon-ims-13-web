import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Send, Printer, User, Search, Save, X, Phone, FileText } from 'lucide-react';

export default function InstallmentReceiptView() {
  const [openMode, setOpenMode] = useState('new'); // 'new', 'edit', 'delete'
  const [voucherNo, setVoucherNo] = useState('0010');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Customers
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBalance, setCustomerBalance] = useState(0);

  // Accounts
  const [cashAccountTitle, setCashAccountTitle] = useState('CASH IN HAND - H.O');
  const [cashAccountNo, setCashAccountNo] = useState('1020030001');
  const [bankAccountTitle, setBankAccountTitle] = useState('TEST BANK');
  const [bankAccountNo, setBankAccountNo] = useState('1020040002');

  // Amounts
  const [cashReceived, setCashReceived] = useState('');
  const [bankReceived, setBankReceived] = useState('');
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Transactions Grid
  const [installments, setInstallments] = useState([]);
  const [allocatedRows, setAllocatedRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedVoucher, setLastSavedVoucher] = useState(null);

  // Load Customers
  useEffect(() => {
    fetch('/api/customers/search?q=')
      .then(r => r.json())
      .then(data => {
        setCustomers(data);
        if (data.length > 0) {
          handleSelectCustomer(data[0].AccountID);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectCustomer = async (accountId) => {
    const aid = parseInt(accountId);
    setSelectedCustomerId(aid);
    const found = customers.find(c => c.AccountID === aid);
    setSelectedCustomer(found || null);

    try {
      const res = await fetch(`/api/customers/${aid}/pending-installments`);
      const data = await res.json();
      setCustomerBalance(data.customer?.GLBalance || 0);
      setInstallments(data.installments || []);
      setAllocatedRows(data.installments || []);
      recalculateCascade(cashReceived, bankReceived, data.installments || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Waterfall FIFO Allocation Logic
  const recalculateCascade = (cashVal, bankVal, baseInst = installments) => {
    let unallocatedCash = parseFloat(cashVal) || 0;
    let unallocatedBank = parseFloat(bankVal) || 0;

    const updated = baseInst.map((item, idx) => {
      const receivable = item.BalanceDue !== undefined ? item.BalanceDue : item.Receivable;
      let rowCash = 0;
      let rowBank = 0;

      // 1. Allocate Cash First
      if (unallocatedCash > 0) {
        if (unallocatedCash >= receivable) {
          rowCash = receivable;
          unallocatedCash -= receivable;
        } else {
          rowCash = unallocatedCash;
          unallocatedCash = 0;
        }
      }

      // 2. Allocate Bank to Remaining Unpaid
      const remainingNeeded = Math.max(0, receivable - rowCash);
      if (remainingNeeded > 0 && unallocatedBank > 0) {
        if (unallocatedBank >= remainingNeeded) {
          rowBank = remainingNeeded;
          unallocatedBank -= remainingNeeded;
        } else {
          rowBank = unallocatedBank;
          unallocatedBank = 0;
        }
      }

      const totalRec = rowCash + rowBank;
      let acctTitle = '';
      if (rowCash > 0 && rowBank > 0) acctTitle = 'CASH & BANK';
      else if (rowCash > 0) acctTitle = cashAccountTitle;
      else if (rowBank > 0) acctTitle = bankAccountTitle;

      return {
        ...item,
        allocatedCash: rowCash,
        allocatedBank: rowBank,
        totalAllocated: totalRec,
        rowRemarks: generalRemarks || (totalRec > 0 ? 'payment' : ''),
        accountTitle: acctTitle
      };
    });

    setAllocatedRows(updated);
  };

  const handleCashChange = (val) => {
    setCashReceived(val);
    recalculateCascade(val, bankReceived);
  };

  const handleBankChange = (val) => {
    setBankReceived(val);
    recalculateCascade(cashReceived, val);
  };

  const handleRemarksChange = (val) => {
    setGeneralRemarks(val);
    setAllocatedRows(prev => prev.map(r => ({
      ...r,
      rowRemarks: val || (r.totalAllocated > 0 ? 'payment' : '')
    })));
  };

  // Summaries
  const totalReceivable = allocatedRows.reduce((sum, r) => sum + (r.BalanceDue !== undefined ? r.BalanceDue : r.Receivable), 0);
  const totalReceived = allocatedRows.reduce((sum, r) => sum + (r.totalAllocated || 0), 0);

  // Save Voucher (OK Button)
  const handleSaveVoucher = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    if (totalReceived <= 0) {
      alert('Please enter a valid Cash Received or Bank Received amount.');
      return;
    }

    setSubmitting(true);
    try {
      const activeContract = installments[0]?.HInstallmentID;
      const res = await fetch('/api/installments/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: activeContract,
          customerAccountId: selectedCustomerId,
          amountReceived: totalReceived,
          cashAmount: parseFloat(cashReceived) || 0,
          bankAmount: parseFloat(bankReceived) || 0,
          bankName: bankAccountTitle,
          remarks: generalRemarks || `Installments Received Voucher #${voucherNo}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLastSavedVoucher({
        voucherNo,
        date: voucherDate,
        customerName: selectedCustomer?.Name,
        customerPhone: selectedCustomer?.Ph,
        totalReceived,
        settledList: data.settledList
      });

      alert(`Success: Installments Received Voucher ${voucherNo} posted! GL and installment schedules updated.`);
      
      // Auto-increment voucher no and refresh
      const nextV = (parseInt(voucherNo, 10) + 1).toString().padStart(4, '0');
      setVoucherNo(nextV);
      setCashReceived('');
      setBankReceived('');
      setGeneralRemarks('');
      handleSelectCustomer(selectedCustomerId);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Confirmation Dispatch
  const handleWhatsAppDispatch = () => {
    const cust = selectedCustomer;
    if (!cust || !cust.Ph) {
      alert('Customer mobile number is missing.');
      return;
    }
    const cleanPhone = cust.Ph.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone || '923000000000');

    let msg = `*CELLON IMS 13 - INSTALLMENTS RECEIVED VOUCHER*\n`;
    msg += `Voucher No: ${voucherNo}\n`;
    msg += `Date: ${voucherDate}\n`;
    msg += `Customer: ${cust.Name}\n`;
    msg += `Account No: ${cust.NicNo || selectedCustomerId}\n`;
    msg += `------------------------------------\n`;
    msg += `Amount Received: *Rs. ${totalReceived.toLocaleString()}*\n`;
    allocatedRows.filter(r => r.totalAllocated > 0).forEach(r => {
      msg += `• ${r.Detail}: Rs. ${r.totalAllocated.toLocaleString()} (${r.totalAllocated >= r.Receivable ? 'PAID' : 'PARTIAL'})\n`;
    });
    msg += `------------------------------------\n`;
    msg += `Current GL Balance: Rs. ${Math.max(0, customerBalance - totalReceived).toLocaleString()}\n`;
    msg += `Thank you for your business!\nCellON Mobile Store`;

    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-2 p-2 max-w-6xl mx-auto select-none font-sans text-xs pb-10">
      {/* 1. Window Header / Title Bar */}
      <div className="win-bevel p-2 bg-[#0A246A] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-cyan-400 inline-block"></span>
          <h1 className="font-bold text-sm tracking-wide">Installments Received Voucher</h1>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <span className="bg-sky-900 px-2 py-0.5 rounded font-mono">CellON IMS 13 Engine</span>
          <button className="text-gray-300 hover:text-white font-bold">×</button>
        </div>
      </div>

      {/* 2. Open Mode Radio Bar */}
      <div className="win-bevel px-3 py-1.5 bg-[#2B579A] text-white flex items-center justify-between text-xs font-bold">
        <span>Open Mode</span>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input 
              type="radio" 
              name="openMode" 
              value="new" 
              checked={openMode === 'new'} 
              onChange={() => setOpenMode('new')} 
              className="accent-white" 
            />
            <span>New</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input 
              type="radio" 
              name="openMode" 
              value="edit" 
              checked={openMode === 'edit'} 
              onChange={() => setOpenMode('edit')} 
              className="accent-white" 
            />
            <span>Edit</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input 
              type="radio" 
              name="openMode" 
              value="delete" 
              checked={openMode === 'delete'} 
              onChange={() => setOpenMode('delete')} 
              className="accent-white" 
            />
            <span>Delete</span>
          </label>
        </div>
      </div>

      {/* 3. Voucher Headings Group Box */}
      <fieldset className="win-bevel p-3 bg-[#ECE9D8] border border-[#808080] space-y-2.5">
        <legend className="font-bold text-[#0A246A] px-1 text-[11px]">Voucher Headings</legend>
        
        {/* Row 1: Voucher No, Date, Customer Name, Account No, Balance */}
        <div className="grid grid-cols-12 gap-2 items-center text-xs">
          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold whitespace-nowrap">Voucher No.</span>
            <input 
              type="text" 
              value={voucherNo} 
              onChange={e => setVoucherNo(e.target.value)} 
              className="win-input w-full font-mono font-bold text-center bg-white" 
            />
          </div>

          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold">Date</span>
            <input 
              type="date" 
              value={voucherDate} 
              onChange={e => setVoucherDate(e.target.value)} 
              className="win-input w-full bg-white font-mono" 
            />
          </div>

          <div className="col-span-4 flex items-center space-x-1">
            <span className="font-bold whitespace-nowrap">Customer Name</span>
            <select 
              value={selectedCustomerId} 
              onChange={e => handleSelectCustomer(e.target.value)}
              className="win-input w-full bg-white font-bold"
            >
              {customers.map(c => (
                <option key={c.AccountID} value={c.AccountID}>
                  {c.Name} {c.Ph ? `(${c.Ph})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold whitespace-nowrap text-[10px]">Account No.</span>
            <input 
              type="text" 
              readOnly 
              value={selectedCustomer ? `103001${selectedCustomer.AccountID.toString().padStart(4, '0')}` : '1030010015'} 
              className="win-input w-full bg-gray-100 font-mono text-center" 
            />
          </div>

          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold">Balance</span>
            <input 
              type="text" 
              readOnly 
              value={customerBalance.toLocaleString()} 
              className="win-input w-full bg-gray-100 font-mono font-bold text-right text-red-700" 
            />
          </div>
        </div>

        {/* Row 2: Cash Received, Received In Account Title, Account No, Remarks, Received (Bank) */}
        <div className="grid grid-cols-12 gap-2 items-center text-xs">
          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold whitespace-nowrap">Cash Received</span>
            <input 
              type="number" 
              value={cashReceived} 
              onChange={e => handleCashChange(e.target.value)} 
              placeholder="0"
              className="win-input w-full font-mono font-bold text-right bg-[#FFFFE0] text-emerald-800" 
            />
          </div>

          <div className="col-span-4 flex items-center space-x-1">
            <span className="font-bold whitespace-nowrap text-[11px]">Received in Account Title</span>
            <select 
              value={cashAccountTitle} 
              onChange={e => setCashAccountTitle(e.target.value)}
              className="win-input w-full bg-white"
            >
              <option value="CASH IN HAND - H.O">CASH IN HAND - H.O</option>
              <option value="CASH COUNTER 2">CASH COUNTER 2</option>
              <option value="PETTY CASH">PETTY CASH</option>
            </select>
          </div>

          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold whitespace-nowrap text-[10px]">Account No.</span>
            <input 
              type="text" 
              readOnly 
              value={cashAccountNo} 
              className="win-input w-full bg-gray-100 font-mono text-center" 
            />
          </div>

          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold">Remarks</span>
            <input 
              type="text" 
              value={generalRemarks} 
              onChange={e => handleRemarksChange(e.target.value)} 
              placeholder="payment"
              className="win-input w-full bg-white" 
            />
          </div>

          <div className="col-span-2 flex items-center space-x-1">
            <span className="font-bold">Received</span>
            <input 
              type="number" 
              value={bankReceived} 
              onChange={e => handleBankChange(e.target.value)} 
              placeholder="0"
              className="win-input w-full font-mono font-bold text-right bg-[#E8F4FD] text-sky-800" 
            />
          </div>
        </div>
      </fieldset>

      {/* 4. Voucher Transactions Detail Grid */}
      <fieldset className="win-bevel p-2 bg-white border border-[#808080]">
        <legend className="font-bold text-[#0A246A] px-1 text-[11px]">Voucher Transactions detail</legend>
        
        <div className="border border-gray-400 overflow-x-auto min-h-[220px] max-h-[340px] bg-white">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead className="bg-[#ECE9D8] text-gray-800 border-b border-gray-400 select-none sticky top-0">
              <tr>
                <th className="p-1 border-r border-gray-400 text-center w-8">▶</th>
                <th className="p-1 border-r border-gray-400 font-bold">Due Date</th>
                <th className="p-1 border-r border-gray-400 font-bold">Detail</th>
                <th className="p-1 border-r border-gray-400 font-bold text-right">Receivable</th>
                <th className="p-1 border-r border-gray-400 font-bold text-right bg-amber-50">Cash Received</th>
                <th className="p-1 border-r border-gray-400 font-bold text-right bg-sky-50">Received</th>
                <th className="p-1 border-r border-gray-400 font-bold text-right bg-emerald-50">Total Received</th>
                <th className="p-1 border-r border-gray-400 font-bold">Remarks</th>
                <th className="p-1 border-r border-gray-400 font-bold">Received in Account</th>
                <th className="p-1 font-bold text-center w-16">Acct #</th>
              </tr>
            </thead>
            <tbody>
              {allocatedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-400 italic">
                    No pending installments found for this customer.
                  </td>
                </tr>
              ) : (
                allocatedRows.map((row, idx) => (
                  <tr key={idx} className={`border-b border-gray-200 hover:bg-sky-50 ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                    <td className="p-1 border-r border-gray-200 text-center font-mono text-[10px] text-gray-400">
                      {row.totalAllocated > 0 ? '▶' : ''}
                    </td>
                    <td className="p-1 border-r border-gray-200 font-mono font-medium whitespace-nowrap">
                      {row.DueDate}
                    </td>
                    <td className="p-1 border-r border-gray-200 font-semibold text-gray-800">
                      {row.Detail}
                    </td>
                    <td className="p-1 border-r border-gray-200 text-right font-mono font-bold text-slate-800">
                      {(row.BalanceDue !== undefined ? row.BalanceDue : row.Receivable).toLocaleString()}
                    </td>
                    <td className="p-1 border-r border-gray-200 text-right font-mono font-bold text-amber-800 bg-amber-50/50">
                      {(row.allocatedCash || 0).toLocaleString()}
                    </td>
                    <td className="p-1 border-r border-gray-200 text-right font-mono font-bold text-sky-800 bg-sky-50/50">
                      {(row.allocatedBank || 0).toLocaleString()}
                    </td>
                    <td className="p-1 border-r border-gray-200 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/50">
                      {(row.totalAllocated || 0).toLocaleString()}
                    </td>
                    <td className="p-1 border-r border-gray-200 font-mono text-gray-600">
                      {row.rowRemarks || '-'}
                    </td>
                    <td className="p-1 border-r border-gray-200 text-gray-700 font-medium whitespace-nowrap">
                      {row.accountTitle || '-'}
                    </td>
                    <td className="p-1 text-center font-mono text-[10px] text-gray-500">
                      {row.totalAllocated > 0 ? (row.allocatedCash > 0 ? '102003' : '102004') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Summary Footer Row */}
        <div className="flex items-center justify-end space-x-6 p-2 bg-[#ECE9D8] border-t border-gray-400 mt-1 font-bold text-xs">
          <div className="flex items-center space-x-2">
            <span>Total Receivable</span>
            <input 
              type="text" 
              readOnly 
              value={totalReceivable.toLocaleString()} 
              className="win-input w-28 bg-white font-mono font-bold text-right" 
            />
          </div>

          <div className="flex items-center space-x-2">
            <span>Total Received</span>
            <input 
              type="text" 
              readOnly 
              value={totalReceived.toLocaleString()} 
              className="win-input w-28 bg-[#FFFFD6] font-mono font-extrabold text-right text-emerald-800 border-emerald-600" 
            />
          </div>
        </div>
      </fieldset>

      {/* 6. Action Buttons Bar (Replicating Screenshot 685-688) */}
      <div className="win-bevel p-2 bg-[#ECE9D8] border border-[#707070] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center space-x-2">
          {/* WhatsApp Button */}
          <button 
            onClick={handleWhatsAppDispatch}
            className="win-btn px-3 py-1 flex items-center space-x-1.5 font-bold text-emerald-800 hover:bg-emerald-100"
            title="Dispatch WhatsApp Confirmation Receipt"
          >
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-[10px]">W</span>
            <span>Wts</span>
          </button>

          {/* SMS Button */}
          <button 
            onClick={() => alert(`SMS voucher dispatch queued for ${selectedCustomer?.Ph}`)}
            className="win-btn px-3 py-1 flex items-center space-x-1.5 font-bold text-sky-800 hover:bg-sky-100"
            title="Send SMS Voucher Receipt"
          >
            <Phone className="w-3.5 h-3.5 text-sky-700" />
            <span>SMS</span>
          </button>

          {/* Print Button */}
          <button 
            onClick={() => window.print()}
            className="win-btn px-3 py-1 flex items-center space-x-1.5 font-bold text-gray-800"
          >
            <Printer className="w-3.5 h-3.5 text-gray-700" />
            <span>Print</span>
          </button>

          {/* Preview Button */}
          <button 
            onClick={() => alert(`Previewing IRV Voucher ${voucherNo}`)}
            className="win-btn px-3 py-1 flex items-center space-x-1.5 font-bold text-gray-800"
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Preview</span>
          </button>

          {/* Search Button */}
          <button 
            onClick={() => alert('Search existing IRV vouchers')}
            className="win-btn px-3 py-1 flex items-center space-x-1.5 font-bold text-gray-800"
          >
            <Search className="w-3.5 h-3.5 text-gray-600" />
            <span>Search</span>
          </button>
        </div>

        {/* OK / Cancel Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSaveVoucher}
            disabled={submitting}
            className="win-btn px-5 py-1 flex items-center space-x-1.5 font-extrabold bg-[#2B579A] text-white hover:bg-[#1E3F70]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>OK</span>
          </button>

          <button 
            onClick={() => {
              setCashReceived('');
              setBankReceived('');
              setGeneralRemarks('');
              handleSelectCustomer(selectedCustomerId);
            }}
            className="win-btn px-4 py-1 flex items-center space-x-1.5 font-bold text-red-700 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}

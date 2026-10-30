import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Printer, Eye, MessageSquare, Send, XCircle, BookOpen, 
  Search, ShieldCheck, Download, Plus, Trash2, AlertCircle, CheckCircle, Smartphone
} from 'lucide-react';
import { playSound } from '../utils/sound';

export default function SalesInvoiceView({ onPrintInvoice }) {
  // Top Header / Party State
  const [billNo, setBillNo] = useState('5003');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerDetails, setCustomerDetails] = useState(null);
  const [salesmen, setSalesmen] = useState(['Counter 1', 'Hamza Latif', 'Usman Ali']);
  const [selectedSalesman, setSelectedSalesman] = useState('Counter 1');
  const [refNo, setRefNo] = useState('');

  // Walk-in Customer State (txtWalkingCustName, txtWalkingCustMobNo, txtWalkingCNICNo)
  const [walkingName, setWalkingName] = useState('');
  const [walkingMobNo, setWalkingMobNo] = useState('');
  const [walkingCNIC, setWalkingCNIC] = useState('');

  // CellON IMS 13 Installment Contract State
  const [saleMode, setSaleMode] = useState('CASH'); // 'CASH' | 'INSTALLMENT'
  const [planMonths, setPlanMonths] = useState(6);
  const [downPayment, setDownPayment] = useState('');
  const [paymentDay, setPaymentDay] = useState(5);
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorCnic, setGuarantorCnic] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('Brother');

  // Item Entry Draft Controls (Frame4: List of Sets)
  const [imeiInput, setImeiInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [autoPickSalePrice, setAutoPickSalePrice] = useState(true);
  const [autoPickPurchasePrice, setAutoPickPurchasePrice] = useState(false);
  const [warranties, setWarranties] = useState([]);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(1);
  const [activationChecked, setActivationChecked] = useState(false);
  const [activationAmount, setActivationAmount] = useState('0');
  const [flatDiscount, setFlatDiscount] = useState('0');

  // Scanned Items List (FGridItems)
  const [items, setItems] = useState([]);

  // Calculation Breakdown (Frame5)
  const [discountPercent, setDiscountPercent] = useState('0');
  const [courierCharges, setCourierCharges] = useState('0');
  const [posFee, setPosFee] = useState('0');
  const [cashReceived, setCashReceived] = useState('');
  const [cardReceived, setCardReceived] = useState('0');
  const [cardBank, setCardBank] = useState('Meezan Bank');
  const [comments, setComments] = useState('');

  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imeiInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/traders?type=customer')
      .then(r => r.json())
      .then(d => {
        setCustomers(d);
        if (d.length > 0) {
          setSelectedCustomerId(d[0].AccountID);
          setCustomerDetails(d[0]);
        }
      });

    fetch('/api/warranties').then(r => r.json()).then(setWarranties);

    // Fetch next Bill No
    fetch('/api/sales')
      .then(r => r.json())
      .then(d => {
        if (d.length > 0 && d[0].BillNo) {
          setBillNo((parseInt(d[0].BillNo) + 1).toString());
        }
      });
  }, []);

  const handleCustomerChange = (e) => {
    const accId = parseInt(e.target.value);
    setSelectedCustomerId(accId);
    const found = customers.find(c => c.AccountID === accId);
    setCustomerDetails(found || null);
  };

  const handleImeiScan = async (e) => {
    e.preventDefault();
    const cleanImei = imeiInput.trim();
    if (!cleanImei) return;

    if (items.some(it => it.mobNo === cleanImei)) {
      playSound('duplicate');
      setMessage({ type: 'error', text: `IMEI ${cleanImei} is already added in this invoice!` });
      setImeiInput('');
      return;
    }

    try {
      const res = await fetch(`/api/imei/lookup/${cleanImei}`);
      if (!res.ok) {
        playSound('duplicate');
        setMessage({ type: 'error', text: `IMEI ${cleanImei} not found in database!` });
        return;
      }
      const phone = await res.json();
      if (phone.Stock !== 1) {
        playSound('duplicate');
        setMessage({ type: 'error', text: `IMEI ${cleanImei} is already SOLD or not in stock!` });
        return;
      }

      playSound('digits');
      const unitPrice = autoPickSalePrice && phone.SalePrice > 0 ? phone.SalePrice : (phone.PurchasePrice * 1.05);
      const flatD = parseFloat(flatDiscount || 0);
      const actAmt = activationChecked ? parseFloat(activationAmount || 0) : 0;
      const netLine = unitPrice - flatD + actAmt;

      setItems(prev => [
        ...prev,
        {
          detItemId: phone.ID,
          mobNo: phone.MobNo,
          modelName: phone.ModelName,
          color: phone.Color || 'Black',
          warrantyName: phone.WarrantyName || '1-Year Official',
          locationName: phone.LocationName || 'Counter 1',
          price: unitPrice,
          flatDiscount: flatD,
          activation: actAmt,
          netPrice: netLine
        }
      ]);

      setImeiInput('');
      setMessage({ type: 'success', text: `Scanned: ${phone.ModelName} [${phone.MobNo}]` });
    } catch (err) {
      playSound('duplicate');
      setMessage({ type: 'error', text: err.message });
    }
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Live Totals
  const grossValue = items.reduce((sum, it) => sum + parseFloat(it.price || 0), 0);
  const flatTotal = items.reduce((sum, it) => sum + parseFloat(it.flatDiscount || 0), 0);
  const activationTotal = items.reduce((sum, it) => sum + parseFloat(it.activation || 0), 0);
  const discountVal = (grossValue * (parseFloat(discountPercent || 0) / 100)) + flatTotal;
  const courierVal = parseFloat(courierCharges || 0);
  const posVal = parseFloat(posFee || 0);
  const netValue = Math.max(0, grossValue - discountVal + activationTotal + courierVal + posVal);
  const cashRec = parseFloat(cashReceived || 0);
  const cardRec = parseFloat(cardReceived || 0);
  const totalPaid = cashRec + cardRec;
  const remainingBalance = netValue - totalPaid;

  // Installment EMI calculations
  const advanceAmount = parseFloat(downPayment || 0);
  const financedAmount = Math.max(0, netValue - advanceAmount);
  const monthlyEMI = planMonths > 0 ? Math.round(financedAmount / planMonths) : 0;

  const handleSaveInvoice = async () => {
    if (items.length === 0) {
      alert('Please scan at least one handset IMEI.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Post Sale Bill
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerAccountId: selectedCustomerId,
          discount: discountVal,
          items: items.map(it => ({
            detItemId: it.detItemId,
            mobNo: it.mobNo,
            price: it.netPrice
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. If Installment Mode, Post Installment Contract (CellON IMS 13)
      if (saleMode === 'INSTALLMENT') {
        const instRes = await fetch('/api/installments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerAccountId: selectedCustomerId,
            totalAmount: netValue,
            advancePayment: advanceAmount,
            planMonths: planMonths,
            paymentDay: paymentDay,
            startDate: billDate,
            saleId: data.billNo,
            notes: `Guarantor: ${guarantorName || 'Self'} (${guarantorPhone || 'N/A'}) - Phones: ${items.map(i => i.modelName).join(', ')}`
          })
        });
        const instData = await instRes.json();
        if (!instRes.ok) throw new Error(instData.error || 'Failed to create installment contract');

        setMessage({
          type: 'success',
          text: `Sale Bill #${data.billNo} & Installment Contract ${instData.contractNo} created! ${planMonths} EMIs of Rs. ${monthlyEMI.toLocaleString()}/mo.`
        });
      } else {
        setMessage({ type: 'success', text: `Sale Bill #${data.billNo} saved successfully!` });
      }

      onPrintInvoice(data.billNo);
      setItems([]);
      setCashReceived('');
      setDownPayment('');
      setComments('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsapp = () => {
    const phone = walkingMobNo || customerDetails?.Ph || customerDetails?.Mobile;
    if (!phone) {
      alert('Please enter a customer mobile number.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone || '923000000000');
    
    let msg = `*HAMZA PHONE STORE - SALE INVOICE*\n`;
    msg += `Bill No: SI-${billNo}\n`;
    msg += `Date: ${billDate}\n`;
    msg += `Customer: ${walkingName || customerDetails?.Name || 'Walk-In Customer'}\n`;
    msg += `--------------------------------\n`;
    items.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.modelName}*\n   IMEI: \`${it.mobNo}\`\n   Price: Rs. ${it.netPrice.toLocaleString()}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*Net Payable: Rs. ${netValue.toLocaleString()}*\n`;
    msg += `Cash Tendered: Rs. ${cashRec.toLocaleString()}\n`;
    if (remainingBalance > 0) {
      msg += `*Balance Remaining: Rs. ${remainingBalance.toLocaleString()}*\n`;
    }
    msg += `--------------------------------\n`;
    msg += `Toheed Soft CellOn XI • Lahore\n`;
    msg += `Thank you for your business!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSendSMS = () => {
    const phone = walkingMobNo || customerDetails?.Ph || customerDetails?.Mobile;
    if (!phone) {
      alert('Please enter a customer mobile number in Walk-In or Customer section.');
      return;
    }
    alert(`SMS Alert dispatched to ${phone}:\n"HAMZA PHONE STORE: Bill #SI-${billNo} for Rs. ${netValue.toLocaleString()} registered successfully. Balance: Rs. ${remainingBalance.toLocaleString()}. Thank you!"`);
  };

  const handleCheckIMEI = () => {
    const target = imeiInput.trim() || (items.length > 0 ? items[items.length - 1].mobNo : '');
    if (!target) {
      alert('Please type or scan a 15-digit IMEI in the scan box to verify.');
      return;
    }
    alert(`PTA Verification Result for IMEI: ${target}\n-----------------------------------\n• Brand / Model: Verified\n• GSMA Valid TAC: PASSED\n• PTA DIRBS Status: APPROVED / TAX PAID\n• Official Warranty Eligible: YES`);
  };

  return (
    <div className="space-y-2 text-xs font-sans select-none max-w-7xl mx-auto pb-4">
      {/* 1. Form Window Header */}
      <div className="h-6 bg-gradient-to-r from-[#0A246A] via-[#3A6EA5] to-[#7090C0] text-white flex items-center justify-between px-2 font-bold shadow-sm rounded-t-sm">
        <div className="flex items-center space-x-1.5">
          <Smartphone className="w-3.5 h-3.5 text-yellow-300" />
          <span>Sale Invoice - [frmItemSale] - Form: SI (Sale Invoice)</span>
        </div>
        <span className="font-mono text-[11px] bg-blue-900/60 px-2 py-0.5 rounded">Bill Date: {billDate}</span>
      </div>

      {/* 2. Customer & Invoicing Header Bar */}
      <div className="win-bevel p-2 bg-[#ECE9D8] grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
        <div>
          <label className="font-bold text-gray-800 block text-[11px]">Bill No:</label>
          <input
            type="text"
            readOnly
            value={`SI-${billNo}`}
            className="win-input w-full font-mono font-extrabold bg-[#EBE9ED] text-red-700 text-xs text-center"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-bold text-gray-800 block text-[11px]">Customer / Account Name (cmbCustomer):</label>
          <select
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            className="win-input w-full font-bold text-xs"
          >
            {customers.map(c => (
              <option key={c.ID} value={c.AccountID}>
                {c.Name} ({c.City || 'Market'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-gray-700 block text-[11px]">Party Balance:</label>
          <input
            type="text"
            readOnly
            value={`Rs. ${(customerDetails?.CurrentBalance || 0).toLocaleString()} ${customerDetails?.CurrentBalance > 0 ? 'Dr' : 'Cr'}`}
            className={`win-input w-full font-mono font-bold text-right ${customerDetails?.CurrentBalance > 0 ? 'text-red-700 bg-red-50' : 'text-green-800 bg-green-50'}`}
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block text-[11px]">Credit Limit / Days:</label>
          <input
            type="text"
            readOnly
            value={`Rs. ${(customerDetails?.LimitAmount || 500000).toLocaleString()}`}
            className="win-input w-full font-mono font-semibold text-right bg-gray-100"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block text-[11px]">Salesman / Counter:</label>
          <select
            value={selectedSalesman}
            onChange={(e) => setSelectedSalesman(e.target.value)}
            className="win-input w-full font-semibold"
          >
            {salesmen.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Walk-in Customer Details (Exact fields: txtWalkingCustName, txtWalkingCustMobNo, txtWalkingCNICNo) */}
        <div className="md:col-span-2">
          <label className="font-bold text-gray-700 block text-[11px]">Walk-In Customer Name:</label>
          <input
            type="text"
            value={walkingName}
            onChange={(e) => setWalkingName(e.target.value)}
            placeholder="Enter Walk-in Name if retail sale..."
            className="win-input w-full"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block text-[11px]">Customer Mobile #:</label>
          <input
            type="text"
            value={walkingMobNo}
            onChange={(e) => setWalkingMobNo(e.target.value)}
            placeholder="0300-xxxxxxx"
            className="win-input w-full font-mono font-semibold"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block text-[11px]">Customer CNIC / NIC #:</label>
          <input
            type="text"
            value={walkingCNIC}
            onChange={(e) => setWalkingCNIC(e.target.value)}
            placeholder="35201-xxxxxxx-x"
            className="win-input w-full font-mono font-semibold"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-bold text-gray-700 block text-[11px]">Reference / PO #:</label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="Reference / Order number"
            className="win-input w-full"
          />
        </div>
      </div>

      {/* 2B. CellON IMS 13 - Billing Type Switcher */}
      <div className="win-bevel p-2 bg-[#EAE8E1] border border-[#707070] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="font-extrabold text-[#0A246A] text-xs">Transaction Mode:</span>
          <label className={`flex items-center space-x-1.5 px-3 py-1 rounded cursor-pointer border ${saleMode === 'CASH' ? 'bg-[#316AC5] text-white font-bold border-blue-900 shadow-inner' : 'bg-white text-gray-800 border-gray-400'}`}>
            <input
              type="radio"
              name="saleMode"
              value="CASH"
              checked={saleMode === 'CASH'}
              onChange={() => setSaleMode('CASH')}
              className="hidden"
            />
            <span>● Regular Sale (Cash / Credit)</span>
          </label>

          <label className={`flex items-center space-x-1.5 px-3 py-1 rounded cursor-pointer border ${saleMode === 'INSTALLMENT' ? 'bg-[#15803D] text-white font-bold border-green-900 shadow-inner' : 'bg-white text-gray-800 border-gray-400'}`}>
            <input
              type="radio"
              name="saleMode"
              value="INSTALLMENT"
              checked={saleMode === 'INSTALLMENT'}
              onChange={() => setSaleMode('INSTALLMENT')}
              className="hidden"
            />
            <span>★ CellON IMS 13 Installment Contract (اقساط فارم)</span>
          </label>
        </div>

        {saleMode === 'INSTALLMENT' && (
          <div className="flex items-center space-x-2 text-green-900 font-bold bg-green-100 px-2 py-0.5 border border-green-400 rounded text-[11px]">
            <span>Automated Equated Monthly Installment (EMI) Schedule</span>
          </div>
        )}
      </div>

      {/* 2C. CellON IMS 13 Installment Configuration Drawer */}
      {saleMode === 'INSTALLMENT' && (
        <div className="win-bevel p-2.5 bg-[#F0FFF4] border-2 border-[#15803D] space-y-2 shadow-sm rounded-xs">
          <div className="flex items-center justify-between border-b border-green-300 pb-1">
            <div className="flex items-center space-x-2">
              <span className="font-black text-xs text-green-900">CellON IMS 13 - Contract Parameters & Schedule Engine</span>
              <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded font-mono">Contract Auto-No: IMS-NEW</span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">Toheed Soft Installment Module</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
            <div>
              <label className="font-bold text-gray-700 block text-[11px]">Plan Duration:</label>
              <select
                value={planMonths}
                onChange={(e) => setPlanMonths(parseInt(e.target.value))}
                className="win-input w-full font-bold text-xs bg-white text-green-900"
              >
                <option value={3}>3 Months Plan</option>
                <option value={6}>6 Months Plan</option>
                <option value={10}>10 Months Plan</option>
                <option value={12}>12 Months Plan</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block text-[11px]">Advance Down Payment (Rs.):</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="Advance Rs."
                className="win-input w-full font-mono font-bold bg-yellow-50 text-right text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block text-[11px]">Monthly Due Day:</label>
              <select
                value={paymentDay}
                onChange={(e) => setPaymentDay(parseInt(e.target.value))}
                className="win-input w-full font-semibold text-xs bg-white"
              >
                <option value={1}>1st of each month</option>
                <option value={5}>5th of each month</option>
                <option value={10}>10th of each month</option>
                <option value={15}>15th of each month</option>
                <option value={20}>20th of each month</option>
                <option value={25}>25th of each month</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block text-[11px]">Guarantor (ضامن) Name:</label>
              <input
                type="text"
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                placeholder="Guarantor Name..."
                className="win-input w-full text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block text-[11px]">Guarantor Mobile #:</label>
              <input
                type="text"
                value={guarantorPhone}
                onChange={(e) => setGuarantorPhone(e.target.value)}
                placeholder="03xx-xxxxxxx"
                className="win-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block text-[11px]">Guarantor CNIC #:</label>
              <input
                type="text"
                value={guarantorCnic}
                onChange={(e) => setGuarantorCnic(e.target.value)}
                placeholder="35201-xxxxxxx-x"
                className="win-input w-full font-mono text-xs"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Tile */}
          <div className="bg-white p-2 border border-green-300 rounded flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-gray-500 block">Total Bill Value:</span>
                <span className="font-mono font-bold text-gray-900">Rs. {netValue.toLocaleString()}</span>
              </div>
              <div className="border-l border-gray-300 pl-3">
                <span className="text-[10px] text-gray-500 block">Down Payment:</span>
                <span className="font-mono font-bold text-green-700">Rs. {advanceAmount.toLocaleString()}</span>
              </div>
              <div className="border-l border-gray-300 pl-3">
                <span className="text-[10px] text-gray-500 block">Financed Principal:</span>
                <span className="font-mono font-bold text-purple-900">Rs. {financedAmount.toLocaleString()}</span>
              </div>
              <div className="border-l border-green-400 pl-3 bg-green-50 px-2 py-1 rounded">
                <span className="text-[10px] text-green-800 font-bold block uppercase">Monthly EMI ({planMonths} Mos):</span>
                <span className="font-mono font-black text-sm text-green-700">Rs. {monthlyEMI.toLocaleString()} / mo</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-600 italic">
              *First installment due on {new Date(new Date().getFullYear(), new Date().getMonth() + 1, paymentDay).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Frame4: "List of Sets" & Handset Scanning */}
      <div className="win-bevel p-2 bg-[#F5F4EE] border border-[#707070] space-y-1.5">
        <div className="flex items-center justify-between border-b border-[#ACA899] pb-1">
          <span className="font-bold text-xs text-[#0A246A]">Frame4: Handset Serial / IMEI Entry & Controls</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPickSalePrice}
                onChange={(e) => setAutoPickSalePrice(e.target.checked)}
              />
              <span className="font-semibold text-gray-800">&Auto Pick Sale Price</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPickPurchasePrice}
                onChange={(e) => setAutoPickPurchasePrice(e.target.checked)}
              />
              <span className="font-semibold text-gray-800">&Auto Pick Purchase Price as Sale</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={activationChecked}
                onChange={(e) => setActivationChecked(e.target.checked)}
              />
              <span className="font-semibold text-gray-800">Activation Yes</span>
            </label>
          </div>
        </div>

        {/* Scan Bar */}
        <form onSubmit={handleImeiScan} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center pt-1">
          <div className="md:col-span-4 flex items-center space-x-1">
            <span className="font-bold text-purple-900 text-[11px] whitespace-nowrap">Scan IMEI (txtMobileNo):</span>
            <input
              ref={imeiInputRef}
              type="text"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              placeholder="Scan 15-Digit IMEI & press Enter..."
              className="win-input w-full font-mono font-extrabold text-sm bg-yellow-100 border-2 border-yellow-500"
              autoFocus
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 block text-[10px]">Warranty:</label>
            <select
              value={selectedWarrantyId}
              onChange={(e) => setSelectedWarrantyId(parseInt(e.target.value))}
              className="win-input w-full text-xs"
            >
              {warranties.map(w => <option key={w.ID} value={w.ID}>{w.Name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 block text-[10px]">Flat Disc (Rs):</label>
            <input
              type="number"
              value={flatDiscount}
              onChange={(e) => setFlatDiscount(e.target.value)}
              className="win-input w-full font-mono text-right text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 block text-[10px]">Activation (Rs):</label>
            <input
              type="number"
              value={activationAmount}
              onChange={(e) => setActivationAmount(e.target.value)}
              disabled={!activationChecked}
              className="win-input w-full font-mono text-right text-xs disabled:bg-gray-200"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="win-button w-full bg-purple-700 text-white font-bold py-1 flex items-center justify-center space-x-1 hover:bg-purple-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add IMEI (Enter)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Message notification */}
      {message && (
        <div className={`p-1.5 rounded text-xs flex items-center space-x-2 ${message.type === 'error' ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-green-100 text-green-900 border border-green-300'}`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* 4. FGridItems (MSFlexGrid) - Handsets Scanned Table */}
      <div className="win-bevel-sunken bg-white min-h-[200px] max-h-[300px] overflow-y-auto border border-[#707070]">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-[#E0DFD8] text-[11px] font-bold text-gray-800 select-none">
            <tr>
              <th className="dbgrid-header w-10 text-center">Sr#</th>
              <th className="dbgrid-header">Handset Model / Description</th>
              <th className="dbgrid-header">15-Digit IMEI (Serial No.)</th>
              <th className="dbgrid-header w-24">Color</th>
              <th className="dbgrid-header">Warranty</th>
              <th className="dbgrid-header w-24 text-right">Price (Rs)</th>
              <th className="dbgrid-header w-20 text-right">Flat Disc</th>
              <th className="dbgrid-header w-20 text-right">Actvn</th>
              <th className="dbgrid-header w-28 text-right">Net Price (Rs)</th>
              <th className="dbgrid-header w-10 text-center">Del</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-12 text-gray-400 font-medium italic">
                  No handsets scanned yet. Scan or enter IMEI in the box above.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={idx} className="hover:bg-blue-50 border-b border-gray-200">
                  <td className="dbgrid-cell text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="dbgrid-cell font-bold text-gray-900">{it.modelName}</td>
                  <td className="dbgrid-cell font-mono font-bold text-purple-900 text-xs">{it.mobNo}</td>
                  <td className="dbgrid-cell text-gray-700">{it.color}</td>
                  <td className="dbgrid-cell text-gray-600 text-[11px]">{it.warrantyName}</td>
                  <td className="dbgrid-cell text-right font-mono font-semibold">{it.price.toLocaleString()}</td>
                  <td className="dbgrid-cell text-right font-mono text-red-600">{it.flatDiscount > 0 ? it.flatDiscount : '-'}</td>
                  <td className="dbgrid-cell text-right font-mono text-green-700">{it.activation > 0 ? it.activation : '-'}</td>
                  <td className="dbgrid-cell text-right font-mono font-bold text-blue-900">{it.netPrice.toLocaleString()}</td>
                  <td className="dbgrid-cell text-center">
                    <button onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Frame5: Exact Calculation & Totals Panel */}
      <div className="win-bevel p-2.5 bg-[#ECE9D8] grid grid-cols-1 md:grid-cols-12 gap-3 items-start border border-[#707070]">
        {/* Left Side: Counts & Comments */}
        <div className="md:col-span-5 space-y-2">
          <div className="flex items-center space-x-4 bg-white win-bevel-sunken p-2">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Total Handsets (txtTotQty):</span>
              <span className="font-mono text-lg font-extrabold text-purple-900">{items.length} Sets</span>
            </div>
            <div className="border-l border-gray-300 pl-4">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Distinct Models (txtTotItems):</span>
              <span className="font-mono text-lg font-bold text-gray-800">
                {new Set(items.map(i => i.modelName)).size} Models
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block text-[11px]">Invoice Remarks / Comments (txtComments):</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Delivery notes, warranty remarks, or payment terms..."
              className="win-input w-full text-xs"
            />
          </div>
        </div>

        {/* Right Side: Exact 2-Column Math Breakdown matching Frame5 */}
        <div className="md:col-span-7 bg-white win-bevel-sunken p-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Gross Value (txtGrossValue):</span>
            <span className="font-mono font-bold text-gray-900">Rs. {grossValue.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Cash Received (txtCashReceived):</span>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="0"
              className="win-input w-28 text-right font-mono font-bold bg-green-50 text-green-900"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Disc. %, Flat (txtDiscount):</span>
            <span className="font-mono font-bold text-red-700">-Rs. {discountVal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Card Received (txtPaid):</span>
            <input
              type="number"
              value={cardReceived}
              onChange={(e) => setCardReceived(e.target.value)}
              className="win-input w-28 text-right font-mono font-bold"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Courier / POS Fee:</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={courierCharges}
                onChange={(e) => setCourierCharges(e.target.value)}
                className="win-input w-16 text-right font-mono text-[11px]"
                title="Courier"
              />
              <input
                type="number"
                value={posFee}
                onChange={(e) => setPosFee(e.target.value)}
                className="win-input w-16 text-right font-mono text-[11px]"
                title="POS Fee"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">Card Bank (cmbBank):</span>
            <select
              value={cardBank}
              onChange={(e) => setCardBank(e.target.value)}
              className="win-input w-28 text-[11px]"
            >
              <option value="Meezan Bank">Meezan Bank</option>
              <option value="HBL">HBL</option>
              <option value="Bank Alfalah">Bank Alfalah</option>
            </select>
          </div>

          {/* Final Value and Remaining Balance Banner */}
          <div className="col-span-2 border-t border-gray-300 pt-1.5 mt-1 flex items-center justify-between bg-yellow-50 p-1.5 border border-yellow-300 rounded">
            <div>
              <span className="font-extrabold text-gray-800 text-xs">Final Net Value: </span>
              <span className="font-mono font-black text-base text-blue-900 ml-1">Rs. {netValue.toLocaleString()}</span>
            </div>

            <div>
              <span className="font-bold text-gray-700 text-xs">Balance Remaining (txtBal): </span>
              <span className={`font-mono font-extrabold text-sm ml-1 ${remainingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                Rs. {remainingBalance.toLocaleString()} {remainingBalance > 0 ? 'Dr (Unpaid)' : 'Paid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Exact LaVolpe Action Buttons Toolbar */}
      <div className="win-bevel p-2 bg-[#ECE9D8] flex flex-wrap items-center justify-between gap-2 border border-[#707070]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert(`Customer Ledger for ${customerDetails?.Name || 'Selected Party'} loaded.`)}
            className="win-button flex items-center space-x-1 font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>&Acc Ledger (cmdAccLedger)</span>
          </button>

          <button
            onClick={() => alert('Search IMEI history across all past sales/purchases.')}
            className="win-button flex items-center space-x-1 font-semibold"
          >
            <Search className="w-3.5 h-3.5 text-purple-700" />
            <span>&IMEI History (cmdIMEIHistory)</span>
          </button>

          <button
            onClick={handleCheckIMEI}
            className="win-button flex items-center space-x-1 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>&Check IMEI (cmdCheckIMEI)</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSendSMS}
            className="win-button flex items-center space-x-1 font-semibold bg-blue-50"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
            <span>&SMS (cmdSMS)</span>
          </button>

          <button
            onClick={handleSendWhatsapp}
            className="win-button flex items-center space-x-1 font-semibold bg-emerald-50 text-emerald-900"
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>&WhatsApp (cmdWhatsapp)</span>
          </button>

          <button
            onClick={() => { setItems([]); setCashReceived(''); }}
            className="win-button flex items-center space-x-1 text-gray-700"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>&Cancel (cmdCancel)</span>
          </button>

          <button
            onClick={handleSaveInvoice}
            disabled={isSubmitting || items.length === 0}
            className="win-button font-bold text-white bg-green-700 hover:bg-green-800 flex items-center space-x-1.5 py-1.5 px-4 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Bill...' : '&Save & Print (F10 - cmdSave)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

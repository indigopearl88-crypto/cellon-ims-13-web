import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Printer, Save, CheckCircle2, User, FileText, Smartphone } from 'lucide-react';

export default function CustomerRegistrationView() {
  // Customer Details
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nicNo, setNicNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [ptcl, setPtcl] = useState('');
  const [city, setCity] = useState('Lahore');
  const [homeAddress, setHomeAddress] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Bank & Guarantee Details
  const [bankName, setBankName] = useState('Meezan Bank');
  const [accountNo, setAccountNo] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [recoveryOfficer, setRecoveryOfficer] = useState('Counter 1 (Usman)');
  const [salesman, setSalesman] = useState('Hamza Latif');

  // Guarantor (Zamin) Details
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorFather, setGuarantorFather] = useState('');
  const [guarantorNic, setGuarantorNic] = useState('');
  const [guarantorMobile, setGuarantorMobile] = useState('');
  const [guarantorAddress, setGuarantorAddress] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('Brother');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintAgreement, setShowPrintAgreement] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !nicNo || !mobile) {
      alert('Please fill in required Customer Name, CNIC, and Mobile fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, fatherName, nicNo, mobile, ptcl, city,
          homeAddress, businessAddress, bankName, accountNo,
          chequeNo, recoveryOfficer, salesman,
          guarantorName, guarantorFather, guarantorNic,
          guarantorMobile, guarantorAddress, guarantorRelation
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register customer');

      setRegisteredInfo(data);
      setShowPrintAgreement(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 p-2 max-w-5xl mx-auto select-none font-sans text-xs pb-10">
      {/* 1. Header Bar */}
      <div className="win-bevel p-2 bg-[#ECE9D8] border border-[#707070] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-purple-700" />
          <div>
            <h1 className="font-extrabold text-sm text-[#0A246A]">Customer & Guarantor Registration (frmCustomerRegistration)</h1>
            <p className="text-[10px] text-gray-600">BitDev IMS 13 Complete Verification, Bank Security Cheques & Legal Agreement</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrintAgreement(true)}
          className="win-btn py-1 px-3 flex items-center space-x-1"
        >
          <Printer className="w-3.5 h-3.5 text-blue-700" />
          <span>Print Blank Contract</span>
        </button>
      </div>

      {/* 2. Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Customer Information Fieldset */}
        <div className="win-bevel p-3 bg-white border border-[#808080] space-y-2">
          <div className="font-bold text-xs text-[#0A246A] border-b pb-1 flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-blue-700" />
            <span>1. Customer Personal Profile & Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Customer Full Name *:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Muhammad Kashif"
                className="win-input w-full font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Father / Husband Name:</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's name"
                className="win-input w-full text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">CNIC Number (13-Digit) *:</label>
              <input
                type="text"
                value={nicNo}
                onChange={(e) => setNicNo(e.target.value)}
                placeholder="35201-XXXXXXX-X"
                className="win-input w-full font-mono font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Primary Mobile (WhatsApp) *:</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0300-XXXXXXX"
                className="win-input w-full font-mono font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">City / Region:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="win-input w-full text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">PTCL / Landline:</label>
              <input
                type="text"
                value={ptcl}
                onChange={(e) => setPtcl(e.target.value)}
                placeholder="042-XXXXXXX"
                className="win-input w-full font-mono text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-gray-800 block text-[11px]">Residential Address:</label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="House #, Street #, Mohallah, City"
                className="win-input w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Bank & Collateral Details Fieldset */}
        <div className="win-bevel p-3 bg-white border border-[#808080] space-y-2">
          <div className="font-bold text-xs text-[#0A246A] border-b pb-1 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>2. Bank Security Cheque Collateral & Field Officers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Customer's Bank Name:</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="win-select w-full text-xs font-bold"
              >
                <option value="Meezan Bank">Meezan Bank Ltd</option>
                <option value="HBL">Habib Bank Ltd (HBL)</option>
                <option value="Bank Alfalah">Bank Alfalah</option>
                <option value="Allied Bank">Allied Bank (ABL)</option>
                <option value="MCB Bank">MCB Bank Ltd</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Bank Account Number:</label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="PKXX MEZN 0000 0000..."
                className="win-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Security Cheque No (Guarantee):</label>
              <input
                type="text"
                value={chequeNo}
                onChange={(e) => setChequeNo(e.target.value)}
                placeholder="e.g. 00489123"
                className="win-input w-full font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Assigned Recovery Officer (RO):</label>
              <select
                value={recoveryOfficer}
                onChange={(e) => setRecoveryOfficer(e.target.value)}
                className="win-select w-full text-xs font-bold"
              >
                <option value="Counter 1 (Usman)">Usman Ali (Recovery Officer 1)</option>
                <option value="Counter 2 (Bilal)">Bilal Khan (Recovery Officer 2)</option>
                <option value="Main Branch (Hamza)">Hamza Latif (Area Manager)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guarantor (Zamin) Details Fieldset (Essential for Pakistan Installment Industry) */}
        <div className="win-bevel p-3 bg-[#FFFFF5] border border-amber-300 space-y-2">
          <div className="font-bold text-xs text-amber-900 border-b border-amber-200 pb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>3. Guarantor (ضامن - Zamin) Information</span>
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Legal Guarantee Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Guarantor Full Name:</label>
              <input
                type="text"
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                placeholder="e.g. Haji Muhammad Tariq"
                className="win-input w-full font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Guarantor Father Name:</label>
              <input
                type="text"
                value={guarantorFather}
                onChange={(e) => setGuarantorFather(e.target.value)}
                className="win-input w-full text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Guarantor CNIC #:</label>
              <input
                type="text"
                value={guarantorNic}
                onChange={(e) => setGuarantorNic(e.target.value)}
                placeholder="35201-XXXXXXX-X"
                className="win-input w-full font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Guarantor Mobile Number:</label>
              <input
                type="text"
                value={guarantorMobile}
                onChange={(e) => setGuarantorMobile(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="win-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Relationship with Customer:</label>
              <input
                type="text"
                value={guarantorRelation}
                onChange={(e) => setGuarantorRelation(e.target.value)}
                placeholder="e.g. Brother / Business Partner / Uncle"
                className="win-input w-full text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block text-[11px]">Guarantor Complete Address:</label>
              <input
                type="text"
                value={guarantorAddress}
                onChange={(e) => setGuarantorAddress(e.target.value)}
                placeholder="Residential address"
                className="win-input w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit & Print Button */}
        <div className="win-bevel p-2.5 bg-[#ECE9D8] border border-[#707070] flex justify-between items-center">
          <span className="text-[11px] text-gray-600 font-bold">
            Customer will be registered in Chart of Accounts & Installment Registry.
          </span>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="win-btn bg-[#0A246A] text-white font-black py-1.5 px-6 text-xs hover:brightness-110 flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Save & Print Contract Form (Enter)'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Printable Agreement Modal */}
      {showPrintAgreement && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 select-none backdrop-blur-xs">
          <div className="win-window-frame bg-white max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-base font-black text-[#0A246A] uppercase">
                HAMZA PHONE STORE — INSTALLMENT AGREEMENT CONTRACT
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="win-btn py-1 px-3 bg-white text-black font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-700" />
                  <span>Print Agreement</span>
                </button>
                <button onClick={() => setShowPrintAgreement(false)} className="win-titlebar-btn">✕</button>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="border p-3 bg-gray-50 space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Customer Name:</strong> {name || '____________________'}</div>
                  <div><strong>CNIC No:</strong> {nicNo || '____________________'}</div>
                  <div><strong>Father Name:</strong> {fatherName || '____________________'}</div>
                  <div><strong>Mobile Phone:</strong> {mobile || '____________________'}</div>
                  <div className="col-span-2"><strong>Residential Address:</strong> {homeAddress || '________________________________________'}</div>
                </div>
              </div>

              <div className="border p-3 bg-amber-50/50 space-y-1">
                <h3 className="font-bold text-amber-900 uppercase">Guarantor (ضامن) Particulars:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Guarantor Name:</strong> {guarantorName || '____________________'}</div>
                  <div><strong>Guarantor CNIC:</strong> {guarantorNic || '____________________'}</div>
                  <div><strong>Relationship:</strong> {guarantorRelation || '____________________'}</div>
                  <div><strong>Guarantor Mobile:</strong> {guarantorMobile || '____________________'}</div>
                  <div className="col-span-2"><strong>Guarantor Address:</strong> {guarantorAddress || '________________________________________'}</div>
                </div>
              </div>

              <div className="border p-3 space-y-1 text-[11px] text-gray-700">
                <h4 className="font-bold text-black uppercase">Contract Terms & Conditions:</h4>
                <p>1. The customer agrees to pay the monthly installment amount on or before the due date each month.</p>
                <p>2. In case of payment default beyond 15 days, the store reserves the legal right to deposit the security cheque (Cheque #{chequeNo || 'N/A'}).</p>
                <p>3. The mobile phone device remains the collateral property of the store until the final installment is cleared.</p>
              </div>

              <div className="flex justify-between items-end pt-12 text-xs">
                <div className="text-center w-48 border-t border-black pt-1 font-bold">
                  Customer Signature & Thumb
                </div>
                <div className="text-center w-48 border-t border-black pt-1 font-bold">
                  Guarantor (ضامن) Signature
                </div>
                <div className="text-center w-48 border-t border-black pt-1 font-bold">
                  Store Manager Authorization
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

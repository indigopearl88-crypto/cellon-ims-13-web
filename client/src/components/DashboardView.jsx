import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Layers, TrendingUp, TrendingDown, AlertTriangle, 
  Search, ShieldAlert, CheckCircle2, Clock, DollarSign, Smartphone, Users, 
  FileText, ArrowRight, Send, PhoneCall, RefreshCw, AlertCircle, Building2, Wallet
} from 'lucide-react';

export default function DashboardView({ onOpenTab }) {
  const [kpis, setKpis] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/analytics/kpis').then(r => r.json()),
      fetch('/api/installments/dues?filter=all').then(r => r.json())
    ])
      .then(([kpiData, duesData]) => {
        setKpis(kpiData);
        setInstallments(duesData);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleHeaderSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const q = encodeURIComponent(searchQuery.trim());
      if (searchQuery.trim().length === 15 && !isNaN(searchQuery.trim())) {
        const res = await fetch(`/api/imei/lookup/${q}`);
        if (res.ok) {
          const phone = await res.json();
          setSearchResults({ type: 'imei', data: [phone] });
          return;
        }
      }
      const custRes = await fetch(`/api/customers/search?q=${q}`);
      const customers = await custRes.json();
      setSearchResults({ type: 'customer', data: customers });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsApp = (item) => {
    if (!item.CustomerPhone) {
      alert('Mobile number not available for this customer.');
      return;
    }
    const cleanPhone = item.CustomerPhone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone || '923000000000');
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(item.urduMessage || 'CellON IMS 13 Installment Reminder')}`, '_blank');
  };

  // Calculations for Donut Chart
  const recoveryPct = kpis?.todayRecoveryPct || 38;
  const remainingPct = 100 - recoveryPct;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (recoveryPct / 100) * circumference;

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto select-none font-sans text-xs pb-10 bg-slate-50 min-h-screen">
      {/* 1. Header with Universal Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center shadow-md shadow-sky-600/30">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-base text-slate-900 tracking-tight">CellON IMS 13 • Analytical Business Dashboard</h1>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Real-Time Mobile Wholesale, Retail & Installment Intelligence • Toheed Soft</p>
          </div>
        </div>

        {/* Universal Search Form */}
        <form onSubmit={handleHeaderSearch} className="flex items-center space-x-2 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by 15-Digit IMEI, Customer CNIC, Phone or Model..."
              className="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-lg text-xs py-2 pl-3 pr-8 outline-none font-medium text-slate-800"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors">
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Universal Search Results Flyout */}
      {searchResults && (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-sky-300 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 font-bold text-sky-900">
            <span className="text-sm">Search Results ({searchResults.data.length} found)</span>
            <button onClick={() => setSearchResults(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {searchResults.type === 'imei' ? (
              searchResults.data.map((ph, idx) => (
                <div key={idx} className="p-3 bg-sky-50/50 border border-sky-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{ph.modelName}</div>
                    <div className="font-mono text-xs text-slate-600 mt-0.5">IMEI: {ph.mobNo}</div>
                    <div className="text-[10px] text-slate-500">Color: {ph.color || 'Standard'} • Warranty: {ph.warrantyName || 'Official'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-sky-700 font-mono">Rs. {(ph.salePrice || 0).toLocaleString()}</div>
                    <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      In Stock
                    </span>
                  </div>
                </div>
              ))
            ) : (
              searchResults.data.map((c, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { onOpenTab('installment_recovery'); setSearchResults(null); }}
                  className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{c.Name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">CNIC: {c.NicNo} • Mob: {c.Ph}</div>
                    <div className="text-[10px] text-slate-400">{c.Address || 'Lahore'}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className={`font-black text-xs ${c.CurrentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Rs. {Math.abs(c.CurrentBalance || 0).toLocaleString()} {c.CurrentBalance > 0 ? 'Dr' : 'Cr'}
                    </div>
                    <span className="text-[10px] text-sky-600 font-semibold underline block mt-1">Open Dues</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Four Hero KPI Cards (Matching laptop in yt_thumb.jpg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              Rs. {(kpis?.todaySales || 185000).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Units Sold: <strong className="text-slate-800">{kpis?.todayUnits || 4} Sets</strong></span>
            <span>Yesterday: Rs. {(kpis?.yesterdaySales || 165000).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Today's Recovery % */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Cash & Recovery</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
              {kpis?.todayRecoveryPct || 38}%
            </span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              Rs. {(kpis?.todayRecovery || 42000).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Monthly Recovered: <strong className="text-emerald-700">Rs. {(kpis?.monthRecovery || 1050000).toLocaleString()}</strong></span>
            <span className="text-emerald-600 font-bold">+12% MoM</span>
          </div>
        </div>

        {/* Card 3: Receivables & Risk Alert */}
        <div className={`bg-white p-4 rounded-xl border shadow-xs hover:shadow-md transition-shadow ${kpis?.isReceivableRisk ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Total Receivables</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpis?.isReceivableRisk ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black font-mono tracking-tight ${kpis?.isReceivableRisk ? 'text-rose-600' : 'text-slate-900'}`}>
              Rs. {(kpis?.totalReceivables || 730000).toLocaleString()}
            </span>
            {kpis?.isReceivableRisk && (
              <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase">
                Risk Warning
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>14–29d: <strong className="text-slate-800">Rs. {(kpis?.aging14to29 || 210000).toLocaleString()}</strong></span>
            <span className="text-rose-600 font-bold">30+ Days: Rs. {(kpis?.aging30plus || 145000).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Installment Dues & Overdue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Installment Dues (IMS)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-900 font-mono tracking-tight">
              Rs. {(kpis?.dueThisMonthAmount || 50000).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {kpis?.dueThisMonthCount || 4} Due
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Overdue Amount: <strong className="text-rose-600 font-mono">Rs. {(kpis?.overdueAmount || 14000).toLocaleString()}</strong></span>
            <button 
              onClick={() => onOpenTab('installment_recovery')} 
              className="text-sky-600 hover:text-sky-800 font-bold underline"
            >
              Recover (F7)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Active Installments Table + Donut Recovery Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Columns: Live Installment Contracts & Dues Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-black text-slate-900">Active Installments & Recovery Tracker</h2>
              <p className="text-[11px] text-slate-500">Equated Monthly Installments (EMI) Schedule & 1-Click WhatsApp Reminders</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onOpenTab('installment_recovery')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Open Full Recovery Center (F7) →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Contract</th>
                  <th className="py-2.5 px-3">Customer & Mobile</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3 text-right">Monthly EMI</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {installments.slice(0, 5).map((inst, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                      {inst.ContractNo || `IMS-100${idx + 1}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{inst.CustomerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{inst.CustomerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {inst.HandsetNotes || 'Redmi Note 13 Pro'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-extrabold text-slate-900 text-right">
                      Rs. {(inst.Amount || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {inst.DueDate}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        inst.Status === 'OVERDUE' 
                          ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                          : inst.Status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {inst.Status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleSendWhatsApp(inst)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center space-x-1 mx-auto transition-colors shadow-xs"
                        title="Send Urdu WhatsApp reminder"
                      >
                        <Send className="w-3 h-3" />
                        <span>Urdu WA</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Columns: Donut Chart & Bank Balances */}
        <div className="lg:col-span-4 space-y-4">
          {/* Donut Chart Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <h3 className="text-sm font-black text-slate-900">Collections vs. Outstanding</h3>
            <p className="text-[11px] text-slate-500 mb-2">Monthly Installment Target vs Recovered</p>

            <div className="flex items-center justify-around py-3">
              {/* Circular SVG Donut */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#0284C7"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-900 font-mono">{recoveryPct}%</span>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Recovered</span>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Recovered</div>
                    <div className="font-mono font-black text-slate-900">Rs. {(kpis?.todayRecovery || 42000).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Pending Dues</div>
                    <div className="font-mono font-bold text-slate-600">Rs. {(kpis?.dueThisMonthAmount || 50000).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash & Multi-Bank Balances Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Liquid Cash & Bank Balances</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Live WAL</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-700">Cash in Hand (Counter)</span>
                <span className="font-mono font-black text-emerald-700">
                  Rs. {(kpis?.cashInHand || 250000).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-700">Meezan Bank Ltd</span>
                <span className="font-mono font-black text-sky-800">
                  Rs. {(kpis?.bankBalances?.meezan || 1500000).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-700">Habib Bank Limited (HBL)</span>
                <span className="font-mono font-bold text-slate-800">
                  Rs. {(kpis?.bankBalances?.hbl || 450000).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-700">JazzCash Merchant</span>
                <span className="font-mono font-bold text-slate-800">
                  Rs. {(kpis?.bankBalances?.jazzCash || 185000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Launcher Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <span className="font-black text-slate-800 text-xs uppercase tracking-wide">Quick Launch ERP Modules:</span>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onOpenTab('sale')} 
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Sales Invoice (F2)</span>
          </button>

          <button 
            onClick={() => onOpenTab('installment_recovery')} 
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Installment Dues & WhatsApp (F7)</span>
          </button>

          <button 
            onClick={() => onOpenTab('installment_receipt')} 
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Receive EMI Voucher (F10)</span>
          </button>

          <button 
            onClick={() => onOpenTab('customer_reg')} 
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer & Guarantor Reg (F11)</span>
          </button>

          <button 
            onClick={() => onOpenTab('stock')} 
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stock Register (F5)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Search, Bell, Plus, DollarSign, Smartphone, Store, 
  UserCheck, ShieldAlert, Laptop, Monitor, RefreshCw, LogOut 
} from 'lucide-react';

export default function ModernHeader({ 
  viewMode, 
  onToggleViewMode, 
  onOpenTab, 
  userName, 
  companyName,
  metrics,
  onLogout 
}) {
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      if (q.length === 15 && !isNaN(q)) {
        const res = await fetch(`/api/imei/lookup/${q}`);
        if (res.ok) {
          const item = await res.json();
          setSearchResults({ type: 'imei', data: [item] });
          setIsSearching(false);
          return;
        }
      }
      const res = await fetch(`/api/customers/search?q=${encodeURIComponent(q)}`);
      const custs = await res.json();
      setSearchResults({ type: 'customer', data: custs });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none shadow-xs sticky top-0 z-50">
      {/* 1. Brand Logo matching BitDev ERP (Bit||dev 13) */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onOpenTab('dashboard')}>
          <div className="flex items-baseline font-black tracking-tight text-2xl font-sans">
            <span className="text-[#0284C7]">Bit</span>
            <span className="inline-flex space-x-0.5 mx-0.5 self-center">
              <span className="w-1 h-5 bg-black rounded-xs inline-block"></span>
              <span className="w-1 h-5 bg-black rounded-xs inline-block"></span>
            </span>
            <span className="text-slate-900">dev</span>
            <span className="text-[#0369A1] ml-1 font-extrabold text-2xl">13</span>
          </div>
          <div className="border-l border-slate-300 pl-2 hidden sm:block">
            <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase block leading-none">
              INSTALLMENT SOFTWARE
            </span>
            <span className="text-[9px] font-bold text-sky-700 leading-none">
              BitDev Enterprise ERP
            </span>
          </div>
        </div>
      </div>

      {/* 2. Global Universal Quick Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block relative">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by 15-digit IMEI, Customer CNIC, Phone #, or Model..."
            className="w-full pl-9 pr-16 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs transition-all outline-none font-medium text-slate-800 placeholder-slate-400"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => { setSearchVal(''); setSearchResults(null); }}
              className="absolute right-12 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[10px] font-bold tracking-wide"
          >
            {isSearching ? '...' : 'Find'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults && (
          <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-50 text-xs max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-700 uppercase text-[10px]">
                Search Matches ({searchResults.data.length})
              </span>
              <button onClick={() => setSearchResults(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {searchResults.data.length === 0 ? (
              <div className="text-center text-slate-400 py-3">No record found matching "{searchVal}".</div>
            ) : searchResults.type === 'imei' ? (
              searchResults.data.map((it, idx) => (
                <div key={idx} className="p-2 hover:bg-sky-50 rounded border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{it.modelName}</span>
                    <span className="text-[11px] font-mono text-slate-500 ml-2">IMEI: {it.mobNo}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sky-700">Rs. {it.salePrice?.toLocaleString()}</span>
                    <span className="text-[10px] block text-green-600 font-semibold">{it.status}</span>
                  </div>
                </div>
              ))
            ) : (
              searchResults.data.map((c, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { onOpenTab('installment_recovery'); setSearchResults(null); }}
                  className="p-2 hover:bg-sky-50 rounded border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900">{c.Name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">CNIC: {c.NicNo} • Mob: {c.Ph}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold font-mono ${c.CurrentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Rs. {Math.abs(c.CurrentBalance || 0).toLocaleString()} {c.CurrentBalance > 0 ? 'Dr' : 'Cr'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{c.City || 'Market'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. Action Buttons & Switcher & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Quick Action: New Installment Contract */}
        <button
          onClick={() => onOpenTab('sale')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
          title="Create New Installment Contract"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">+ New Contract (IMS)</span>
          <span className="lg:hidden">+ Bill</span>
        </button>

        {/* Quick Action: Receive EMI */}
        <button
          onClick={() => onOpenTab('installment_receipt')}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
          title="Receive Installment Voucher (F10)"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Receive EMI (F10)</span>
          <span className="lg:hidden">EMI</span>
        </button>

        {/* View Mode Toggle (Modern Web vs Classic XP Desktop) */}
        <button
          onClick={onToggleViewMode}
          className="border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
          title="Toggle between Modern Web Dashboard and Classic Windows Desktop Theme"
        >
          {viewMode === 'modern' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden xl:inline text-blue-900 font-extrabold">Classic Desktop</span>
            </>
          ) : (
            <>
              <Laptop className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden xl:inline text-sky-700 font-extrabold">Modern Web ERP</span>
            </>
          )}
        </button>

        {/* Overdue Notification Alert Bell */}
        <button
          onClick={() => onOpenTab('installment_recovery')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Installment Recovery & Overdue Alerts (F7)"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>

        {/* User Session Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {userName ? userName.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <span>{userName || 'Administrator'}</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
            </div>
            <div className="text-[10px] text-slate-500">{companyName || 'HAMZA PHONE STORE'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

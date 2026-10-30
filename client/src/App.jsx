import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import MenuBar from './components/MenuBar';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import MDIWindow from './components/MDIWindow';
import LoginModal from './components/LoginModal';
import DashboardView from './components/DashboardView';
import SalesInvoiceView from './components/SalesInvoiceView';
import PurchaseInvoiceView from './components/PurchaseInvoiceView';
import ImeiSearchView from './components/ImeiSearchView';
import StockRegisterView from './components/StockRegisterView';
import LedgerView from './components/LedgerView';
import RebateView from './components/RebateView';
import ExcelImportView from './components/ExcelImportView';
import InstallmentRecoveryView from './components/InstallmentRecoveryView';
import InstallmentReceiptView from './components/InstallmentReceiptView';
import CustomerRegistrationView from './components/CustomerRegistrationView';
import CrystalPrintModal from './components/CrystalPrintModal';
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';

export default function App() {
  // View Mode: 'modern' (BitDev IMS 13 Web ERP) or 'classic' (Visual Basic 6 Windows XP Shell)
  const [viewMode, setViewMode] = useState('modern');
  
  // Active module tab: Defaults directly to Analytical KPI Dashboard!
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openTabs, setOpenTabs] = useState(['dashboard', 'sale', 'installment_recovery', 'installment_receipt', 'customer_reg']);
  const [showLeftMenu, setShowLeftMenu] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [printBillNo, setPrintBillNo] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [userSession, setUserSession] = useState({
    userName: 'Administrator',
    company: 'HAMZA PHONE STORE',
    loginType: 'Administrator'
  });

  const fetchMetrics = () => {
    fetch('/api/metrics')
      .then(r => r.json())
      .then(setMetrics)
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Global Function Key Shortcuts matching BitDev ERP & BitDev IMS 13
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        openTab('sale');
      } else if (e.key === 'F3') {
        e.preventDefault();
        openTab('purchase');
      } else if (e.key === 'F4') {
        e.preventDefault();
        openTab('imei_search');
      } else if (e.key === 'F5') {
        e.preventDefault();
        openTab('stock');
      } else if (e.key === 'F6') {
        e.preventDefault();
        openTab('ledger');
      } else if (e.key === 'F7') {
        e.preventDefault();
        openTab('installment_recovery');
      } else if (e.key === 'F8') {
        e.preventDefault();
        openTab('rebate');
      } else if (e.key === 'F9') {
        e.preventDefault();
        openTab('excel_import');
      } else if (e.key === 'F10') {
        e.preventDefault();
        openTab('installment_receipt');
      } else if (e.key === 'F11') {
        e.preventDefault();
        openTab('customer_reg');
      } else if (e.key === 'F12') {
        e.preventDefault();
        openTab('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openTabs]);

  const tabDefs = {
    dashboard: { title: 'KPI Dashboard - [BitDev IMS 13]', icon: '/icons/cellonx.ico' },
    sale: { title: 'Sale Invoice - [frmItemSale]', icon: '/extracted/img_187_0x3776F9.jpg' },
    purchase: { title: 'Purchase Information - [frmItemPurchase2]', icon: '/extracted/img_189_0x37AB57.jpg' },
    imei_search: { title: 'IMEI Lifecycle - [frmSearchIMEI]', icon: '/extracted/img_191_0x37E3F6.jpg' },
    stock: { title: 'Stock Register - [frmStockRegister]', icon: '/extracted/img_193_0x381926.jpg' },
    ledger: { title: 'Account Ledger - [frmAccLedger]', icon: '/extracted/img_195_0x384C6F.jpg' },
    installment_recovery: { title: 'Installment Dues (F7) - [frmInstDues]', icon: '/extracted/img_197_0x38B682.jpg' },
    installment_receipt: { title: 'Installment Receipt (F10) - [frmInstReceipt]', icon: '/extracted/img_197_0x38B682.jpg' },
    customer_reg: { title: 'Customer & Zamin (F11) - [frmCustReg]', icon: '/extracted/img_195_0x384C6F.jpg' },
    rebate: { title: 'Brand Rebate Adjustment - [frmRebate]', icon: '/extracted/img_199_0x392141.jpg' },
    excel_import: { title: 'Bulk Excel IMEI Import - [frmImportExcel]', icon: '/extracted/img_201_0x398E0E.jpg' }
  };

  const openTab = (tabKey) => {
    if (!openTabs.includes(tabKey)) {
      setOpenTabs([...openTabs, tabKey]);
    }
    setActiveTab(tabKey);
  };

  const closeTab = (tabKey, e) => {
    if (e) e.stopPropagation();
    const remaining = openTabs.filter(t => t !== tabKey);
    setOpenTabs(remaining);
    if (activeTab === tabKey) {
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  // -------------------------------------------------------------
  // 1. MODERN CELLON IMS 13 WEB ERP LAYOUT (MATCHING YOUTUBE DEMO)
  // -------------------------------------------------------------
  if (viewMode === 'modern') {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 select-none text-slate-800 font-sans">
        {/* Modern Top Header */}
        <ModernHeader
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode('classic')}
          onOpenTab={openTab}
          userName={userSession.userName}
          companyName={userSession.company}
          metrics={metrics}
          onLogout={() => setShowLogin(true)}
        />

        {/* Modern Tab Bar */}
        <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 space-x-2 overflow-x-auto shrink-0 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
            Open Windows:
          </span>
          {openTabs.map((t) => {
            const def = tabDefs[t] || { title: t, icon: '/icons/cellonx.ico' };
            const isActive = activeTab === t;

            return (
              <div
                key={t}
                onClick={() => setActiveTab(t)}
                className={`h-7 px-3 flex items-center space-x-2 text-xs font-bold rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <img src={def.icon} alt="" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate max-w-[150px]">{def.title.split(' - ')[0]}</span>
                <button
                  onClick={(e) => closeTab(t, e)}
                  className={`ml-1 font-bold text-xs ${isActive ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                  title="Close Window"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Main Body with Modern Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <ModernSidebar
            activeTab={activeTab}
            onOpenTab={openTab}
          />

          {/* Central Active View */}
          <main className="flex-1 overflow-y-auto bg-slate-50 p-2 sm:p-4">
            {activeTab === 'dashboard' && <DashboardView onOpenTab={openTab} />}
            {activeTab === 'sale' && <SalesInvoiceView onPrintInvoice={(bNo) => setPrintBillNo(bNo)} onOpenTab={openTab} />}
            {activeTab === 'installment_recovery' && <InstallmentRecoveryView onOpenTab={openTab} />}
            {activeTab === 'installment_receipt' && <InstallmentReceiptView onOpenTab={openTab} />}
            {activeTab === 'customer_reg' && <CustomerRegistrationView onOpenTab={openTab} />}
            {activeTab === 'purchase' && <PurchaseInvoiceView />}
            {activeTab === 'imei_search' && <ImeiSearchView />}
            {activeTab === 'stock' && <StockRegisterView />}
            {activeTab === 'ledger' && <LedgerView />}
            {activeTab === 'rebate' && <RebateView />}
            {activeTab === 'excel_import' && <ExcelImportView />}

            {!activeTab && (
              <div className="text-center py-20 space-y-3">
                <img src="/icons/cellonx.ico" alt="" className="w-16 h-16 mx-auto opacity-70" />
                <h2 className="text-xl font-bold text-slate-800">All Windows Closed</h2>
                <p className="text-xs text-slate-500">Select any module from the left menu or press F12 for Dashboard.</p>
                <button
                  onClick={() => openTab('dashboard')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs"
                >
                  Open KPI Dashboard (F12)
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Modern Footer StatusBar */}
        <footer className="h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <strong className="text-slate-700">BitDev IMS 13 Engine Active</strong>
            </span>
            <span>Available Stock: <strong className="text-slate-800">{metrics?.stockCount || 9} Handsets</strong></span>
            <span>Cash in Hand: <strong className="text-emerald-700 font-mono">Rs. {(metrics?.cashBalance || 250000).toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center space-x-3">
            <span>Logged in as: <strong className="text-sky-700">{userSession.userName}</strong></span>
            <span className="text-slate-300">|</span>
            <span>BitDev Cloud ERP • Enterprise Edition</span>
          </div>
        </footer>

        {/* Print Modal */}
        {printBillNo && (
          <CrystalPrintModal
            billNo={printBillNo}
            onClose={() => setPrintBillNo(null)}
          />
        )}

        {/* Login Modal */}
        <LoginModal
          isOpen={showLogin}
          onLoginSuccess={(session) => {
            setUserSession(session);
            setShowLogin(false);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. CLASSIC VISUAL BASIC 6 / WINDOWS XP DESKTOP SHELL
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#ECE9D8] select-none text-black font-sans">
      {/* 1. Exact Windows System TitleBar */}
      <TitleBar
        companyName={userSession.company}
        userName={userSession.userName}
        onExit={() => setShowLogin(true)}
      />

      {/* 2. MenuBar with Classic Visual Basic 6 Menus */}
      <MenuBar onOpenTab={openTab} />

      {/* 3. Authentic Toolbar with Real Extracted 48x48 Icons */}
      <div className="flex items-center justify-between bg-[#ECE9D8] pr-2">
        <Toolbar
          onOpenTab={openTab}
          onRefresh={fetchMetrics}
          onLogout={() => setShowLogin(true)}
        />
        <button
          onClick={() => setViewMode('modern')}
          className="win-btn py-1 px-3 bg-sky-100 text-sky-900 border border-sky-400 font-bold text-xs"
        >
          ✨ Switch to Modern Web View
        </button>
      </div>

      {/* 4. Windows Classic MDI Window Tabs Bar */}
      <div className="h-6 bg-[#D4D0C8] border-b border-[#808080] flex items-end px-1 space-x-1 overflow-x-auto">
        <button
          onClick={() => setShowLeftMenu(!showLeftMenu)}
          className="h-5 px-2 mr-1 win-btn text-[10px] font-bold flex items-center space-x-1"
          title="Toggle Left Menu Sidebar (cmdLeftMenu)"
        >
          <span>{showLeftMenu ? '◀ Hide Menu' : '▶ Show Menu'}</span>
        </button>

        {openTabs.map((t) => {
          const def = tabDefs[t] || { title: t, icon: '/icons/cellonx.ico' };
          const isActive = activeTab === t;

          return (
            <div
              key={t}
              onClick={() => setActiveTab(t)}
              className={`h-5 px-2.5 flex items-center space-x-1 text-[11px] font-bold cursor-pointer border-t border-l border-r border-[#808080] rounded-t-xs transition-all ${
                isActive
                  ? 'bg-[#ECE9D8] text-[#0A246A] border-b-0 -mb-[1px] z-10'
                  : 'bg-[#C0C0C0] text-gray-700 hover:bg-[#D4D0C8]'
              }`}
            >
              <img src={def.icon} alt="" className="w-3.5 h-3.5 object-contain" />
              <span>{def.title.split(' - ')[0]}</span>
              <button
                onClick={(e) => closeTab(t, e)}
                className="hover:text-red-700 ml-1.5 font-bold text-xs"
                title="Close Window"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* 5. Main MDI Workspace with Authentic Left Sidebar (pBoxLeft) */}
      <div className="flex-1 flex overflow-hidden relative">
        {showLeftMenu && (
          <div className="w-[200px] bg-[#ECE9D8] border-r border-[#808080] flex flex-col select-none overflow-y-auto shrink-0 shadow-inner">
            <div className="border-b border-[#808080] bg-white text-center">
              <img
                src="/icons/as.jpg"
                alt="BitDev ERP"
                className="w-[200px] h-[190px] object-cover"
              />
            </div>

            <div className="p-1 space-y-1">
              <button
                onClick={() => openTab('dashboard')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'dashboard' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/icons/cellonx.ico" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold text-[#0A246A]">KPI Dashboard (F12)</span>
              </button>

              <button
                onClick={() => openTab('sale')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'sale' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_187_0x3776F9.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Sale Invoice (F2)</span>
              </button>

              <button
                onClick={() => openTab('installment_recovery')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 border-l-2 border-green-600 ${activeTab === 'installment_recovery' ? 'bg-[#E6F4EA]' : 'bg-[#FFFFEA]'}`}
              >
                <img src="/extracted/img_197_0x38B682.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold text-green-800">Installment Dues (F7)</span>
              </button>

              <button
                onClick={() => openTab('installment_receipt')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'installment_receipt' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_197_0x38B682.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold text-blue-900">Inst. Receipt (F10)</span>
              </button>

              <button
                onClick={() => openTab('customer_reg')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'customer_reg' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_195_0x384C6F.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Customer & Zamin (F11)</span>
              </button>

              <button
                onClick={() => openTab('purchase')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'purchase' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_189_0x37AB57.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Purchase Bill (F3)</span>
              </button>

              <button
                onClick={() => openTab('imei_search')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'imei_search' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_191_0x37E3F6.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">IMEI Tracking (F4)</span>
              </button>

              <button
                onClick={() => openTab('stock')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'stock' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_193_0x381926.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Stock Register (F5)</span>
              </button>

              <button
                onClick={() => openTab('ledger')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'ledger' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_195_0x384C6F.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Party Ledger (F6)</span>
              </button>

              <button
                onClick={() => openTab('rebate')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'rebate' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_199_0x392141.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Brand Rebates (F8)</span>
              </button>

              <button
                onClick={() => openTab('excel_import')}
                className={`w-full text-left py-1.5 px-2 win-btn flex items-center space-x-2 ${activeTab === 'excel_import' ? 'bg-[#FFFFD6]' : ''}`}
              >
                <img src="/extracted/img_201_0x398E0E.jpg" alt="" className="w-4 h-4 object-contain" />
                <span className="font-bold">Excel Import (F9)</span>
              </button>
            </div>

            <div className="mt-auto border-t border-[#808080] p-2 bg-[#D4D0C8] text-center space-y-1">
              <div className="text-[11px] font-black text-[#0A246A]">BitDev Enterprise ERP</div>
              <div className="text-[9px] text-gray-600 leading-tight">Installment & POS Cloud Edition</div>
            </div>
          </div>
        )}

        {/* Central MDI Client Area */}
        <div className="flex-1 overflow-auto bg-[#808080] relative flex items-center justify-center p-1">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <img
              src="/icons/background.jpg"
              alt="BitDev ERP Watermark"
              className="max-w-[400px] max-h-[450px] object-contain"
            />
          </div>

          {activeTab ? (
            <MDIWindow
              title={tabDefs[activeTab]?.title || activeTab}
              icon={tabDefs[activeTab]?.icon}
              onClose={() => closeTab(activeTab)}
              onMinimize={() => setActiveTab(null)}
              isMaximized={true}
              onToggleMaximize={() => {}}
            >
              {activeTab === 'dashboard' && <DashboardView metrics={metrics} onOpenTab={openTab} />}
              {activeTab === 'sale' && <SalesInvoiceView onPrintInvoice={(bNo) => setPrintBillNo(bNo)} onOpenTab={openTab} />}
              {activeTab === 'installment_recovery' && <InstallmentRecoveryView onOpenTab={openTab} />}
              {activeTab === 'installment_receipt' && <InstallmentReceiptView onOpenTab={openTab} />}
              {activeTab === 'customer_reg' && <CustomerRegistrationView onOpenTab={openTab} />}
              {activeTab === 'purchase' && <PurchaseInvoiceView />}
              {activeTab === 'imei_search' && <ImeiSearchView />}
              {activeTab === 'stock' && <StockRegisterView />}
              {activeTab === 'ledger' && <LedgerView />}
              {activeTab === 'rebate' && <RebateView />}
              {activeTab === 'excel_import' && <ExcelImportView />}
            </MDIWindow>
          ) : (
            <div className="text-center text-white/70 select-none z-10 space-y-2">
              <img src="/icons/cellonx.ico" alt="" className="w-16 h-16 mx-auto opacity-80" />
              <h2 className="text-xl font-bold">BITDEV ERP - MDI Workspace</h2>
              <p className="text-xs">Click a module from the top toolbar or press F12 to open Dashboard</p>
              <button onClick={() => openTab('dashboard')} className="win-btn py-1 px-4 mt-2 font-bold text-[#0A246A]">
                Open KPI Dashboard (F12)
              </button>
            </div>
          )}
        </div>
      </div>

      <StatusBar
        stockCount={metrics?.stockCount}
        companyName={userSession.company}
        userName={userSession.userName}
      />

      {printBillNo && (
        <CrystalPrintModal
          billNo={printBillNo}
          onClose={() => setPrintBillNo(null)}
        />
      )}

      <LoginModal
        isOpen={showLogin}
        onLoginSuccess={(session) => {
          setUserSession(session);
          setShowLogin(false);
        }}
      />
    </div>
  );
}

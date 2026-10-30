import React, { useState } from 'react';

export default function LoginModal({ isOpen, onLoginSuccess }) {
  const [company, setCompany] = useState('HAMZA PHONE STORE');
  const [loginType, setLoginType] = useState('Administrator');
  const [userName, setUserName] = useState('Administrator');
  const [password, setPassword] = useState('admin123');
  const [showSplash, setShowSplash] = useState(false);
  const [splashStatus, setSplashStatus] = useState('Connecting to CellON11 Database...');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSplash(true);
    setSplashStatus('Connecting to CellON11 Database...');

    setTimeout(() => {
      setSplashStatus('Loading True DBGrid Runtimes & Serials...');
    }, 600);

    setTimeout(() => {
      setSplashStatus('Verifying License: Toheed Soft Lahore...');
    }, 1100);

    setTimeout(() => {
      setSplashStatus('Starting MDI Environment...');
    }, 1500);

    setTimeout(() => {
      setShowSplash(false);
      onLoginSuccess({
        userName,
        company,
        loginType
      });
    }, 2000);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center select-none backdrop-blur-xs">
        <div className="win-window-frame p-2 bg-[#ECE9D8] shadow-2xl flex flex-col items-center max-w-[530px] border-4 border-[#A0A0A0]">
          <img
            src="/extracted/img_05_0x1349C4.jpg"
            alt="Toheed Soft CellOn XI"
            className="w-[506px] h-[337px] object-cover border border-[#808080]"
          />
          <div className="w-full mt-2.5 space-y-1.5 px-2">
            <div className="flex justify-between text-[11px] font-bold text-[#0A246A]">
              <span>{splashStatus}</span>
              <span className="font-mono text-gray-700">CellOn XI v11.0</span>
            </div>
            {/* Windows XP / 2000 Style Progress Bar */}
            <div className="w-full h-4 bg-white win-bevel-sunken p-0.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 w-4/5 animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-600 pt-1 border-t border-[#ACA899]">
              <span className="font-bold">TOHEED SOFT (Since 2002)</span>
              <span>easy solution. instant support</span>
              <span className="text-gray-500">Lahore, Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center select-none backdrop-blur-xs">
      <div className="w-[450px] win-window-frame bg-[#ECE9D8] shadow-2xl">
        {/* Title Bar */}
        <div className="h-6 win-titlebar flex items-center justify-between px-2 border-b border-[#000080]">
          <div className="flex items-center space-x-1.5 text-white text-[11px] font-bold">
            <img src="/icons/toheed-t-icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
            <span>TOHEED SOFT - CellOn XI Security Authentication</span>
          </div>
          <button
            onClick={() => onLoginSuccess({ userName, company, loginType })}
            className="win-titlebar-btn hover:bg-red-600 hover:text-white"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Dialog Header Graphic */}
        <div className="p-3 bg-white flex items-center justify-between border-b border-[#808080]">
          <div className="space-y-0.5">
            <img
              src="/icons/toheedsoft-logo.png"
              alt="Toheed Soft Logo"
              className="h-9 object-contain"
            />
            <p className="text-[10px] font-bold text-[#0A246A]">CellON XI • Mobile Telecom & Retail ERP</p>
            <p className="text-[9px] text-gray-500">easy solution. instant support</p>
          </div>
          <img
            src="/icons/cellon-badge.png"
            alt="CellOn"
            className="h-12 object-contain"
          />
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-[#ECE9D8]">
          <div className="grid grid-cols-3 items-center gap-2 text-[11px] font-bold">
            <label className="text-gray-800 text-right">Company / Store:</label>
            <div className="col-span-2">
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="win-select w-full font-bold text-[#0A246A]"
              >
                <option value="HAMZA PHONE STORE">HAMZA PHONE STORE</option>
                <option value="CELLON LAHORE DISTRIBUTION">CELLON LAHORE DISTRIBUTION</option>
                <option value="CELLON DEMO BRANCH">CELLON DEMO BRANCH</option>
              </select>
            </div>

            <label className="text-gray-800 text-right">Login Type:</label>
            <div className="col-span-2">
              <select
                value={loginType}
                onChange={(e) => setLoginType(e.target.value)}
                className="win-select w-full"
              >
                <option value="Administrator">Administrator (Full Access)</option>
                <option value="Manager">Manager</option>
                <option value="Operator">Operator / Cashier Counter</option>
                <option value="Salesman">Salesman / Field Staff</option>
              </select>
            </div>

            <label className="text-gray-800 text-right">User Name:</label>
            <div className="col-span-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="win-input w-full font-bold"
                required
                autoFocus
              />
            </div>

            <label className="text-gray-800 text-right">Password:</label>
            <div className="col-span-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="win-input w-full"
                required
              />
            </div>
          </div>

          <div className="border-t border-[#808080] pt-3 flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-mono">Build 2026-XI.04</span>
            <div className="space-x-2 flex">
              <button
                type="submit"
                className="win-btn min-w-[95px] py-1 text-[#0A246A] bg-[#FFFFD6]"
              >
                <span>✔ Login (Enter)</span>
              </button>
              <button
                type="button"
                onClick={() => onLoginSuccess({ userName, company, loginType })}
                className="win-btn min-w-[75px] py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-[#D4D0C8] px-3 py-1.5 text-[10px] text-gray-700 flex justify-between border-t border-white items-center">
          <span>SQL Server: <strong>HAMZAPHONESTORE</strong></span>
          <span>Database: <strong>CellON11</strong></span>
          <span className="text-green-800 font-bold">● System Online</span>
        </div>
      </div>
    </div>
  );
}

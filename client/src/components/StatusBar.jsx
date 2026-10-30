import React, { useState, useEffect } from 'react';

export default function StatusBar({ stockCount, companyName, userName }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-6 bg-[#ECE9D8] border-t border-[#808080] flex items-center px-1 space-x-1 text-[11px] text-black select-none">
      {/* Panel 1: Ready Status */}
      <div className="win-statusbar-panel flex-1">
        <span className="font-bold text-green-800">● Ready</span>
        <span className="ml-2 text-gray-700">| BitDev Enterprise ERP (Cloud Edition)</span>
      </div>

      {/* Panel 2: User */}
      <div className="win-statusbar-panel min-w-[130px]">
        <span className="font-bold text-[#0A246A]">User:</span>
        <span className="ml-1 text-gray-800">{userName || 'Administrator'}</span>
      </div>

      {/* Panel 3: In-Stock Handsets */}
      <div className="win-statusbar-panel min-w-[150px]">
        <span className="font-bold text-purple-900">Stock In Hand:</span>
        <span className="ml-1 font-extrabold text-blue-900">{stockCount || 0} Units</span>
      </div>

      {/* Panel 4: Active Company */}
      <div className="win-statusbar-panel min-w-[160px]">
        <span className="font-bold text-gray-800 truncate">{companyName || 'HAMZA PHONE STORE'}</span>
      </div>

      {/* Panel 5: Key state */}
      <div className="win-statusbar-panel min-w-[65px] justify-center font-bold text-gray-600">
        CAPS
      </div>

      <div className="win-statusbar-panel min-w-[65px] justify-center font-bold text-gray-600">
        NUM
      </div>

      {/* Panel 6: Digital Clock */}
      <div className="win-statusbar-panel min-w-[95px] justify-center font-mono font-bold text-[#0A246A]">
        {time}
      </div>
    </div>
  );
}

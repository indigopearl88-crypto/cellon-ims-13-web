import React from 'react';

export default function TitleBar({ companyName, userName, onExit }) {
  return (
    <div className="h-6 win-titlebar select-none border-b border-[#000080]">
      <div className="flex items-center space-x-1.5 text-white text-[11px] font-bold tracking-wide">
        <img src="/icons/cellonx.ico" alt="Icon" className="w-4 h-4 object-contain" />
        <span>CELLON XI - Mobile Phone Wholesale & Retail Solution - [{companyName || 'HAMZA PHONE STORE'}] - [User: {userName || 'Administrator'}]</span>
      </div>
      <div className="flex items-center space-x-0.5">
        <button className="win-titlebar-btn" title="Minimize">_</button>
        <button className="win-titlebar-btn" title="Maximize">□</button>
        <button onClick={onExit} className="win-titlebar-btn hover:bg-red-600 hover:text-white" title="Close / Exit">✕</button>
      </div>
    </div>
  );
}

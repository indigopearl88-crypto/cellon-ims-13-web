import React from 'react';

export default function MDIWindow({ title, icon, onClose, onMinimize, children, isMaximized = true, onToggleMaximize }) {
  return (
    <div className={`flex flex-col bg-[#ECE9D8] win-window-frame overflow-hidden select-none ${isMaximized ? 'w-full h-full' : 'w-[96%] h-[94%] m-auto shadow-2xl'}`}>
      {/* MDI Child Window Title Bar */}
      <div className="h-6 win-titlebar flex items-center justify-between px-2 cursor-move border-b border-[#000080]">
        <div className="flex items-center space-x-1.5 text-white text-[11px] font-bold">
          {icon ? (
            <img src={icon} alt="" className="w-3.5 h-3.5 object-contain" />
          ) : (
            <img src="/icons/cellonx.ico" alt="" className="w-3.5 h-3.5 object-contain" />
          )}
          <span>{title}</span>
        </div>
        <div className="flex items-center space-x-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMinimize}
            className="win-titlebar-btn"
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={onToggleMaximize}
            className="win-titlebar-btn"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? '❐' : '□'}
          </button>
          <button
            onClick={onClose}
            className="win-titlebar-btn hover:bg-red-600 hover:text-white"
            title="Close Form"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Form Content Body */}
      <div className="flex-1 overflow-auto bg-[#ECE9D8] p-1.5 relative">
        {children}
      </div>
    </div>
  );
}

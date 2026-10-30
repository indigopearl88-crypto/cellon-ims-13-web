import React from 'react';

export default function Toolbar({ onOpenTab, onRefresh, onLogout }) {
  const tools = [
    { label: 'Dashboard', icon: '/icons/cellonx.ico', action: () => onOpenTab('dashboard') },
    { label: 'Sale (F2)', icon: '/extracted/img_187_0x3776F9.jpg', action: () => onOpenTab('sale') },
    { label: 'Inst. Dues (F7)', icon: '/extracted/img_197_0x38B682.jpg', action: () => onOpenTab('installment_recovery') },
    { label: 'Inst. Receipt (F10)', icon: '/extracted/img_197_0x38B682.jpg', action: () => onOpenTab('installment_receipt') },
    { label: 'Customer/Zamin (F11)', icon: '/extracted/img_195_0x384C6F.jpg', action: () => onOpenTab('customer_reg') },
    { label: 'Purchase (F3)', icon: '/extracted/img_189_0x37AB57.jpg', action: () => onOpenTab('purchase') },
    { label: 'IMEI Search (F4)', icon: '/extracted/img_191_0x37E3F6.jpg', action: () => onOpenTab('imei_search') },
    { label: 'Stock (F5)', icon: '/extracted/img_193_0x381926.jpg', action: () => onOpenTab('stock') },
    { label: 'Ledger (F6)', icon: '/extracted/img_195_0x384C6F.jpg', action: () => onOpenTab('ledger') },
    { label: 'Rebates (F8)', icon: '/extracted/img_199_0x392141.jpg', action: () => onOpenTab('rebate') },
    { label: 'Excel Import (F9)', icon: '/extracted/img_201_0x398E0E.jpg', action: () => onOpenTab('excel_import') },
    { label: 'Refresh', icon: '/extracted/img_117_0x2DABBF.jpg', action: onRefresh },
    { label: 'Logout', icon: '/extracted/img_221_0x3C5222.jpg', action: onLogout }
  ];

  return (
    <div className="h-16 bg-[#ECE9D8] border-b border-[#808080] flex items-center px-1 space-x-1 select-none overflow-x-auto shadow-sm">
      {tools.map((tool, idx) => (
        <button
          key={idx}
          onClick={tool.action}
          className="win-tool-btn h-14"
          title={tool.label}
        >
          <img
            src={tool.icon}
            alt={tool.label}
            className="w-8 h-8 object-contain pointer-events-none mb-1 drop-shadow-sm"
          />
          <span className="text-[10px] font-bold text-black tracking-tight leading-none text-center whitespace-nowrap">
            {tool.label}
          </span>
        </button>
      ))}
    </div>
  );
}

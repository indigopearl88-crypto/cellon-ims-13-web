import React, { useState } from 'react';

export default function MenuBar({ onOpenTab }) {
  const [activeMenu, setActiveMenu] = useState(null);

  const menus = [
    {
      name: 'File',
      items: [
        { label: 'Company Information', action: () => onOpenTab('dashboard') },
        { label: 'Database Backup (.bak)', action: () => alert('Database is running on live WAL mode. Auto-backup enabled.') },
        { divider: true },
        { label: 'Exit BitDev ERP', action: () => alert('BitDev Web ERP is running.') }
      ]
    },
    {
      name: 'Settings',
      items: [
        { label: 'Chart of Accounts', action: () => onOpenTab('ledger') },
        { label: 'Customers & Suppliers', action: () => onOpenTab('ledger') },
        { label: 'Handset Models & Items', action: () => onOpenTab('stock') },
        { label: 'Categories & Colors', action: () => onOpenTab('stock') },
        { label: 'Stock Locations & Warehouses', action: () => onOpenTab('stock') }
      ]
    },
    {
      name: 'Inventory',
      items: [
        { label: 'Running Stock Register (F5)', action: () => onOpenTab('stock') },
        { label: 'Serial & IMEI Search (F4)', action: () => onOpenTab('imei_search') },
        { label: 'Bulk Excel Import (F9)', action: () => onOpenTab('excel_import') },
        { divider: true },
        { label: 'Inter-Branch Stock Transfer', action: () => alert('Select phones in Stock Register to transfer.') }
      ]
    },
    {
      name: 'Purchases',
      items: [
        { label: 'New Handset Purchase Invoice (F3)', action: () => onOpenTab('purchase') },
        { label: 'Goods Receipt Note (GRN)', action: () => onOpenTab('purchase') },
        { label: 'Purchase Return to Supplier', action: () => onOpenTab('purchase') }
      ]
    },
    {
      name: 'Sales & POS',
      items: [
        { label: 'Fast POS Counter Billing (F2)', action: () => onOpenTab('sale') },
        { label: 'Sales Invoices Register', action: () => onOpenTab('sale') },
        { label: 'Customer Return & Warranty', action: () => onOpenTab('imei_search') }
      ]
    },
    {
      name: 'Installments (IMS)',
      items: [
        { label: 'Analytical KPI Dashboard (F12)', action: () => onOpenTab('dashboard') },
        { label: 'Installment Dues & WhatsApp Recovery (F7)', action: () => onOpenTab('installment_recovery') },
        { label: 'Installment Receipt Voucher (F10)', action: () => onOpenTab('installment_receipt') },
        { label: 'Customer & Guarantor (Zamin) Registration (F11)', action: () => onOpenTab('customer_reg') },
        { divider: true },
        { label: 'Party Account Ledger & Schedule', action: () => onOpenTab('ledger') }
      ]
    },
    {
      name: 'Vouchers',
      items: [
        { label: 'Cash Payment Voucher (CP)', action: () => onOpenTab('ledger') },
        { label: 'Cash Receipt Voucher (CR)', action: () => onOpenTab('ledger') },
        { label: 'Bank Payment Voucher (BP)', action: () => onOpenTab('ledger') },
        { label: 'General Journal Voucher (JV)', action: () => onOpenTab('ledger') }
      ]
    },
    {
      name: 'Specialized',
      items: [
        { label: 'Price Protection Rebates (F8)', action: () => onOpenTab('rebate') },
        { label: 'Brand Coupon Claims', action: () => onOpenTab('rebate') },
        { label: 'SIM & Device Activation Accounts', action: () => onOpenTab('ledger') }
      ]
    },
    {
      name: 'Reports',
      items: [
        { label: 'Party Account Ledger (F6)', action: () => onOpenTab('ledger') },
        { label: 'Receivables Aging (30/60/90 Days)', action: () => onOpenTab('ledger') },
        { label: 'Multi-Level Trial Balance', action: () => onOpenTab('ledger') },
        { label: 'Daily Handset Sales Summary', action: () => onOpenTab('dashboard') }
      ]
    }
  ];

  return (
    <div className="h-6 bg-[#ECE9D8] border-b border-[#ACA899] flex items-center px-1 text-xs select-none relative z-50">
      {menus.map((menu, idx) => (
        <div key={idx} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
            className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white transition-colors ${
              activeMenu === idx ? 'bg-[#316AC5] text-white' : 'text-black'
            }`}
          >
            {menu.name}
          </button>

          {activeMenu === idx && (
            <div
              className="absolute left-0 top-full mt-0.5 w-56 win-bevel bg-[#ECE9D8] shadow-lg py-1 z-50"
              onMouseLeave={() => setActiveMenu(null)}
            >
              {menu.items.map((item, itemIdx) =>
                item.divider ? (
                  <div key={itemIdx} className="border-b border-[#ACA899] my-1 border-t border-white" />
                ) : (
                  <button
                    key={itemIdx}
                    onClick={() => {
                      item.action();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-4 py-1 hover:bg-[#316AC5] hover:text-white text-black text-xs block"
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

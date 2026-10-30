import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, CalendarClock, Receipt, 
  UserPlus, PackagePlus, ScanBarcode, Boxes, BookOpen, 
  Tag, FileSpreadsheet, Headphones, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function ModernSidebar({ activeTab, onOpenTab, collapsed, onToggleCollapse }) {
  const menuItems = [
    {
      group: 'Core Installments & KPI',
      items: [
        {
          id: 'dashboard',
          label: 'KPI Dashboard',
          shortcut: 'F12',
          icon: LayoutDashboard,
          badge: '11 KPIs',
          badgeColor: 'bg-sky-100 text-sky-700 font-extrabold'
        },
        {
          id: 'installment_recovery',
          label: 'Installment Dues',
          shortcut: 'F7',
          icon: CalendarClock,
          badge: 'WhatsApp',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold'
        },
        {
          id: 'installment_receipt',
          label: 'Installment Receipt',
          shortcut: 'F10',
          icon: Receipt,
          badge: 'Auto-Split',
          badgeColor: 'bg-amber-100 text-amber-800 font-bold'
        },
        {
          id: 'customer_reg',
          label: 'Customer & Zamin',
          shortcut: 'F11',
          icon: UserPlus,
          badge: 'Legal',
          badgeColor: 'bg-purple-100 text-purple-800'
        }
      ]
    },
    {
      group: 'Sales & Inventory',
      items: [
        {
          id: 'sale',
          label: 'POS Sale Counter',
          shortcut: 'F2',
          icon: ShoppingCart,
          badge: 'IMS Contract',
          badgeColor: 'bg-blue-100 text-blue-800 font-semibold'
        },
        {
          id: 'purchase',
          label: 'Purchase & GRN',
          shortcut: 'F3',
          icon: PackagePlus,
          badge: null
        },
        {
          id: 'imei_search',
          label: 'IMEI Lifecycle',
          shortcut: 'F4',
          icon: ScanBarcode,
          badge: '15-Digit',
          badgeColor: 'bg-slate-100 text-slate-700'
        },
        {
          id: 'stock',
          label: 'Stock Register',
          shortcut: 'F5',
          icon: Boxes,
          badge: null
        }
      ]
    },
    {
      group: 'Finance & Specialized',
      items: [
        {
          id: 'ledger',
          label: 'Party Ledger (A/C)',
          shortcut: 'F6',
          icon: BookOpen,
          badge: null
        },
        {
          id: 'rebate',
          label: 'Brand Rebates',
          shortcut: 'F8',
          icon: Tag,
          badge: 'Protection',
          badgeColor: 'bg-orange-100 text-orange-800'
        },
        {
          id: 'excel_import',
          label: 'Excel IMEI Import',
          shortcut: 'F9',
          icon: FileSpreadsheet,
          badge: null
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800 transition-all duration-200">
      {/* Sidebar Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {menuItems.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {grp.group}
            </div>

            <div className="space-y-0.5 pt-1">
              {grp.items.map((it) => {
                const Icon = it.icon;
                const isActive = activeTab === it.id;

                return (
                  <button
                    key={it.id}
                    onClick={() => onOpenTab(it.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{it.label}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {it.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : it.badgeColor}`}>
                          {it.badge}
                        </span>
                      )}
                      <span className={`text-[9px] font-mono px-1 rounded ${isActive ? 'bg-sky-800 text-sky-200' : 'text-slate-500'}`}>
                        {it.shortcut}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Support & System Info Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>CellON Engine Live</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">v13.0.4</span>
        </div>

        <div className="p-2 bg-slate-800/60 rounded-md border border-slate-700/50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-300">Toheed Soft Support</div>
            <div className="text-[9px] text-slate-400">042-37220000 • Lahore</div>
          </div>
          <Headphones className="w-4 h-4 text-sky-400" />
        </div>
      </div>
    </aside>
  );
}

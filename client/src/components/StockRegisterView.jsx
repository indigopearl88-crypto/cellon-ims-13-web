import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Smartphone, TrendingUp } from 'lucide-react';

export default function StockRegisterView() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = () => {
    setLoading(true);
    fetch('/api/stock')
      .then(r => r.json())
      .then(d => {
        setStock(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const totalUnits = stock.reduce((s, it) => s + parseInt(it.QtyInStock || 0), 0);
  const totalValuation = stock.reduce((s, it) => s + parseFloat(it.TotalCostValue || 0), 0);

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto text-xs">
      <div className="win-bevel p-2 bg-[#F0EDE0] flex items-center justify-between border-b border-[#ACA899]">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-700" />
          <span className="font-bold text-sm text-[#0A246A]">Running Handset Stock Register (vwSubItemStockReg)</span>
        </div>
        <button onClick={fetchStock} className="win-button flex items-center space-x-1 font-bold">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="win-bevel p-3 bg-purple-50 flex items-center justify-between border border-purple-200">
          <div>
            <span className="text-gray-600 font-semibold uppercase text-[10px]">Total Available Stock</span>
            <div className="text-2xl font-bold text-purple-900 mt-0.5">{totalUnits} Handsets</div>
          </div>
          <Smartphone className="w-8 h-8 text-purple-400" />
        </div>

        <div className="win-bevel p-3 bg-green-50 flex items-center justify-between border border-green-200">
          <div>
            <span className="text-gray-600 font-semibold uppercase text-[10px]">Total Inventory Valuation (Cost)</span>
            <div className="text-2xl font-bold text-green-900 mt-0.5">Rs. {totalValuation.toLocaleString()}</div>
          </div>
          <TrendingUp className="w-8 h-8 text-green-400" />
        </div>
      </div>

      {/* Stock Table */}
      <div className="win-bevel-sunken bg-white min-h-[320px] overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#E0DFD8] text-[11px] font-bold text-gray-700">
            <tr>
              <th className="dbgrid-header w-12 text-center">Sr#</th>
              <th className="dbgrid-header">Handset Model / Product Name</th>
              <th className="dbgrid-header">Category</th>
              <th className="dbgrid-header w-28 text-center">In-Stock Qty</th>
              <th className="dbgrid-header w-36 text-right">Avg Unit Cost (Rs)</th>
              <th className="dbgrid-header w-44 text-right">Total Inventory Worth (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 font-bold">Loading running stock register...</td>
              </tr>
            ) : stock.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-400">No stock found in inventory.</td>
              </tr>
            ) : (
              stock.map((it, idx) => (
                <tr key={idx} className="hover:bg-amber-50 border-b border-gray-200">
                  <td className="dbgrid-cell text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="dbgrid-cell font-bold text-gray-900">{it.ModelName}</td>
                  <td className="dbgrid-cell text-gray-600">{it.CategoryName || 'Smartphones'}</td>
                  <td className="dbgrid-cell text-center font-bold font-mono text-purple-900 text-sm">
                    {it.QtyInStock} Units
                  </td>
                  <td className="dbgrid-cell text-right font-mono font-medium">
                    {Math.round(it.AvgCostPrice || 0).toLocaleString()}
                  </td>
                  <td className="dbgrid-cell text-right font-mono font-bold text-gray-900">
                    {Math.round(it.TotalCostValue || 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

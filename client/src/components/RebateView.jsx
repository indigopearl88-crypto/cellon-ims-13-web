import React, { useState, useEffect } from 'react';
import { Tag, CheckSquare, Square, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function RebateView() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [inStockItems, setInStockItems] = useState([]);
  const [rebatePerUnit, setRebatePerUnit] = useState(2000);
  const [selectedHandsetIds, setSelectedHandsetIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch('/api/traders?type=supplier')
      .then(r => r.json())
      .then(d => {
        setSuppliers(d);
        if (d.length > 0) setSelectedSupplierId(d[0].AccountID);
      });

    fetch('/api/imei/search?q=') // load stock items
      .then(r => r.json())
      .then(d => {
        const inStock = d.filter(item => item.Stock === 1);
        setInStockItems(inStock);
      });
  }, []);

  const toggleSelectHandset = (id) => {
    if (selectedHandsetIds.includes(id)) {
      setSelectedHandsetIds(selectedHandsetIds.filter(i => i !== id));
    } else {
      setSelectedHandsetIds([...selectedHandsetIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedHandsetIds.length === inStockItems.length) {
      setSelectedHandsetIds([]);
    } else {
      setSelectedHandsetIds(inStockItems.map(i => i.ID));
    }
  };

  const selectedItemsData = inStockItems.filter(i => selectedHandsetIds.includes(i.ID));
  const totalRebateAmount = selectedItemsData.length * parseFloat(rebatePerUnit || 0);

  const handleApplyRebate = async () => {
    if (selectedHandsetIds.length === 0) {
      alert('Please select at least one handset from stock to apply price rebate.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/specialized/rebate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierAccountId: selectedSupplierId,
          items: selectedItemsData.map(h => ({
            detItemId: h.ID,
            mobNo: h.MobNo,
            currentPrice: h.PurchasePrice,
            rebateAmount: parseFloat(rebatePerUnit || 0)
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setMessage({ type: 'success', text: data.message });
      setSelectedHandsetIds([]);

      // Reload stock
      const freshRes = await fetch('/api/imei/search?q=');
      const freshData = await freshRes.json();
      setInStockItems(freshData.filter(i => i.Stock === 1));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto text-xs">
      <div className="win-bevel p-2 bg-[#F0EDE0] flex items-center justify-between border-b border-[#ACA899]">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-red-700" />
          <span className="font-bold text-sm text-[#0A246A]">Brand Price Protection & Rebates (frmRebate)</span>
        </div>
        <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-300">
          Doc Type: REB (Price Protection Claim)
        </span>
      </div>

      {/* Rebate Controls */}
      <div className="win-bevel p-3 bg-white grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="font-bold text-gray-700 block mb-0.5">Brand / Distributor to Claim From:</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(parseInt(e.target.value))}
            className="win-input w-full font-bold"
          >
            {suppliers.map(s => (
              <option key={s.ID} value={s.AccountID}>
                {s.Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-0.5">Price Drop Rebate Amount per Unit (Rs):</label>
          <input
            type="number"
            value={rebatePerUnit}
            onChange={(e) => setRebatePerUnit(e.target.value)}
            className="win-input w-full font-mono font-bold text-right"
          />
        </div>

        <div>
          <button
            onClick={handleApplyRebate}
            disabled={isSubmitting || selectedHandsetIds.length === 0}
            className="win-button w-full py-1.5 bg-red-700 text-white font-bold hover:bg-red-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Applying Rebates...' : `Apply Rebate on ${selectedHandsetIds.length} Handsets`}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-2 rounded text-xs bg-green-100 text-green-800 border border-green-300 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Handsets List */}
      <div className="win-bevel-sunken bg-white min-h-[300px] max-h-[420px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-[#E0DFD8] text-[11px] font-bold text-gray-700">
            <tr>
              <th className="dbgrid-header w-10 text-center">
                <button onClick={toggleSelectAll} className="text-gray-700">
                  {selectedHandsetIds.length === inStockItems.length && inStockItems.length > 0 ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="dbgrid-header">Serial # (15-Digit IMEI)</th>
              <th className="dbgrid-header">Handset Model</th>
              <th className="dbgrid-header text-right">Current Cost (Rs)</th>
              <th className="dbgrid-header text-right">Rebate Discount</th>
              <th className="dbgrid-header text-right">Revised Cost (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {inStockItems.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-400">No phones in stock to rebate.</td></tr>
            ) : (
              inStockItems.map((h) => {
                const isSelected = selectedHandsetIds.includes(h.ID);
                const currentCost = h.PurchasePrice || 0;
                const newCost = Math.max(0, currentCost - parseFloat(rebatePerUnit || 0));

                return (
                  <tr
                    key={h.ID}
                    onClick={() => toggleSelectHandset(h.ID)}
                    className={`cursor-pointer border-b border-gray-200 ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="dbgrid-cell text-center" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelectHandset(h.ID)}>
                        {isSelected ? <CheckSquare className="w-4 h-4 text-red-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>
                    <td className="dbgrid-cell font-mono font-bold text-purple-900">{h.MobNo}</td>
                    <td className="dbgrid-cell font-semibold text-gray-900">{h.ModelName}</td>
                    <td className="dbgrid-cell text-right font-mono text-gray-700">{currentCost.toLocaleString()}</td>
                    <td className="dbgrid-cell text-right font-mono font-bold text-red-700">
                      -Rs. {parseFloat(rebatePerUnit || 0).toLocaleString()}
                    </td>
                    <td className="dbgrid-cell text-right font-mono font-bold text-green-800">
                      Rs. {newCost.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="win-bevel p-2.5 bg-[#F4F3ED] flex items-center justify-between">
        <span className="font-bold text-gray-700">
          Selected for Rebate: <span className="font-mono text-purple-900 ml-1">{selectedHandsetIds.length} Handsets</span>
        </span>
        <span className="font-bold text-gray-800">
          Total Vendor Claim: <span className="font-mono text-red-700 text-sm ml-1 font-extrabold">Rs. {totalRebateAmount.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}

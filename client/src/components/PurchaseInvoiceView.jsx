import React, { useState, useEffect } from 'react';
import { PackagePlus, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { playSound } from '../utils/sound';

export default function PurchaseInvoiceView() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [refNo, setRefNo] = useState('');
  const [itemsList, setItemsList] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [locations, setLocations] = useState([]);

  // Line item draft
  const [selectedItemId, setSelectedItemId] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [warrantyId, setWarrantyId] = useState(1);
  const [locationId, setLocationId] = useState(1);

  const [receivedHandsets, setReceivedHandsets] = useState([]);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/traders?type=supplier')
      .then(r => r.json())
      .then(d => {
        setSuppliers(d);
        if (d.length > 0) setSelectedSupplierId(d[0].AccountID);
      });

    fetch('/api/items')
      .then(r => r.json())
      .then(d => {
        setItemsList(d);
        if (d.length > 0) {
          setSelectedItemId(d[0].ID);
          setCostPrice(d[0].PurchasePrice);
          setSalePrice(d[0].PurchasePrice * 1.05);
        }
      });

    fetch('/api/warranties').then(r => r.json()).then(setWarranties);
    fetch('/api/locations').then(r => r.json()).then(setLocations);
  }, []);

  const handleItemSelect = (e) => {
    const itId = parseInt(e.target.value);
    setSelectedItemId(itId);
    const found = itemsList.find(i => i.ID === itId);
    if (found) {
      setCostPrice(found.PurchasePrice);
      setSalePrice(Math.round(found.PurchasePrice * 1.05));
    }
  };

  const handleAddHandset = () => {
    const cleanImei = imeiInput.trim();
    if (!cleanImei) {
      alert('Please enter or scan a 15-digit IMEI.');
      return;
    }

    if (receivedHandsets.some(h => h.mobNo === cleanImei)) {
      playSound('duplicate');
      setMessage({ type: 'error', text: `IMEI ${cleanImei} is already in the list.` });
      return;
    }

    const itemObj = itemsList.find(i => i.ID === parseInt(selectedItemId));
    const warrObj = warranties.find(w => w.ID === parseInt(warrantyId));
    const locObj = locations.find(l => l.ID === parseInt(locationId));

    playSound('digits');
    setReceivedHandsets([
      ...receivedHandsets,
      {
        itemId: parseInt(selectedItemId),
        modelName: itemObj ? itemObj.Name : 'Phone',
        mobNo: cleanImei,
        purchasePrice: parseFloat(costPrice || 0),
        salePrice: parseFloat(salePrice || 0),
        warrantyId: parseInt(warrantyId),
        warrantyName: warrObj ? warrObj.Name : 'Official',
        locationId: parseInt(locationId),
        locationName: locObj ? locObj.Name : 'Main'
      }
    ]);
    setImeiInput('');
    setMessage({ type: 'success', text: `Added IMEI ${cleanImei}` });
  };

  const removeItem = (idx) => {
    setReceivedHandsets(receivedHandsets.filter((_, i) => i !== idx));
  };

  const totalBill = receivedHandsets.reduce((sum, h) => sum + parseFloat(h.purchasePrice || 0), 0);

  const handleSavePurchase = async () => {
    if (receivedHandsets.length === 0) {
      alert('Please add at least one handset with IMEI.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierAccountId: selectedSupplierId,
          refNo,
          items: receivedHandsets
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Success! Purchase Bill #${data.billNo} booked. ${data.count} Handsets added to live inventory.`);
      setReceivedHandsets([]);
      setRefNo('');
      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto text-xs">
      {/* Header */}
      <div className="win-bevel p-2 bg-[#F0EDE0] flex items-center justify-between border-b border-[#ACA899]">
        <div className="flex items-center space-x-2">
          <PackagePlus className="w-5 h-5 text-blue-700" />
          <span className="font-bold text-sm text-[#0A246A]">Handset Purchase & Good Receipt (HItemPurchase)</span>
        </div>
        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-300">
          Doc Type: PI (Purchase Invoice)
        </span>
      </div>

      {/* Supplier & Ref */}
      <div className="win-bevel p-2.5 bg-white grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="font-bold text-gray-700 block mb-0.5">Supplier / Distributor:</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(parseInt(e.target.value))}
            className="win-input w-full font-semibold"
          >
            {suppliers.map(s => (
              <option key={s.ID} value={s.AccountID}>
                {s.Name} ({s.City || 'Distributor'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-0.5">Distributor Delivery / DC / Ref #:</label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="e.g. DC-98412 or Airlink-442"
            className="win-input w-full font-mono font-bold"
          />
        </div>

        <div className="flex items-end">
          <div className="text-gray-600">
            <span>Entry Date: </span>
            <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Handset Entry Draft Bar */}
      <div className="win-bevel p-3 bg-[#EBF2FA] grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="font-bold text-gray-700 block mb-0.5">Handset Model:</label>
          <select
            value={selectedItemId}
            onChange={handleItemSelect}
            className="win-input w-full font-semibold"
          >
            {itemsList.map(it => (
              <option key={it.ID} value={it.ID}>
                {it.Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-purple-900 block mb-0.5">15-Digit Serial / IMEI #:</label>
          <input
            type="text"
            value={imeiInput}
            onChange={(e) => setImeiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHandset()}
            placeholder="Scan or type IMEI..."
            className="win-input w-full font-mono font-bold bg-yellow-50"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-0.5">Purchase Cost (Rs):</label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="win-input w-full font-mono font-bold text-right"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-0.5">Target Sale (Rs):</label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="win-input w-full font-mono font-bold text-right"
          />
        </div>

        <div>
          <button
            onClick={handleAddHandset}
            type="button"
            className="win-button w-full py-1.5 bg-blue-600 text-white font-bold flex items-center justify-center space-x-1 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add IMEI</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-2 rounded text-xs flex items-center space-x-2 ${message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid Table */}
      <div className="win-bevel-sunken bg-white min-h-[220px] max-h-[340px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-[#E0DFD8] text-[11px] font-bold text-gray-700">
            <tr>
              <th className="dbgrid-header w-10">Sr#</th>
              <th className="dbgrid-header">Handset Model</th>
              <th className="dbgrid-header">Serial # (IMEI)</th>
              <th className="dbgrid-header text-right">Cost Price (Rs)</th>
              <th className="dbgrid-header text-right">Sale Price (Rs)</th>
              <th className="dbgrid-header">Warranty</th>
              <th className="dbgrid-header w-12 text-center">Del</th>
            </tr>
          </thead>
          <tbody>
            {receivedHandsets.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400">
                  No handsets added to this purchase bill yet.
                </td>
              </tr>
            ) : (
              receivedHandsets.map((h, idx) => (
                <tr key={idx} className="hover:bg-blue-50 border-b border-gray-200">
                  <td className="dbgrid-cell text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="dbgrid-cell font-semibold text-gray-900">{h.modelName}</td>
                  <td className="dbgrid-cell font-mono font-bold text-purple-900">{h.mobNo}</td>
                  <td className="dbgrid-cell text-right font-mono font-bold">{h.purchasePrice.toLocaleString()}</td>
                  <td className="dbgrid-cell text-right font-mono text-gray-700">{h.salePrice.toLocaleString()}</td>
                  <td className="dbgrid-cell text-gray-600">{h.warrantyName}</td>
                  <td className="dbgrid-cell text-center">
                    <button onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Calculation */}
      <div className="win-bevel p-3 bg-[#F4F3ED] flex items-center justify-between">
        <div className="text-xs font-bold text-gray-700">
          Handsets to Receive: <span className="text-blue-900 font-mono text-sm ml-1">{receivedHandsets.length} Units</span>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div>
            <span className="text-gray-700 font-bold mr-2">Total Invoice Value:</span>
            <span className="font-mono font-extrabold text-base text-blue-900">Rs. {totalBill.toLocaleString()}</span>
          </div>

          <button
            onClick={handleSavePurchase}
            disabled={isSubmitting || receivedHandsets.length === 0}
            className="win-button py-2 px-6 bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Recording Purchase...' : 'Save & Post Purchase Bill (F10)'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Smartphone, CheckCircle2, XCircle, ArrowRight, Calendar, User, FileText } from 'lucide-react';

export default function ImeiSearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/imei/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto text-xs">
      {/* Title */}
      <div className="win-bevel p-2 bg-[#F0EDE0] flex items-center justify-between border-b border-[#ACA899]">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-purple-700" />
          <span className="font-bold text-sm text-[#0A246A]">Universal IMEI / Handset Serial Lifecycle Search (frmSearchIMEI)</span>
        </div>
        <span className="text-gray-500 text-[11px]">Instant Warranty & Invoicing Verification</span>
      </div>

      {/* Search Input Bar */}
      <div className="win-bevel p-3 bg-white">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter full or partial 15-Digit IMEI, or Handset Model Name..."
            className="win-input flex-1 font-mono font-bold text-sm py-1.5"
            autoFocus
          />
          <button type="submit" className="win-button py-1.5 px-6 bg-purple-700 text-white font-bold flex items-center space-x-1 hover:bg-purple-800">
            <Search className="w-4 h-4" />
            <span>Search IMEI (Enter)</span>
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="win-bevel-sunken bg-white min-h-[300px] overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#E0DFD8] text-[11px] font-bold text-gray-700 select-none">
            <tr>
              <th className="dbgrid-header w-12 text-center">Status</th>
              <th className="dbgrid-header">Serial # (15-Digit IMEI)</th>
              <th className="dbgrid-header">Handset Model</th>
              <th className="dbgrid-header">Current Location</th>
              <th className="dbgrid-header">Warranty</th>
              <th className="dbgrid-header text-right">Cost (Rs)</th>
              <th className="dbgrid-header text-right">Sale (Rs)</th>
              <th className="dbgrid-header">Invoice / Sold Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500 font-bold">
                  Searching database...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-400">
                  {hasSearched ? 'No matching handset or IMEI found in database.' : 'Enter an IMEI or model above and click Search.'}
                </td>
              </tr>
            ) : (
              results.map((r, idx) => (
                <tr key={idx} className="hover:bg-purple-50 border-b border-gray-200">
                  <td className="dbgrid-cell text-center">
                    {r.Stock === 1 ? (
                      <span className="bg-green-100 text-green-800 border border-green-400 px-2 py-0.5 rounded font-bold text-[10px]">
                        IN STOCK
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 border border-red-400 px-2 py-0.5 rounded font-bold text-[10px]">
                        SOLD
                      </span>
                    )}
                  </td>
                  <td className="dbgrid-cell font-mono font-bold text-purple-900 text-sm">{r.MobNo}</td>
                  <td className="dbgrid-cell font-semibold text-gray-900">{r.ModelName}</td>
                  <td className="dbgrid-cell text-gray-600">{r.LocationName || 'Counter'}</td>
                  <td className="dbgrid-cell text-gray-600">{r.WarrantyName || 'Standard'}</td>
                  <td className="dbgrid-cell text-right font-mono font-bold">{r.PurchasePrice?.toLocaleString()}</td>
                  <td className="dbgrid-cell text-right font-mono text-gray-700">{r.SalePrice?.toLocaleString() || '-'}</td>
                  <td className="dbgrid-cell">
                    {r.Stock === 0 && r.SoldBillNo ? (
                      <div className="text-[11px] space-y-0.5">
                        <span className="font-bold text-blue-900">Bill #{r.SoldBillNo}</span>
                        <span className="text-gray-500 ml-2">({r.SoldDate})</span>
                        <div className="text-gray-700 font-medium">To: {r.SoldToCustomer || 'Counter Customer'}</div>
                      </div>
                    ) : (
                      <span className="text-green-700 font-medium">Available for Sale</span>
                    )}
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

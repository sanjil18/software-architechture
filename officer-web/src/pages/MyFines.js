import React, { useEffect, useState } from 'react';
import { getMyFines } from '../services/api';

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function MyFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyFines()
      .then(setFines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = fines.filter(f =>
    f.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    f.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    f.driverName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: fines.length,
    paid: fines.filter(f => f.status === 'PAID').length,
    pending: fines.filter(f => f.status === 'PENDING').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Issued Fines</h1>
        <p className="text-gray-500 text-sm mt-1">All fines you have issued</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Issued', value: stats.total, color: 'border-blue-500' },
          { label: 'Paid', value: stats.paid, color: 'border-green-500' },
          { label: 'Pending', value: stats.pending, color: 'border-yellow-500' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-xl shadow p-4 border-l-4 ${s.color}`}>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input type="text" placeholder="Search by reference, vehicle, or driver..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Reference</th>
              <th className="text-left px-4 py-3">Driver</th>
              <th className="text-left px-4 py-3">Vehicle</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Issued</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No fines found</td></tr>
            ) : filtered.map((fine, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{fine.referenceNumber}</td>
                <td className="px-4 py-3">{fine.driverName}</td>
                <td className="px-4 py-3 font-medium">{fine.vehicleNumber}</td>
                <td className="px-4 py-3">{fine.categoryName || '—'}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {Number(fine.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(fine.issuedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[fine.status] || 'bg-gray-100 text-gray-700'}`}>
                    {fine.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t text-xs text-gray-400">
          Showing {filtered.length} of {fines.length} fines
        </div>
      </div>
    </div>
  );
}

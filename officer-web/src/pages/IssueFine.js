import React, { useState, useEffect } from 'react';
import { getCategories, issueFine } from '../services/api';

export default function IssueFine() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryCode: '',
    vehicleNumber: '',
    driverName: '',
    driverNic: '',
    district: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const SL_DISTRICTS = [
    'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle',
    'Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle',
    'Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala',
    'Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura',
    'Trincomalee','Vavuniya'
  ];

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const fine = await issueFine(form);
      setResult(fine);
      setForm({ categoryCode: '', vehicleNumber: '', driverName: '', driverNic: '', district: '', location: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue fine. Check your login and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Issue Traffic Fine</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to generate a fine reference number</p>
      </div>

      {/* Success banner */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 text-xl">✓</span>
            <span className="font-bold text-green-800">Fine Issued Successfully</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Reference Number</div>
            <div className="font-mono font-bold text-blue-900">{result.referenceNumber}</div>
            <div className="text-gray-500">Category Code</div>
            <div className="font-medium">{result.categoryName}</div>
            <div className="text-gray-500">Amount</div>
            <div className="font-bold">LKR {Number(result.amount).toLocaleString()}</div>
            <div className="text-gray-500">Driver</div>
            <div>{result.driverName}</div>
            <div className="text-gray-500">Vehicle</div>
            <div>{result.vehicleNumber}</div>
          </div>
          <div className="mt-3 text-xs text-green-700 bg-green-100 rounded-lg p-3">
            Hand this reference number and the category code to the driver. They can pay via the mobile app or web portal.
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Violation Category</label>
            <select name="categoryCode" value={form.categoryCode} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">— Select category —</option>
              {categories.map(cat => (
                <option key={cat.categoryCode} value={cat.categoryCode}>
                  {cat.categoryCode} — {cat.name} (LKR {Number(cat.defaultAmount).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange}
                placeholder="e.g. CAA-1234" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver NIC</label>
              <input name="driverNic" value={form.driverNic} onChange={handleChange}
                placeholder="e.g. 991234567V" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver Full Name</label>
            <input name="driverName" value={form.driverName} onChange={handleChange}
              placeholder="As on driving licence" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select name="district" value={form.district} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">— Select district —</option>
                {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Road</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Galle Road, Colombo 03" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 text-base">
            {loading ? 'Issuing Fine...' : 'Issue Fine & Generate Reference'}
          </button>
        </form>
      </div>
    </div>
  );
}

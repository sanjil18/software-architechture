import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookupFine } from '../services/api';

export default function LookupPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fine = await lookupFine(referenceNumber, categoryCode);
      navigate('/pay', { state: { fine } });
    } catch (err) {
      setError(err.response?.data?.message || 'Fine not found. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your Fine</h2>
        <p className="text-gray-500 mb-6">
          Enter the reference number and category code from your fine sheet to proceed with payment.
        </p>

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fine Reference Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
              placeholder="e.g. TF-1234567890-ABCDEF"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fine Category Code
            </label>
            <input
              type="text"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value.toUpperCase())}
              placeholder="e.g. CAT001"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Find My Fine'}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <strong>Where to find your details?</strong> The reference number and category code are printed
        on the traffic fine sheet issued by the police officer.
      </div>
    </div>
  );
}

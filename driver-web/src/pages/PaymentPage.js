import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../services/api';

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const fine = state?.fine;

  const [form, setForm] = useState({
    payerName: '',
    payerEmail: '',
    payerPhone: '',
    paymentMethod: 'CARD',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!fine) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await processPayment({
        referenceNumber: fine.referenceNumber,
        categoryCode: fine.categoryCode,
        ...form,
        channel: 'WEB_PORTAL',
      });
      if (result.success) {
        navigate('/success', { state: { result } });
      } else {
        setError(result.message || 'Payment failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Fine Summary */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Fine Summary</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-500">Reference</div>
          <div className="font-mono font-medium">{fine.referenceNumber}</div>
          <div className="text-gray-500">Violation</div>
          <div className="font-medium">{fine.categoryName}</div>
          <div className="text-gray-500">Vehicle</div>
          <div>{fine.vehicleNumber}</div>
          <div className="text-gray-500">District</div>
          <div>{fine.district}</div>
          <div className="text-gray-500">Issued on</div>
          <div>{new Date(fine.issuedAt).toLocaleDateString()}</div>
          <div className="text-gray-500 font-semibold">Amount Due</div>
          <div className="text-blue-900 font-bold text-lg">LKR {fine.amount?.toLocaleString()}</div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input name="payerName" value={form.payerName} onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required placeholder="As on NIC" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="payerEmail" value={form.payerEmail} onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="payerPhone" value={form.payerPhone} onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+94XXXXXXXXX" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input name="cardNumber" value={form.cardNumber} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234 5678 9012 3456" maxLength={19} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
              <input name="cardExpiry" value={form.cardExpiry} onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MM/YY" maxLength={5} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input name="cardCvv" value={form.cardCvv} onChange={handleChange} type="password"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="***" maxLength={4} required />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
            {loading ? 'Processing...' : `Pay LKR ${fine.amount?.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
}

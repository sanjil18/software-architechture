import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-6">
          {result?.message || 'Your traffic fine has been paid successfully.'}
        </p>

        {result && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono font-medium">{result.referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono font-medium">{result.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-700">LKR {result.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{new Date(result.paidAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-6">
          The traffic officer has been notified via SMS. You may now collect your driving licence.
        </div>

        <button onClick={() => navigate('/')}
          className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition">
          Done
        </button>
      </div>
    </div>
  );
}

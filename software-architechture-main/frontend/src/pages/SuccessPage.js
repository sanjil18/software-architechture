import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const receipt = state?.receipt;

  if (!receipt) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">❌</div>
          <h1 className="success-title">No Receipt Found</h1>
          <p className="success-sub">Please make a payment first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-sub">
          Your traffic fine has been paid successfully. Your driver's license can now be released.
        </p>

        <div className="sms-notice">
          📱 An SMS notification has been sent to the traffic officer. Please show this receipt to retrieve your license.
        </div>

        <div className="receipt-box">
          <div className="receipt-title">🧾 Payment Receipt</div>
          {[
            ['Reference No.', receipt.referenceNumber],
            ['Payment Ref.', receipt.paymentReference],
            ['Amount Paid', `LKR ${receipt.amount?.toLocaleString()}`],
            ['Date & Time', new Date(receipt.paidAt).toLocaleString('en-LK')],
            ['Status', '✅ PAID'],
          ].map(([label, value]) => (
            <div className="receipt-row" key={label}>
              <span className="receipt-label">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary" style={{ marginTop: 0 }} onClick={() => window.print()}>
          🖨️ Print Receipt
        </button>
        <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/')}>
          Pay Another Fine
        </button>
      </div>
    </div>
  );
}

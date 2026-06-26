import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lookupFine, payFine } from '../services/api';

const STEP_LABELS = ['Find Fine', 'Review', 'Payment'];

export default function PaymentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 form
  const [lookupForm, setLookupForm] = useState({ referenceNumber: '', categoryId: '' });
  const [fineData, setFineData] = useState(null);

  // Step 3 form
  const [paymentForm, setPaymentForm] = useState({
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  // Step 1: Look up fine
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupForm.referenceNumber.trim() || !lookupForm.categoryId.trim()) {
      toast.error('Please enter both fields.');
      return;
    }
    setLoading(true);
    try {
      const result = await lookupFine(lookupForm.referenceNumber.trim(), lookupForm.categoryId.trim());
      setFineData(result.fine);
      setStep(2);
      toast.success('Fine found!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Fine not found. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Process payment
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.cardName || !paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvv) {
      toast.error('Please fill in all payment details.');
      return;
    }
    setLoading(true);
    try {
      const result = await payFine(fineData.id, { paymentMethod: 'online' });
      navigate('/success', { state: { receipt: result.fine } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCard = (val) =>
    val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  const formatExpiry = (val) =>
    val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);

  const isOverdue = fineData && new Date(fineData.dueDate) < new Date();

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">🚔</div>
            <div className="logo-text">
              <span className="logo-title">Sri Lanka Police</span>
              <span className="logo-sub">Traffic Fine Payment Portal</span>
            </div>
          </div>
          <div className="header-badge">🔒 Secure Payment</div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="container">
          {/* Step indicator */}
          <div className="steps">
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={i}>
                <div className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
                  <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
                  <span>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`step-line ${step > i + 1 ? 'active' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Lookup */}
          {step === 1 && (
            <div className="card">
              <h1 className="card-title">🔍 Find Your Fine</h1>
              <p className="card-subtitle">
                Enter the details from your traffic fine sheet issued by the officer.
              </p>
              <form onSubmit={handleLookup}>
                <div className="form-group">
                  <label>Fine Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g., TF-2024-ABCD1234"
                    value={lookupForm.referenceNumber}
                    onChange={(e) => setLookupForm({ ...lookupForm, referenceNumber: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Fine Category ID</label>
                  <input
                    type="text"
                    placeholder="e.g., TF001"
                    value={lookupForm.categoryId}
                    onChange={(e) => setLookupForm({ ...lookupForm, categoryId: e.target.value.toUpperCase() })}
                  />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? '⏳ Searching...' : '🔍 Find My Fine'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && fineData && (
            <div className="card">
              <h1 className="card-title">📋 Review Fine Details</h1>
              <p className="card-subtitle">Please verify the details before proceeding to payment.</p>

              {isOverdue && (
                <div className="warning-box">
                  ⚠️ This fine is overdue since {new Date(fineData.dueDate).toLocaleDateString('en-LK')}. Please pay immediately.
                </div>
              )}

              <div className="fine-detail-card">
                <div className="fine-header">
                  <div>
                    <div className="fine-ref">REF: {fineData.referenceNumber}</div>
                    <div className="fine-category">{fineData.category?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="fine-currency">LKR</div>
                    <div className="fine-amount">{fineData.amount?.toLocaleString()}</div>
                  </div>
                </div>
                {[
                  ['Driver', fineData.driverName],
                  ['License No.', fineData.driverLicense],
                  ['Vehicle No.', fineData.vehicleNumber],
                  ['Violation', fineData.violation],
                  ['Location', fineData.location],
                  ['District', fineData.district],
                  ['Issued On', new Date(fineData.issuedAt).toLocaleDateString('en-LK')],
                  ['Due Date', new Date(fineData.dueDate).toLocaleDateString('en-LK')],
                ].map(([label, value]) => (
                  <div className="fine-row" key={label}>
                    <span className="fine-row-label">{label}</span>
                    <span className="fine-row-value">{value}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={() => setStep(3)}>
                ✅ Confirm & Proceed to Payment
              </button>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setFineData(null); }}>
                ← Go Back
              </button>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && fineData && (
            <div className="card">
              <h1 className="card-title">💳 Payment Details</h1>
              <p className="card-subtitle">
                Paying LKR <strong style={{ color: 'var(--gold)' }}>{fineData.amount?.toLocaleString()}</strong> for {fineData.category?.name}
              </p>

              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={paymentForm.cardName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                  />
                </div>
                <div className="form-group card-num-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: formatCard(e.target.value) })}
                    maxLength={19}
                  />
                </div>
                <div className="card-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiry}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiry: formatExpiry(e.target.value) })}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="divider"><span>Payment Summary</span></div>
                <div className="fine-detail-card" style={{ marginBottom: '1rem' }}>
                  <div className="fine-row">
                    <span className="fine-row-label">Fine Amount</span>
                    <span className="fine-row-value">LKR {fineData.amount?.toLocaleString()}</span>
                  </div>
                  <div className="fine-row">
                    <span className="fine-row-label">Processing Fee</span>
                    <span className="fine-row-value">LKR 0.00</span>
                  </div>
                  <div className="fine-row" style={{ paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600 }}>Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>LKR {fineData.amount?.toLocaleString()}</span>
                  </div>
                </div>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? '⏳ Processing...' : `🔒 Pay LKR ${fineData.amount?.toLocaleString()}`}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setStep(2)}>
                  ← Back to Review
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span className="secure-badge">🔒 SSL Encrypted</span>
        <span>© {new Date().getFullYear()} Sri Lanka Police Department</span>
        <span>Ministry of Public Security</span>
      </footer>
    </div>
  );
}

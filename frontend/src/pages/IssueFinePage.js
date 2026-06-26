import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCategories, issueFine } from '../services/api';

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle',
];

const VEHICLE_TYPES = ['car','motorcycle','bus','truck','three-wheeler','other'];

export default function IssueFinePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [form, setForm] = useState({
    // Driver Info
    driverName: '',
    nicNumber: '',
    driverLicense: '',
    driverPhone: '',
    // Vehicle Info
    vehicleNumber: '',
    vehicleType: '',
    // Fine Details
    categoryId: '',
    district: '',
    customAmount: '',
    location: '',
    badgeNumber: '',
    violation: '',
  });

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'categoryId') {
      const cat = categories.find((c) => c.categoryId === value);
      setSelectedCategory(cat || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.driverName || !form.driverLicense || !form.vehicleNumber ||
        !form.vehicleType || !form.categoryId || !form.district ||
        !form.location || !form.violation) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        driverName: form.driverName,
        driverLicense: form.driverLicense,
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        vehicleType: form.vehicleType,
        location: form.location,
        violation: form.violation,
        district: form.district,
        ...(form.nicNumber && { nicNumber: form.nicNumber }),
        ...(form.driverPhone && { driverPhone: form.driverPhone }),
        ...(form.customAmount && { customAmount: Number(form.customAmount) }),
        ...(form.badgeNumber && { badgeNumber: form.badgeNumber }),
      };
      const result = await issueFine(payload);
      setSubmitted(result.fine);
      toast.success('Fine issued successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue fine.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      driverName: '', nicNumber: '', driverLicense: '', driverPhone: '',
      vehicleNumber: '', vehicleType: '', categoryId: '', district: '',
      customAmount: '', location: '', badgeNumber: '', violation: '',
    });
    setSelectedCategory(null);
    setSubmitted(null);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="issue-success">
        <div className="issue-success-card">
          <div className="issue-success-icon">✅</div>
          <h2 className="issue-success-title">Fine Issued Successfully</h2>
          <p className="issue-success-sub">
            The fine has been recorded. Share the reference number with the driver.
          </p>
          <div className="issue-receipt">
            <div className="issue-receipt-title">📄 Fine Details</div>
            {[
              ['Reference Number', submitted.referenceNumber],
              ['Category', submitted.categoryId],
              ['Driver', submitted.driverName],
              ['Vehicle', submitted.vehicleNumber],
              ['Amount (LKR)', submitted.amount?.toLocaleString()],
              ['District', submitted.district],
              ['Due Date', new Date(submitted.dueDate).toLocaleDateString('en-LK')],
              ['Status', submitted.status?.toUpperCase()],
              ...(submitted.driverPhone
                ? [['Driver SMS', submitted.issuedSmsSent ? `✅ Sent to ${submitted.driverPhone}` : '⚠️ Not sent']]
                : [['Driver SMS', '— No phone number on file']]),
            ].map(([label, value]) => (
              <div className="issue-receipt-row" key={label}>
                <span className="issue-receipt-label">{label}</span>
                <span className="issue-receipt-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="issue-ref-box">
            <div className="issue-ref-label">Reference Number for Driver</div>
            <div className="issue-ref-num">{submitted.referenceNumber}</div>
            <div className="issue-ref-cat">Category ID: {submitted.categoryId}</div>
          </div>
          <div className="issue-btn-row">
            <button className="issue-btn-outline" onClick={() => navigate('/admin/fines')}>
              📋 View All Fines
            </button>
            <button className="issue-btn-primary" onClick={handleReset}>
              ➕ Issue Another Fine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="issue-page">
      {/* Header */}
      <div className="issue-header">
        <div className="issue-header-left">
          <div className="issue-live-dot" />
          <span className="issue-header-title">New Traffic Fine</span>
        </div>
        <div className="issue-header-right">
          <span className="issue-header-date">
            {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="issue-form">

        {/* ── DRIVER INFORMATION ── */}
        <div className="issue-section">
          <div className="issue-section-label">Driver Information</div>
          <div className="issue-grid-2">
            <div className="issue-field">
              <label>Full Name <span className="req">*</span></label>
              <input name="driverName" value={form.driverName}
                onChange={handleChange} placeholder="e.g. Kamal Perera" />
            </div>
            <div className="issue-field">
              <label>NIC Number</label>
              <input name="nicNumber" value={form.nicNumber}
                onChange={handleChange} placeholder="e.g. 199012345678" />
            </div>
            <div className="issue-field">
              <label>License Number <span className="req">*</span></label>
              <input name="driverLicense" value={form.driverLicense}
                onChange={handleChange} placeholder="e.g. WP-1234567" />
            </div>
            <div className="issue-field">
              <label>Phone Number</label>
              <input name="driverPhone" value={form.driverPhone}
                onChange={handleChange} placeholder="e.g. 0771234567" />
            </div>
          </div>
        </div>

        {/* ── VEHICLE INFORMATION ── */}
        <div className="issue-section">
          <div className="issue-section-label">Vehicle Information</div>
          <div className="issue-grid-2">
            <div className="issue-field">
              <label>Vehicle Number <span className="req">*</span></label>
              <input name="vehicleNumber" value={form.vehicleNumber}
                onChange={handleChange} placeholder="e.g. WP CAB-1234"
                style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="issue-field">
              <label>Vehicle Type <span className="req">*</span></label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
                <option value="">Select type...</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── FINE DETAILS ── */}
        <div className="issue-section">
          <div className="issue-section-label">Fine Details</div>
          <div className="issue-grid-2">
            <div className="issue-field">
              <label>Violation Category <span className="req">*</span></label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryId} — {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="issue-field">
              <label>District <span className="req">*</span></label>
              <select name="district" value={form.district} onChange={handleChange}>
                <option value="">Select district...</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="issue-field">
              <label>Amount (LKR)</label>
              <div className="issue-amount-display">
                {selectedCategory ? (
                  <>
                    <span className="issue-amount-value">
                      LKR {selectedCategory.amount.toLocaleString()}
                    </span>
                    <span className="issue-amount-name">{selectedCategory.name}</span>
                  </>
                ) : (
                  <span className="issue-amount-placeholder">
                    <span className="issue-amount-bar" />
                    Sri Lankan Rupees
                  </span>
                )}
              </div>
            </div>
            <div className="issue-field">
              <label>Custom Amount (LKR)</label>
              <input name="customAmount" value={form.customAmount} type="number"
                onChange={handleChange} placeholder="Override amount..." />
            </div>
            <div className="issue-field">
              <label>Location / Road <span className="req">*</span></label>
              <input name="location" value={form.location}
                onChange={handleChange} placeholder="e.g. Galle Road, Colombo" />
            </div>
            <div className="issue-field">
              <label>Officer Badge No.</label>
              <input name="badgeNumber" value={form.badgeNumber}
                onChange={handleChange} placeholder="e.g. PC-45231" />
            </div>
          </div>
          <div className="issue-field" style={{ marginTop: '1rem' }}>
            <label>Violation Description <span className="req">*</span></label>
            <textarea name="violation" value={form.violation}
              onChange={handleChange}
              placeholder="Describe the violation in detail..."
              rows={4} className="issue-textarea" />
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="issue-actions">
          <button type="button" className="issue-btn-outline" onClick={handleReset}>
            🔄 Clear Form
          </button>
          <button type="submit" className="issue-btn-primary" disabled={loading}>
            {loading ? '⏳ Issuing Fine...' : '🚨 Issue Traffic Fine'}
          </button>
        </div>

      </form>
    </div>
  );
}

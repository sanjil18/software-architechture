import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllFines, updateFine, getCategories } from '../services/api';

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu',
  'Batticaloa','Ampara','Trincomalee','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa',
  'Badulla','Monaragala','Ratnapura','Kegalle'];
const VEHICLE_TYPES = ['CAR','MOTORCYCLE','BUS','TRUCK','THREE_WHEELER','OTHER'];
const STATUS_OPTIONS = ['pending','overdue','cancelled'];

export default function EditFinePage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [categories, setCategories] = useState([]);
  const [form,     setForm]       = useState(null);
  const [original, setOriginal]   = useState(null);

  useEffect(() => {
    Promise.all([getAllFines({ limit:1000 }), getCategories()])
    .then(([finesRes, catRes]) => {
     const fine = finesRes.fines.find(f => f.id === id);
      if (!fine) { toast.error('Fine not found.'); navigate('/admin/fines'); return; }
      setOriginal(fine);
      setForm({
        driverName: fine.driverName || '', driverLicense: fine.driverLicense || '',
        nicNumber: fine.nicNumber || '', driverPhone: fine.driverPhone || '',
        vehicleNumber: fine.vehicleNumber || '', vehicleType: fine.vehicleType || '',
        categoryId: fine.categoryId || '', district: fine.district || '',
        amount: fine.amount || '', location: fine.location || '',
        badgeNumber: fine.badgeNumber || '', violation: fine.violation || '',
        status: fine.status || 'pending',
      });
      setCategories(catRes.categories || []);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load fine.'); setLoading(false); });
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]:value }));
    if (name === 'categoryId') {
      const cat = categories.find(c => c.categoryId === value);
      if (cat) setForm(f => ({ ...f, categoryId:value, amount:cat.amount }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFine(id, form);
      toast.success('Fine updated successfully!');
      navigate('/admin/fines');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400, color:'var(--admin-text-muted)', fontSize:'1rem' }}>
      ⏳ Loading fine details...
    </div>
  );

  return (
    <div className="issue-page">
      <div className="issue-header">
        <div className="issue-header-left">
          <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--admin-warning)', boxShadow:'0 0 0 3px rgba(251,191,36,0.2)' }} />
          <span className="issue-header-title">Edit Traffic Fine</span>
          <span className="mono" style={{ color:'var(--admin-primary)', fontSize:'0.8rem', marginLeft:8 }}>{original?.referenceNumber}</span>
        </div>
        <button className="issue-btn-outline" style={{ padding:'8px 16px', fontSize:'0.82rem' }} onClick={() => navigate('/admin/fines')}>
          ← Back to Fines
        </button>
      </div>

      <form onSubmit={handleSubmit} className="issue-form">
        <div className="issue-section">
          <div className="issue-section-label">Fine Status</div>
          <div className="issue-grid-2">
            <div className="issue-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <span style={{ fontSize:'0.72rem', color:'var(--admin-text-muted)', marginTop:4 }}>Note: Paid fines cannot be edited</span>
            </div>
            <div className="issue-field">
              <label>Original Issue Date</label>
              <input readOnly value={original ? new Date(original.issuedAt).toLocaleString('en-LK') : ''} style={{ opacity:0.6, cursor:'not-allowed' }} />
            </div>
          </div>
        </div>

        <div className="issue-section">
          <div className="issue-section-label">Driver Information</div>
          <div className="issue-grid-2">
            <div className="issue-field"><label>Full Name <span className="req">*</span></label><input name="driverName" value={form.driverName} onChange={handleChange} placeholder="e.g. Kamal Perera" /></div>
            <div className="issue-field"><label>NIC Number</label><input name="nicNumber" value={form.nicNumber} onChange={handleChange} placeholder="e.g. 199012345678" /></div>
            <div className="issue-field"><label>License Number <span className="req">*</span></label><input name="driverLicense" value={form.driverLicense} onChange={handleChange} placeholder="e.g. WP-1234567" /></div>
            <div className="issue-field"><label>Phone Number</label><input name="driverPhone" value={form.driverPhone} onChange={handleChange} placeholder="e.g. 0771234567" /></div>
          </div>
        </div>

        <div className="issue-section">
          <div className="issue-section-label">Vehicle Information</div>
          <div className="issue-grid-2">
            <div className="issue-field">
              <label>Vehicle Number <span className="req">*</span></label>
              <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="e.g. WP CAB-1234" style={{ textTransform:'uppercase' }} />
            </div>
            <div className="issue-field">
              <label>Vehicle Type <span className="req">*</span></label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
                <option value="">Select type...</option>
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase().replace('_',' ')}</option>)}              </select>
            </div>
          </div>
        </div>

        <div className="issue-section">
          <div className="issue-section-label">Fine Details</div>
          <div className="issue-grid-2">
            <div className="issue-field">
              <label>Violation Category <span className="req">*</span></label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                <option value="">Select category...</option>
                {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryId} — {cat.name}</option>)}
              </select>
            </div>
            <div className="issue-field">
              <label>District <span className="req">*</span></label>
              <select name="district" value={form.district} onChange={handleChange}>
                <option value="">Select district...</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="issue-field"><label>Amount (LKR) <span className="req">*</span></label><input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Fine amount" /></div>
            <div className="issue-field"><label>Location / Road <span className="req">*</span></label><input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Galle Road, Colombo" /></div>
            <div className="issue-field" style={{ gridColumn:'1/-1' }}><label>Officer Badge No.</label><input name="badgeNumber" value={form.badgeNumber} onChange={handleChange} placeholder="e.g. PC-45231" /></div>
          </div>
          <div className="issue-field" style={{ marginTop:'1rem' }}>
            <label>Violation Description <span className="req">*</span></label>
            <textarea name="violation" value={form.violation} onChange={handleChange} placeholder="Describe the violation in detail..." rows={4} className="issue-textarea" />
          </div>
        </div>

        <div className="issue-section" style={{ background:'rgba(251,191,36,0.05)', borderColor:'rgba(251,191,36,0.2)' }}>
          <div className="issue-section-label" style={{ color:'var(--admin-warning)' }}>⚠️ Edit Notice</div>
          <p style={{ fontSize:'0.82rem', color:'var(--admin-text-muted)', lineHeight:1.6 }}>
            You are editing fine <strong style={{ color:'var(--admin-primary)' }}>{original?.referenceNumber}</strong>.
            Changes will be saved immediately. Paid fines cannot be modified. All edits are logged for audit purposes.
          </p>
        </div>

        <div className="issue-actions">
          <button type="button" className="issue-btn-outline" onClick={() => navigate('/admin/fines')}>✕ Cancel</button>
          <button type="submit" className="issue-btn-primary" disabled={saving} style={{ background:'var(--admin-warning)', color:'var(--admin-bg)' }}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
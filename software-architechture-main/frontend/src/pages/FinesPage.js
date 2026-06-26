import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllFines } from '../services/api';

const STATUS_OPTIONS = ['', 'pending', 'paid', 'overdue', 'cancelled'];
const DISTRICTS = ['', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
  'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'];

export default function FinesPage() {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', district: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchFines = async () => {
    setLoading(true);
    try {
      const params = { limit: 20, ...filters };
      if (!params.status) delete params.status;
      if (!params.district) delete params.district;
      const res = await getAllFines(params);
      setFines(res.fines);
      setPagination({ total: res.total, pages: res.pages });
    } catch (err) {
      toast.error('Failed to load fines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, [filters]);

  const handleFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const statusBadge = (status) => {
    const classes = { pending: 'badge-pending', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled' };
    const icons = { pending: '⏳', paid: '✅', overdue: '🚨', cancelled: '❌' };
    return <span className={`badge ${classes[status]}`}>{icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  return (
    <div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-header-title">📋 Traffic Fine Records ({pagination.total.toLocaleString()} total)</div>
          <div className="table-filters">
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilter('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filters.district}
              onChange={(e) => handleFilter('district', e.target.value)}
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d || 'All Districts'}</option>
              ))}
            </select>
            <button
              className="issue-btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              onClick={() => navigate('/admin/issue-fine')}
            >
              ➕ Issue Fine
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Category</th>
                <th>District</th>
                <th>Amount (LKR)</th>
                <th>Issued</th>
                <th>Status</th>
                <th>Channel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    ⏳ Loading...
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No fines found.
                  </td>
                </tr>
              ) : (
                fines.map((fine) => (
                  <tr key={fine._id}>
                    <td className="mono" style={{ color: 'var(--primary)' }}>{fine.referenceNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{fine.driverName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fine.driverLicense}</div>
                    </td>
                    <td className="mono">{fine.vehicleNumber}</td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{fine.category?.name || fine.categoryId}</div>
                    </td>
                    <td>{fine.district}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 600, fontFamily: 'Space Mono, monospace', fontSize: '0.82rem' }}>
                      {fine.amount?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(fine.issuedAt).toLocaleDateString('en-LK')}
                    </td>
                    <td>{statusBadge(fine.status)}</td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {fine.paymentMethod ? (
                        <span style={{ color: fine.paymentMethod === 'mobile' ? 'var(--accent)' : 'var(--primary)' }}>
                          {fine.paymentMethod === 'mobile' ? '📱 Mobile' : '🌐 Web'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {fine.status !== 'paid' && fine.status !== 'cancelled' ? (
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`/admin/edit-fine/${fine._id}`)}
                        >
                          ✏️ Edit
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Page {filters.page} of {pagination.pages} ({pagination.total} records)
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pg = i + Math.max(1, filters.page - 2);
              if (pg > pagination.pages) return null;
              return (
                <button
                  key={pg}
                  className={`page-btn ${filters.page === pg ? 'active' : ''}`}
                  onClick={() => setFilters((f) => ({ ...f, page: pg }))}
                >
                  {pg}
                </button>
              );
            })}
            <button
              className="page-btn"
              disabled={filters.page >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🚔</div>
          <div className="login-title">Sri Lanka Police</div>
          <div className="login-sub">Traffic Fine Administration Portal</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Official Email</label>
            <input
              type="email"
              placeholder="admin@police.lk"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? '⏳ Signing In...' : '🔐 Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--admin-surface-2)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--admin-text-muted)', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
          For authorized personnel only. Unauthorized access is a criminal offence.
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="/" style={{ color: 'var(--admin-primary)', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Go to Payment Portal
          </a>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Payment Portal Pages
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';

// Admin Portal Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FinesPage from './pages/FinesPage';
import IssueFinePage from './pages/IssueFinePage';
import EditFinePage from './pages/EditFinePage';
import Layout from './components/Layout';

import './App.css';

// Protected route guard for admin
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#080d14', color: '#64748b', fontSize: '1rem'
    }}>
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/admin/login" />;
};

// Home page - choose portal
function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', background: '#080d14', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚔</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>Sri Lanka Police</div>
        <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.25rem' }}>Traffic Fine Management System</div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Payment Portal Card */}
        <div
          onClick={() => navigate('/pay')}
          style={{
            background: '#0f1923', border: '1px solid #1e3a5f', borderRadius: '16px',
            padding: '2rem', width: '240px', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3a5f'}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💳</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
            Payment Portal
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            Pay your traffic fine online using your reference number
          </div>
          <div style={{
            marginTop: '1.25rem', padding: '0.6rem 1.2rem', background: '#3b82f6',
            borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 600,
          }}>
            Pay Fine →
          </div>
        </div>

        {/* Admin Portal Card */}
        <div
          onClick={() => navigate('/admin/login')}
          style={{
            background: '#0f1923', border: '1px solid #1e3a5f', borderRadius: '16px',
            padding: '2rem', width: '240px', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.2s', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e3a5f'}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
            Admin Portal
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            Officer & admin login to manage and issue traffic fines
          </div>
          <div style={{
            marginTop: '1.25rem', padding: '0.6rem 1.2rem', background: '#06b6d4',
            borderRadius: '8px', color: '#080d14', fontSize: '0.85rem', fontWeight: 600,
          }}>
            Admin Login →
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* ── Home: choose portal ── */}
      <Route path="/" element={<HomePage />} />

      {/* ── Payment Portal Routes (public) ── */}
      <Route path="/pay" element={<PaymentPage />} />
      <Route path="/success" element={<SuccessPage />} />

      {/* ── Admin Portal Routes ── */}
      <Route
        path="/admin/login"
        element={user ? <Navigate to="/admin" /> : <LoginPage />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="fines" element={<FinesPage />} />
        <Route path="issue-fine" element={<IssueFinePage />} />
        <Route path="edit-fine/:id" element={<EditFinePage />} />
      </Route>

      {/* Redirect /admin/* to admin login if not matched */}
      <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#1a1a2e', color: '#fff', border: '1px solid #16213e' },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

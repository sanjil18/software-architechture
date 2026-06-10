import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PaymentPage   from './pages/PaymentPage';
import SuccessPage   from './pages/SuccessPage';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FinesPage     from './pages/FinesPage';
import IssueFinePage from './pages/IssueFinePage';
import EditFinePage  from './pages/EditFinePage';
import Layout        from './components/Layout';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/admin/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/"        element={<PaymentPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/admin/login" element={user ? <Navigate to="/admin" /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index               element={<DashboardPage />} />
        <Route path="fines"        element={<FinesPage />} />
        <Route path="issue-fine"   element={<IssueFinePage />} />
        <Route path="edit-fine/:id" element={<EditFinePage />} />
      </Route>
      <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{ duration:4000,
          style:{ background:'#1a1a2e', color:'#fff', border:'1px solid #16213e' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

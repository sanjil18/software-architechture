import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import IssueFine from './pages/IssueFine';
import MyFines from './pages/MyFines';
import OfficerNav from './components/OfficerNav';
import { getProfile } from './services/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('officerToken'));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      getProfile()
        .then(setProfile)
        .catch(() => {
          localStorage.removeItem('officerToken');
          setToken(null);
        });
    }
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem('officerToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('officerToken');
    setToken(null);
    setProfile(null);
  };

  if (!token) return <LoginPage onLogin={handleLogin} />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <OfficerNav profile={profile} onLogout={handleLogout} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<IssueFine />} />
            <Route path="/my-fines" element={<MyFines />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

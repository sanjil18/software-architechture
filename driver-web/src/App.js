import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LookupPage from './pages/LookupPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-900 text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-lg">SLP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Sri Lanka Police</h1>
              <p className="text-blue-200 text-sm">Traffic Fine Payment Portal</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LookupPage />} />
            <Route path="/pay" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>

        <footer className="text-center text-gray-500 text-sm py-6 mt-8 border-t">
          © 2026 Sri Lanka Police Department — Traffic Fine Payment System
        </footer>
      </div>
    </Router>
  );
}

export default App;

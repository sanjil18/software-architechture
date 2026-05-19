import React from 'react';
import { NavLink } from 'react-router-dom';

export default function OfficerNav({ profile, onLogout }) {
  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'
    }`;

  return (
    <header className="bg-blue-900 text-white shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-900 font-bold text-sm">SLP</span>
          </div>
          <div>
            <div className="font-bold text-sm">Officer Portal</div>
            {profile && (
              <div className="text-blue-300 text-xs">{profile.name} · {profile.district} · {profile.badgeNumber}</div>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={navClass}>Issue Fine</NavLink>
          <NavLink to="/my-fines" className={navClass}>My Fines</NavLink>
          <button onClick={onLogout}
            className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 transition">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

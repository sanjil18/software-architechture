import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', icon: '📊', label: 'Dashboard' },
  { to: '/admin/fines', icon: '📋', label: 'All Fines' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles = {
    '/admin': { title: 'Dashboard', sub: 'National traffic fine collection overview' },
    '/admin/fines': { title: 'Fine Records', sub: 'All issued traffic fines nationwide' },
  };

  const current = pageTitles[location.pathname] || { title: 'Admin Portal', sub: '' };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚔</div>
          <div>
            <div className="sidebar-logo-title">SL Police</div>
            <div className="sidebar-logo-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Navigation</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="nav-label" style={{ marginTop: '1rem' }}>Quick Links</div>
          <a href="/pay" className="nav-item" target="_blank" rel="noreferrer">
            <span className="nav-icon">💳</span>
            Payment Portal
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role} · {user?.district}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <div className="content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{current.title}</div>
            <div className="topbar-sub">{current.sub}</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-time">
              {time.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' })}
              &nbsp;&nbsp;
              {time.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

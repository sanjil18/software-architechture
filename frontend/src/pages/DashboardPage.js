import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getAnalytics } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#162336', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
      <div style={{ color: '#64748b', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('amount')
            ? `LKR ${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)' }}>
        ⏳ Loading analytics...
      </div>
    );
  }

  if (!data) return null;

  const { overview, districtStats, categoryStats, monthlyTrend, paymentMethodStats } = data;

  const monthlyData = monthlyTrend.map((m) => ({
    name: `${MONTH_NAMES[m._id.month]} ${m._id.year}`,
    amount: m.totalAmount,
    count: m.count,
  }));

  const pieData = paymentMethodStats.map((p) => ({
    name: p._id === 'mobile' ? 'Mobile App' : 'Web Portal',
    value: p.count,
  }));

  return (
    <div>
      {/* Overview Stats */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">
            {(overview.totalRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="stat-sub">LKR collected nationwide</div>
          <div className="stat-icon">💰</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Fines Paid</div>
          <div className="stat-value">{overview.paidFines.toLocaleString()}</div>
          <div className="stat-sub">{overview.collectionRate}% collection rate</div>
          <div className="stat-icon">✅</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{overview.pendingFines.toLocaleString()}</div>
          <div className="stat-sub">Awaiting payment</div>
          <div className="stat-icon">⏳</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{overview.overdueFines.toLocaleString()}</div>
          <div className="stat-sub">Past due date</div>
          <div className="stat-icon">🚨</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Monthly Trend - full width */}
        <div className="chart-card chart-full">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Monthly Collection Trend</div>
              <div className="chart-sub">Revenue collected over the last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" name="Amount" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* District-wise */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">District-wise Collections</div>
              <div className="chart-sub">Top performing districts</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={districtStats.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalAmount" name="Amount" fill="#38bdf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment method Pie */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Payment Channels</div>
              <div className="chart-sub">Mobile vs Web payments</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category stats table */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-header-title">📑 Fine Category Breakdown</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Fines Collected</th>
              <th>Total Revenue (LKR)</th>
              <th>Avg per Fine</th>
            </tr>
          </thead>
          <tbody>
            {categoryStats.map((cat, i) => (
              <tr key={i}>
                <td className="mono">{cat._id}</td>
                <td>{cat.count.toLocaleString()}</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                  {cat.totalAmount.toLocaleString()}
                </td>
                <td className="mono">{Math.round(cat.totalAmount / cat.count).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

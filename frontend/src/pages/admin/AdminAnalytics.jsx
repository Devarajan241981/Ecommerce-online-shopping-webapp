import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#06b6d4'];

export default function AdminAnalytics() {
  const [monthly, setMonthly] = useState([]);
  const [catSales, setCatSales] = useState([]);
  const [revenue30, setRevenue30] = useState([]);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    api.get('/analytics/monthly-sales/').then(r => setMonthly(r.data));
    api.get('/analytics/category-sales/').then(r => setCatSales(r.data));
  }, []);

  useEffect(() => {
    api.get(`/analytics/revenue/?period=${period}`).then(r => setRevenue30(r.data));
  }, [period]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Analytics</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Detailed performance insights</p>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[['7', '7 Days'], ['30', '30 Days'], ['90', '90 Days']].map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v)} style={{ padding: '10px 24px', borderRadius: 50, border: 'none', background: period === v ? '#6366f1' : 'white', color: period === v ? 'white' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenue30}>
                <defs>
                  <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v}`]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#r1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Orders per Day</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenue30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Monthly Revenue vs Orders</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Sales by Category</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={catSales} dataKey="total" nameKey="product__category__name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {catSales.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`₹${v}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

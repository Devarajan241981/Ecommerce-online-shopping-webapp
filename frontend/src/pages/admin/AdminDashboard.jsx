import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { CurrencyRupeeIcon, ShoppingBagIcon, UsersIcon, TruckIcon, ArchiveBoxIcon, ArrowPathIcon, CubeIcon, StarIcon } from '@heroicons/react/24/outline';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    api.get('/analytics/dashboard/').then(r => setStats(r.data));
    api.get('/analytics/revenue/?period=30').then(r => setRevenue(r.data));
    api.get('/analytics/orders-status/').then(r => setOrderStatus(r.data));
    api.get('/analytics/top-products/').then(r => setTopProducts(r.data));
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats.total_revenue || 0).toLocaleString('en-IN')}`, icon: CurrencyRupeeIcon, color: 'purple', subtext: `₹${(stats.today_revenue || 0).toLocaleString('en-IN')} today`, trend: 'up' },
    { title: 'Total Orders', value: stats.total_orders || 0, icon: ShoppingBagIcon, color: 'blue', subtext: `${stats.new_orders || 0} new orders`, trend: 'up' },
    { title: 'Customers', value: stats.total_customers || 0, icon: UsersIcon, color: 'green', subtext: 'Registered users', trend: 'up' },
    { title: 'Out for Delivery', value: stats.on_delivery || 0, icon: TruckIcon, color: 'orange', subtext: `${stats.shipped || 0} shipped`, trend: 'up' },
    { title: 'Packed Orders', value: stats.packed || 0, icon: ArchiveBoxIcon, color: 'pink', subtext: 'Ready to ship' },
    { title: 'Pending Refunds', value: stats.pending_refunds || 0, icon: ArrowPathIcon, color: 'red', subtext: 'Need review' },
    { title: 'Products', value: stats.total_products || 0, icon: CubeIcon, color: 'purple', subtext: 'Active listings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Welcome back! Here's what's happening in your store.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {statCards.slice(0, 4).map(card => <StatsCard key={card.title} {...card} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {statCards.slice(4).map(card => <StatsCard key={card.title} {...card} />)}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Revenue Chart */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Revenue (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Order Status</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={orderStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Top 10 Best-Selling Products</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="product_name" tick={{ fontSize: 11 }} width={140} />
              <Tooltip formatter={v => [v, 'Units Sold']} />
              <Bar dataKey="total_sold" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

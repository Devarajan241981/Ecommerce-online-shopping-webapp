import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', packed: '#06b6d4', shipped: '#6366f1', out_for_delivery: '#f97316', delivered: '#10b981', cancelled: '#ef4444', returned: '#64748b' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = filter ? `status=${filter}` : '';
    api.get(`/orders/admin/all/?${q}`).then(r => { setOrders(r.data.results || r.data); setLoading(false); });
  }, [filter]);

  const filtered = search ? orders.filter(o => o.order_number.includes(search.toUpperCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase())) : orders;

  const STATUSES = ['', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Orders</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>{orders.length} total orders</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 18px', borderRadius: 50, border: 'none', background: filter === s ? '#6366f1' : 'white', color: filter === s ? 'white' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 13, textTransform: 'capitalize', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {s === '' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number or customer..."
                style={{ width: '100%', padding: '10px 16px 10px 42px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none' }} />
            </div>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#6366f1' }}>#{o.order_number}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontWeight: 600 }}>{o.user?.name || '—'}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{o.user?.email}</p>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{o.items?.length} items</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{o.total_amount}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: o.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: o.payment_status === 'paid' ? '#16a34a' : '#b45309' }}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status], textTransform: 'capitalize' }}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <Link to={`/admin/orders/${o.id}`} style={{ padding: '7px 16px', background: '#ede9fe', borderRadius: 8, color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

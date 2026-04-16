import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => { api.get(`/orders/admin/${id}/`).then(r => setOrder(r.data)); }, [id]);

  const updateStatus = async () => {
    try {
      const res = await api.patch(`/orders/admin/${id}/status/`, { status: newStatus, description, location });
      setOrder(res.data);
      toast.success('Order status updated!');
      setDescription(''); setLocation(''); setNewStatus('');
    } catch { toast.error('Failed to update status'); }
  };

  if (!order) return <div style={{ display: 'flex', minHeight: '100vh' }}><AdminSidebar /><div style={{ flex: 1, marginLeft: 260, padding: 40, textAlign: 'center' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 32 }}>Order #{order.order_number}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            {/* Update Status */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Update Order Status</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14 }}>
                  <option value="">Select new status</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" style={{ padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14 }} />
              </div>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Status description (e.g. Order picked up from warehouse)" style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
              <button onClick={updateStatus} disabled={!newStatus} style={{ padding: '11px 24px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Update Status</button>
            </div>

            {/* Order Items */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Order Items</h2>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{item.product_name}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Size: {item.variant_info?.size} · Color: {item.variant_info?.color} · Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: '#6366f1' }}>₹{item.subtotal}</p>
                </div>
              ))}
            </div>

            {/* Tracking */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Tracking History</h2>
              {order.tracking?.map(t => (
                <div key={t.id} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <p style={{ fontWeight: 600, textTransform: 'capitalize', color: '#0f172a' }}>{t.status.replace(/_/g, ' ')}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{t.description}</p>
                    {t.location && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>📍 {t.location}</p>}
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{new Date(t.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Customer Info</h2>
              <p style={{ fontWeight: 600 }}>{order.user?.name}</p>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{order.user?.email}</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>📞 {order.user?.phone}</p>
            </div>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Shipping Address</h2>
              <p style={{ fontWeight: 600 }}>{order.shipping_address?.name}</p>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, marginTop: 4 }}>
                {order.shipping_address?.line1}{order.shipping_address?.line2 ? `, ${order.shipping_address.line2}` : ''}<br/>
                {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}<br/>
                📞 {order.shipping_address?.phone}
              </p>
            </div>
            <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Payment Summary</h2>
              {[['Items Total', `₹${order.items_total}`], ['Delivery', order.delivery_charge > 0 ? `₹${order.delivery_charge}` : 'FREE'], order.discount_amount > 0 && ['Discount', `-₹${order.discount_amount}`], ['Total', `₹${order.total_amount}`], ['Payment', order.payment_status]].filter(Boolean).map(([l, v], i, arr) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingTop: i === arr.length - 1 ? 10 : 0, borderTop: i === arr.length - 1 ? '2px solid #f1f5f9' : 'none' }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>{l}</span>
                  <span style={{ fontWeight: 600, color: l === 'Payment' ? (v === 'paid' ? '#10b981' : '#f59e0b') : l === 'Total' ? '#6366f1' : '#374151', fontSize: l === 'Total' ? 16 : 14 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

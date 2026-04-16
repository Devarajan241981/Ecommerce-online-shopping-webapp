import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => { api.get(`/orders/${id}/`).then(r => setOrder(r.data)); }, [id]);

  const handleCancel = async () => {
    try {
      await api.post(`/orders/${id}/cancel/`);
      toast.success('Order cancelled');
      const r = await api.get(`/orders/${id}/`);
      setOrder(r.data);
    } catch (err) { toast.error(err.response?.data?.error || 'Cannot cancel'); }
  };

  if (!order) return <div style={{ minHeight: '100vh', background: '#f8fafc' }}><Navbar /><div style={{ textAlign: 'center', padding: 60 }}>Loading...</div></div>;

  const stepIdx = STEPS.indexOf(order.status);
  const addr = order.shipping_address;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px' }}>
        <Link to="/orders" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: 14, display: 'inline-block', marginBottom: 24 }}>← Back to Orders</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Order #{order.order_number}</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={handleCancel} style={{ padding: '10px 20px', background: 'none', border: '2px solid #ef4444', borderRadius: 10, color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Cancel Order</button>
          )}
        </div>

        {/* Progress */}
        {!['cancelled', 'returned', 'return_requested'].includes(order.status) && (
          <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Order Progress</h2>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, left: '5%', right: '5%', height: 3, background: '#e2e8f0' }} />
              <div style={{ position: 'absolute', top: 20, left: '5%', width: `${Math.max(0, (stepIdx / (STEPS.length - 1)) * 90)}%`, height: 3, background: 'linear-gradient(90deg, #6366f1, #ec4899)', transition: 'width 0.5s' }} />
              {STEPS.map((s, i) => (
                <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: i <= stepIdx ? 'linear-gradient(135deg, #6366f1, #ec4899)' : '#f1f5f9', border: `3px solid ${i <= stepIdx ? '#6366f1' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: i <= stepIdx ? 'white' : '#94a3b8', fontSize: 16, position: 'relative', zIndex: 1 }}>
                    {i <= stepIdx ? '✓' : i + 1}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: i === stepIdx ? 700 : 400, color: i <= stepIdx ? '#6366f1' : '#94a3b8', textTransform: 'capitalize', lineHeight: 1.3 }}>{s.replace(/_/g, '\n')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Address */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Delivery Address</h3>
            <p style={{ fontWeight: 600 }}>{addr?.name}</p>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8 }}>{addr?.line1}{addr?.line2 ? `, ${addr.line2}` : ''}<br />{addr?.city}, {addr?.state} - {addr?.pincode}<br />📞 {addr?.phone}</p>
          </div>
          {/* Payment */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Payment Summary</h3>
            {[['Items Total', `₹${order.items_total}`], ['Delivery', order.delivery_charge > 0 ? `₹${order.delivery_charge}` : 'FREE'], order.discount_amount > 0 && ['Discount', `-₹${order.discount_amount}`], order.wallet_amount_used > 0 && ['Wallet Used', `-₹${order.wallet_amount_used}`], ['Total', `₹${order.total_amount}`]].filter(Boolean).map(([l, v], i, arr) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingTop: i === arr.length - 1 ? 10 : 0, borderTop: i === arr.length - 1 ? '2px solid #f1f5f9' : 'none' }}>
                <span style={{ color: '#64748b', fontSize: 14 }}>{l}</span>
                <span style={{ fontWeight: i === arr.length - 1 ? 800 : 600, color: i === arr.length - 1 ? '#6366f1' : '#374151' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 50, background: order.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: order.payment_status === 'paid' ? '#16a34a' : '#b45309', fontWeight: 600 }}>
                {order.payment_status === 'paid' ? '✓ Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Items</h3>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f8fafc' }}>
              <div style={{ width: 60, height: 80, background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👗</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#0f172a' }}>{item.product_name}</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Size: {item.variant_info?.size} · Color: {item.variant_info?.color} · Qty: {item.quantity}</p>
                <p style={{ fontWeight: 700, color: '#6366f1', marginTop: 6 }}>₹{item.subtotal}</p>
              </div>
            </div>
          ))}
        </div>

        {order.status === 'delivered' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
            <Link to="/refund" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>🔄 Request Return / Refund</Link>
          </div>
        )}
      </div>
    </div>
  );
}

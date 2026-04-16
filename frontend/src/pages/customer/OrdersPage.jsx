import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';

const STATUS_COLORS = { pending: 'warning', confirmed: 'info', processing: 'info', packed: 'info', shipped: 'purple', out_for_delivery: 'orange', delivered: 'success', cancelled: 'danger', returned: 'danger' };
const STATUS_ICONS = { pending: '🕐', confirmed: '✅', processing: '⚙️', packed: '📦', shipped: '🚛', out_for_delivery: '🏃', delivered: '🎉', cancelled: '❌', returned: '🔄' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/').then(r => { setOrders(r.data.results || r.data); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>My Orders</h1>
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>📦</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No orders yet</h2>
            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Start Shopping</Link>
          </div>
        ) : orders.map(order => (
          <div key={order.id} style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Order #</p>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{order.order_number}</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 20 }}>{STATUS_ICONS[order.status] || '📋'}</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#6366f1', marginTop: 4, textTransform: 'capitalize' }}>{order.status.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', marginBottom: 16 }}>
              {order.items?.slice(0, 4).map((item, i) => (
                <div key={i} style={{ flexShrink: 0, background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                  <p style={{ fontWeight: 600, color: '#374151' }}>{item.product_name}</p>
                  <p style={{ color: '#94a3b8', marginTop: 2 }}>Size: {item.variant_info?.size} · ×{item.quantity}</p>
                </div>
              ))}
              {(order.items?.length || 0) > 4 && <div style={{ flexShrink: 0, background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', color: '#64748b' }}>+{order.items.length - 4} more</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: '#6366f1' }}>₹{order.total_amount}</span>
              <Link to={`/orders/${order.id}`} style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>View Details →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

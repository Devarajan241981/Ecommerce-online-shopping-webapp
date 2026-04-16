import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RefundPage() {
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [form, setForm] = useState({ order_id: '', reason: '', images: [] });

  useEffect(() => {
    api.get('/orders/?status=delivered').then(r => setOrders(r.data.results || r.data));
    api.get('/refunds/my/').then(r => setRefunds(r.data.results || r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('order_id', form.order_id);
    fd.append('reason', form.reason);
    form.images.forEach(img => fd.append('images', img));
    try {
      await api.post('/refunds/create/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Refund request submitted!');
      const r = await api.get('/refunds/my/');
      setRefunds(r.data.results || r.data);
      setForm({ order_id: '', reason: '', images: [] });
    } catch { toast.error('Failed to submit refund'); }
  };

  const handleChooseMethod = async (refundId, method) => {
    try {
      await api.post(`/refunds/${refundId}/choose-method/`, { method });
      toast.success(`Refund will be processed to ${method === 'wallet' ? 'your wallet' : 'original payment method'}`);
    } catch { toast.error('Failed to choose method'); }
  };

  const STATUS_COLORS = { requested: '#f59e0b', under_review: '#3b82f6', approved: '#10b981', rejected: '#ef4444', processed: '#6366f1' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Returns & Refunds</h1>

        <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Request a Refund</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Select Order *</label>
              <select value={form.order_id} onChange={e => setForm({...form, order_id: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15 }}>
                <option value="">Select an order</option>
                {orders.map(o => <option key={o.id} value={o.id}>#{o.order_number} - ₹{o.total_amount}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Reason for Return *</label>
              <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required rows={4}
                placeholder="Please describe the reason for return (damage, wrong item, size issue, etc.)"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Upload Photos (required)</label>
              <input type="file" multiple accept="image/*" onChange={e => setForm({...form, images: Array.from(e.target.files)})}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14 }} />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Upload clear photos of the item showing the issue</p>
            </div>
            <button type="submit" style={{ padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Submit Refund Request</button>
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>My Refund Requests</h2>
          {refunds.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No refund requests yet</p> : refunds.map(r => (
            <div key={r.id} style={{ padding: 20, borderRadius: 12, border: '1px solid #f1f5f9', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontWeight: 700 }}>Refund Request #{r.id}</p>
                <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[r.status], background: `${STATUS_COLORS[r.status]}20`, padding: '3px 10px', borderRadius: 50, textTransform: 'capitalize' }}>{r.status.replace(/_/g, ' ')}</span>
              </div>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>{r.reason}</p>
              <p style={{ fontWeight: 700, color: '#6366f1' }}>₹{r.amount}</p>
              {r.admin_notes && <p style={{ fontSize: 13, background: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginTop: 12, color: '#374151' }}>Admin: {r.admin_notes}</p>}
              {r.status === 'approved' && !r.customer_choice && (
                <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12 }}>Choose refund method:</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => handleChooseMethod(r.id, 'wallet')} style={{ padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Add to Wallet</button>
                    <button onClick={() => handleChooseMethod(r.id, 'original')} style={{ padding: '10px 20px', background: 'none', border: '2px solid #6366f1', borderRadius: 8, color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>Original Payment</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

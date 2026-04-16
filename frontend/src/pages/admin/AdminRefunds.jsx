import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
const STATUS_COLORS = { requested: '#f59e0b', under_review: '#3b82f6', approved: '#10b981', rejected: '#ef4444', processed: '#6366f1' };

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: '', admin_notes: '', refund_method: '' });

  useEffect(() => { api.get('/refunds/admin/all/').then(r => setRefunds(r.data.results || r.data)); }, []);

  const handleUpdate = async () => {
    try {
      const res = await api.patch(`/refunds/admin/${selected.id}/update/`, form);
      setRefunds(refunds.map(r => r.id === selected.id ? res.data : r));
      setSelected(null);
      toast.success('Refund updated!');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Refund Requests</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>{refunds.filter(r => r.status === 'requested').length} pending review</p>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Customer', 'Order', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {refunds.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#6366f1' }}>#{r.id}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontWeight: 600 }}>{r.user?.name || '—'}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{r.user?.email}</p>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>#{r.order}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{r.amount}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: `${STATUS_COLORS[r.status]}20`, color: STATUS_COLORS[r.status], textTransform: 'capitalize' }}>{r.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13 }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <button onClick={() => { setSelected(r); setForm({ status: r.status, admin_notes: r.admin_notes || '', refund_method: r.refund_method || '' }); }} style={{ padding: '7px 16px', background: '#ede9fe', borderRadius: 8, color: '#6366f1', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24, height: 'fit-content' }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Review Refund #{selected.id}</h2>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}><strong>Customer:</strong> {selected.user?.name}</p>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}><strong>Amount:</strong> ₹{selected.amount}</p>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}><strong>Reason:</strong> {selected.reason}</p>
              {selected.images?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {selected.images.map(img => (
                    <img key={img.id} src={img.image.startsWith('http') ? img.image : `${API}${img.image}`} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                  ))}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Update Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14 }}>
                  {['requested', 'under_review', 'approved', 'rejected', 'processed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              {form.status === 'processed' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Refund Method</label>
                  <select value={form.refund_method} onChange={e => setForm({...form, refund_method: e.target.value})} style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14 }}>
                    <option value="">Select method</option>
                    <option value="wallet">Add to Wallet</option>
                    <option value="original">Original Payment</option>
                  </select>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Admin Notes</label>
                <textarea value={form.admin_notes} onChange={e => setForm({...form, admin_notes: e.target.value})} rows={3} placeholder="Notes to customer..." style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleUpdate} style={{ flex: 1, padding: '11px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Update</button>
                <button onClick={() => setSelected(null)} style={{ padding: '11px 16px', background: '#f1f5f9', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_value: 0, max_discount: '', expiry_date: '', usage_limit: '', is_active: true });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => { api.get('/coupons/admin/').then(r => setCoupons(r.data.results || r.data)); }, []);

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const ms = new Date(expiryDate).getTime();
    if (Number.isNaN(ms)) return false;
    return ms <= Date.now();
  };

  const toDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const normalizePayload = (src) => {
    const payload = { ...src };
    payload.code = (payload.code || '').trim().toUpperCase();
    if (payload.max_discount === '' || payload.max_discount === null) payload.max_discount = null;
    if (payload.usage_limit === '' || payload.usage_limit === null) payload.usage_limit = null;
    if (payload.min_order_value === '' || payload.min_order_value === null) payload.min_order_value = 0;
    if (payload.description === null) payload.description = '';
    return payload;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/coupons/admin/', normalizePayload(form));
      setCoupons([res.data, ...coupons]);
      setShowForm(false);
      toast.success('Coupon created!');
      setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_value: 0, max_discount: '', expiry_date: '', usage_limit: '', is_active: true });
    } catch (err) {
      toast.error(err.response?.data?.expiry_date?.[0] || err.response?.data?.code?.[0] || 'Failed to create coupon');
    }
  };

  const toggleActive = async (c) => {
    try {
      const res = await api.patch(`/coupons/admin/${c.id}/`, { is_active: !c.is_active });
      setCoupons(coupons.map(cp => cp.id === c.id ? res.data : cp));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update coupon');
    }
  };

  const startEdit = (c) => {
    setEditing(c);
    setEditForm({
      id: c.id,
      code: c.code || '',
      description: c.description || '',
      discount_type: c.discount_type || 'percentage',
      discount_value: c.discount_value ?? '',
      min_order_value: c.min_order_value ?? 0,
      max_discount: c.max_discount ?? '',
      expiry_date: toDateTimeLocal(c.expiry_date),
      usage_limit: c.usage_limit ?? '',
      is_active: !!c.is_active,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = normalizePayload(editForm);
      const res = await api.patch(`/coupons/admin/${editing.id}/`, payload);
      setCoupons(coupons.map(cp => cp.id === editing.id ? res.data : cp));
      setEditing(null);
      setEditForm(null);
      toast.success('Coupon updated!');
    } catch (err) {
      toast.error(err.response?.data?.expiry_date?.[0] || err.response?.data?.code?.[0] || 'Failed to update coupon');
    }
  };

  const inputStyle = { width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Coupons</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', background: '#6366f1', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer' }}>+ Create Coupon</button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>New Coupon</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Code *</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="SUMMER20" required style={inputStyle} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Type</label>
                  <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} style={inputStyle}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Value *</label><input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} required style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Min Order ₹</label><input type="number" value={form.min_order_value} onChange={e => setForm({...form, min_order_value: e.target.value})} style={inputStyle} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Max Discount ₹</label><input type="number" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} placeholder="Optional" style={inputStyle} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Usage Limit</label><input type="number" value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})} placeholder="Unlimited" style={inputStyle} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Expiry Date *</label><input type="datetime-local" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} required style={inputStyle} /></div>
              </div>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" style={{...inputStyle, marginBottom: 16}} />
              <button type="submit" style={{ padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Create Coupon</button>
            </form>
          </div>
        )}

        {editing && editForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ width: 900, maxWidth: '95vw', background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, fontSize: 18 }}>Edit Coupon</h2>
                <button onClick={() => { setEditing(null); setEditForm(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 18, color: '#64748b' }}>×</button>
              </div>
              <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Code *</label><input value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} required style={inputStyle} /></div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Type</label>
                    <select value={editForm.discount_type} onChange={e => setEditForm({ ...editForm, discount_type: e.target.value })} style={inputStyle}>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Value *</label><input type="number" value={editForm.discount_value} onChange={e => setEditForm({ ...editForm, discount_value: e.target.value })} required style={inputStyle} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Min Order ₹</label><input type="number" value={editForm.min_order_value} onChange={e => setEditForm({ ...editForm, min_order_value: e.target.value })} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Max Discount ₹</label><input type="number" value={editForm.max_discount} onChange={e => setEditForm({ ...editForm, max_discount: e.target.value })} placeholder="Optional" style={inputStyle} /></div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Usage Limit</label><input type="number" value={editForm.usage_limit} onChange={e => setEditForm({ ...editForm, usage_limit: e.target.value })} placeholder="Unlimited" style={inputStyle} /></div>
                  <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Expiry Date *</label><input type="datetime-local" value={editForm.expiry_date} onChange={e => setEditForm({ ...editForm, expiry_date: e.target.value })} required style={inputStyle} /></div>
                </div>
                <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description (optional)" style={{ ...inputStyle, marginBottom: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: '#334155' }}>
                    <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} />
                    Active
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => { setEditing(null); setEditForm(null); }} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                    <button type="submit" style={{ padding: '10px 18px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Code', 'Type', 'Value', 'Min Order', 'Expiry', 'Used/Limit', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 800, color: '#6366f1', letterSpacing: 1 }}>{c.code}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b', textTransform: 'capitalize' }}>{c.discount_type}</td>
                  <td style={{ padding: '16px 20px', fontWeight: 700 }}>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>₹{c.min_order_value}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: 13 }}>{new Date(c.expiry_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{c.used_count}/{c.usage_limit || '∞'}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {(() => {
                      const expired = isExpired(c.expiry_date);
                      const status =
                        !c.is_active ? 'Inactive' :
                        expired ? 'Expired' :
                        'Active';
                      const style =
                        !c.is_active ? { background: '#fee2e2', color: '#dc2626' } :
                        expired ? { background: '#fef3c7', color: '#b45309' } :
                        { background: '#dcfce7', color: '#16a34a' };
                      return (
                        <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, ...style }}>
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => startEdit(c)} style={{ padding: '6px 14px', background: '#ede9fe', color: '#6366f1', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Edit</button>
                      <button onClick={() => toggleActive(c)} style={{ padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{c.is_active ? 'Disable' : 'Enable'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

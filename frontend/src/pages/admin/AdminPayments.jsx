import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/payments/admin/all/').then(r => setPayments(r.data)).catch(() => {}); }, []);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Payments</h1>
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ background: '#f8fafc' }}>{['Order', 'Razorpay ID', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</th>)}</tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#6366f1' }}>#{p.order}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: 12 }}>{p.razorpay_payment_id || '—'}</td>
                  <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{p.amount}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{p.method || 'Razorpay'}</td>
                  <td style={{ padding: '16px 20px' }}><span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: p.status === 'paid' ? '#dcfce7' : '#fef3c7', color: p.status === 'paid' ? '#16a34a' : '#b45309' }}>{p.status}</span></td>
                  <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

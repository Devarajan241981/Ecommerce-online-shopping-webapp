import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/auth/admin/customers/').then(r => setCustomers(r.data.results || r.data)); }, []);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Customers</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>{customers.length} registered customers</p>
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
                style={{ width: '100%', padding: '10px 16px 10px 42px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none' }} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Customer', 'Phone', 'Email', 'Verified', 'Joined', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{c.name[0]?.toUpperCase()}</div>
                      <p style={{ fontWeight: 600 }}>{c.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{c.phone}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{c.email}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: c.is_verified ? '#dcfce7' : '#fee2e2', color: c.is_verified ? '#16a34a' : '#dc2626' }}>
                      {c.is_verified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13 }}>{new Date(c.date_joined).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>Active</span>
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

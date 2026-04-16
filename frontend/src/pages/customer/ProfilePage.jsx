import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => { api.get('/auth/addresses/').then(r => setAddresses(r.data.results || r.data)); }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/profile/', form);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses/', newAddr);
      setAddresses([...addresses, res.data]);
      setShowAddrForm(false);
      setNewAddr({ name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
      toast.success('Address saved!');
    } catch { toast.error('Failed to save address'); }
  };

  const deleteAddr = async (id) => {
    await api.delete(`/auth/addresses/${id}/`);
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success('Address deleted');
  };

  const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>My Profile</h1>

        {/* Profile Info */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 800 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</h2>
              <p style={{ color: '#94a3b8', marginTop: 4 }}>{user?.email}</p>
              <span style={{ fontSize: 12, background: user?.is_verified ? '#dcfce7' : '#fef3c7', color: user?.is_verified ? '#16a34a' : '#b45309', padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>
                {user?.is_verified ? '✓ Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
          <form onSubmit={saveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
              </div>
            </div>
            <button type="submit" style={{ padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
          </form>
        </div>

        {/* Addresses */}
        <div style={{ background: 'white', borderRadius: 16, padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Saved Addresses</h2>
            <button onClick={() => setShowAddrForm(!showAddrForm)} style={{ padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>+ Add Address</button>
          </div>
          {addresses.map(addr => (
            <div key={addr.id} style={{ padding: 20, borderRadius: 12, border: '1px solid #f1f5f9', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <p style={{ fontWeight: 700 }}>{addr.name}</p>
                  {addr.is_default && <span style={{ fontSize: 11, background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>Default</span>}
                </div>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}<br />📞 {addr.phone}</p>
              </div>
              <button onClick={() => deleteAddr(addr.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Delete</button>
            </div>
          ))}
          {showAddrForm && (
            <form onSubmit={saveAddress} style={{ marginTop: 20, padding: 24, background: '#f8fafc', borderRadius: 12 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} placeholder="Full Name *" required style={inputStyle} />
                <input value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} placeholder="Phone Number *" required style={inputStyle} />
              </div>
              <input value={newAddr.address_line1} onChange={e => setNewAddr({...newAddr, address_line1: e.target.value})} placeholder="Address Line 1 *" required style={{...inputStyle, marginBottom: 12}} />
              <input value={newAddr.address_line2} onChange={e => setNewAddr({...newAddr, address_line2: e.target.value})} placeholder="Address Line 2 (optional)" style={{...inputStyle, marginBottom: 12}} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <input value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} placeholder="City *" required style={inputStyle} />
                <input value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} placeholder="State *" required style={inputStyle} />
                <input value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} placeholder="Pincode *" required style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={newAddr.is_default} onChange={e => setNewAddr({...newAddr, is_default: e.target.checked})} />
                <span style={{ fontSize: 14 }}>Set as default address</span>
              </label>
              <button type="submit" style={{ padding: '12px 24px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Address</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

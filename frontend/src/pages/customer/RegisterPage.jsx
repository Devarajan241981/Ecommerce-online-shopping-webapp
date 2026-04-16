import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register/', form);
      toast.success('Account created! Please verify your OTP.');
      navigate('/verify-otp', { state: { phone: form.phone } });
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e));
      } else toast.error('Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { color: '#cbd5e1', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 16 }}>C</div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800 }}>Create Account</h1>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>Join ClothStore and start shopping!</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 characters" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} placeholder="••••••••" required style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 15, background: 'linear-gradient(135deg, #6366f1, #ec4899)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account...' : 'Create Account & Verify OTP'}
            </button>
          </form>
          <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
            Already have an account? <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

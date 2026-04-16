import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginAdmin(form));
    if (loginAdmin.fulfilled.match(res)) {
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } else {
      toast.error(res.payload?.error || 'Invalid admin credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 20, boxShadow: '0 20px 60px rgba(99,102,241,0.4)' }}>⚡</div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Admin Portal</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>ClothStore Management System</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Admin Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="admin@clothstore.in"
                style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="••••••••"
                style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 15, background: 'linear-gradient(135deg, #6366f1, #ec4899)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
          <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            Customer? <a href="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>Go to Customer Login</a>
          </p>
        </div>

        <div style={{ marginTop: 24, padding: 20, background: 'rgba(99,102,241,0.1)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ color: '#a5b4fc', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>🔒 Restricted Area — Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}

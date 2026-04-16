import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginCustomer } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginCustomer(form));
    if (loginCustomer.fulfilled.match(res)) {
      if (res.payload.needs_otp) {
        navigate('/verify-otp', { state: { phone: res.payload.phone } });
        toast.success('OTP sent to your number!');
      } else {
        toast.success(`Welcome back, ${res.payload.user.name}!`);
        navigate('/dashboard');
      }
    } else {
      toast.error(res.payload?.error || 'Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
      {/* Left side - branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, color: 'white' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, marginBottom: 24, boxShadow: '0 20px 60px rgba(99,102,241,0.4)' }}>C</div>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, textAlign: 'center', lineHeight: 1.2 }}>ClothStore</h1>
        <p style={{ fontSize: 18, color: '#94a3b8', textAlign: 'center', maxWidth: 380, lineHeight: 1.8 }}>Premium fashion for every style. Discover the latest trends in clothing and accessories.</p>
        <div style={{ marginTop: 48, display: 'flex', gap: 40 }}>
          {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - form */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 48, width: '100%', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
          <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 36 }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                placeholder="you@example.com" style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                placeholder="••••••••" style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 28 }}>
            Don't have an account? <Link to="/register" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
          <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            Are you an admin? <Link to="/admin/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Admin Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

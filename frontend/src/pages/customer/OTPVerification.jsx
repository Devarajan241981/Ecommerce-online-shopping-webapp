import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const phone = location.state?.phone || '';

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp/', { phone, otp: otpString });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(setUser(res.data.user));
      toast.success('Phone verified! Welcome to ClothStore 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/send-otp/', { phone });
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend OTP'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: '48px 40px', width: 420, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>📱</div>
        <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Verify Your Phone</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>We sent a 6-digit OTP to <strong style={{ color: '#a5b4fc' }}>+91 {phone}</strong></p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {otp.map((digit, i) => (
            <input key={i} ref={el => inputs.current[i] = el} value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1} style={{ width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700, background: 'rgba(255,255,255,0.1)', border: `2px solid ${digit ? '#6366f1' : 'rgba(255,255,255,0.15)'}`, borderRadius: 12, color: 'white', outline: 'none' }} />
          ))}
        </div>

        <button onClick={handleVerify} disabled={loading} style={{ width: '100%', padding: 15, background: 'linear-gradient(135deg, #6366f1, #ec4899)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>
          Didn't receive? <span style={{ color: '#6366f1', fontWeight: 600 }}>Resend OTP</span>
        </button>
      </div>
    </div>
  );
}

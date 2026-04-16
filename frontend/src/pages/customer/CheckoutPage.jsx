import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPaise }
  const [useWallet, setUseWallet] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '' });
  const [addingAddr, setAddingAddr] = useState(false);

  useEffect(() => {
    api.get('/auth/addresses/').then(r => { const addrs = r.data.results || r.data; setAddresses(addrs); if (addrs.length) setSelectedAddr(addrs.find(a => a.is_default)?.id || addrs[0].id); });
    api.get('/wallet/').then(r => setWallet(r.data));
  }, []);

  const toPaise = (val) => {
    const n = Number.parseFloat(val ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  };

  const fromPaise = (paise) => (Math.max(0, Number(paise) || 0) / 100).toFixed(2);

  const itemsTotalPaise = useMemo(() => toPaise(cart?.total), [cart?.total]);
  const deliveryPaise = useMemo(() => (itemsTotalPaise >= 49900 ? 0 : 4900), [itemsTotalPaise]);
  const discountPaise = useMemo(() => {
    if (!appliedCoupon?.discountPaise) return 0;
    return Math.min(appliedCoupon.discountPaise, itemsTotalPaise);
  }, [appliedCoupon?.discountPaise, itemsTotalPaise]);
  const amountDuePaise = useMemo(() => Math.max(0, itemsTotalPaise - discountPaise + deliveryPaise), [itemsTotalPaise, discountPaise, deliveryPaise]);
  const walletBalancePaise = useMemo(() => toPaise(wallet?.balance), [wallet?.balance]);
  const walletUsedPaise = useMemo(() => (useWallet ? Math.min(walletBalancePaise, amountDuePaise) : 0), [useWallet, walletBalancePaise, amountDuePaise]);
  const totalPaise = useMemo(() => Math.max(0, amountDuePaise - walletUsedPaise), [amountDuePaise, walletUsedPaise]);

  const validateCoupon = async () => {
    try {
      if (itemsTotalPaise <= 0) { toast.error('Cart total is 0'); return; }
      const normalized = (couponInput || '').trim().toUpperCase();
      if (!normalized) { toast.error('Enter a coupon code'); return; }
      const res = await api.post('/coupons/validate/', { code: normalized, order_total: fromPaise(itemsTotalPaise) });
      if (res.data.valid) {
        const discount = toPaise(res.data.discount);
        setAppliedCoupon({ code: normalized, discountPaise: discount });
        setCouponInput(normalized);
        toast.success(`Coupon applied! Saved ₹${res.data.discount}`);
      } else {
        toast.error(res.data.error);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  // If cart total changes (qty changes), re-validate the applied coupon so totals stay consistent.
  useEffect(() => {
    const code = appliedCoupon?.code;
    if (!code) return;
    let cancelled = false;
    (async () => {
      try {
        if (itemsTotalPaise <= 0) return;
        const res = await api.post('/coupons/validate/', { code, order_total: fromPaise(itemsTotalPaise) });
        if (cancelled) return;
        if (res.data.valid) {
          const discount = toPaise(res.data.discount);
          setAppliedCoupon(prev => (prev?.code === code ? { ...prev, discountPaise: discount } : prev));
        } else {
          setAppliedCoupon(null);
          toast.error(res.data.error || 'Coupon is no longer valid');
        }
      } catch {
        // Keep existing applied coupon if validation temporarily fails.
      }
    })();
    return () => { cancelled = true; };
  }, [itemsTotalPaise, appliedCoupon?.code]);

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const coupon_code = appliedCoupon?.code || '';
      const res = await api.post('/orders/create/', { address_id: selectedAddr, coupon_code, use_wallet: useWallet });
      const { order_id, order_number } = res.data;
      if (parseFloat(res.data.total) === 0) { toast.success('Order placed! 🎉'); navigate('/orders'); return; }
      const rzRes = await api.post('/payments/create-order/', { order_id });
      if (rzRes.data.zero_payment) { navigate('/orders'); return; }
      const options = {
        key: rzRes.data.key, amount: rzRes.data.amount, currency: 'INR',
        name: 'ClothStore', description: `Order #${order_number}`,
        order_id: rzRes.data.razorpay_order_id,
        prefill: { name: rzRes.data.name, email: rzRes.data.email, contact: `+91${rzRes.data.phone}` },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify/', response);
            toast.success('Payment successful! 🎉');
            navigate('/orders');
          } catch { toast.error('Payment verification failed'); }
        },
        modal: { ondismiss: () => toast.error('Payment cancelled') }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const saveAddress = async () => {
    try {
      const res = await api.post('/auth/addresses/', newAddr);
      const addrs = [...addresses, res.data];
      setAddresses(addrs);
      setSelectedAddr(res.data.id);
      setAddingAddr(false);
      toast.success('Address saved!');
    } catch { toast.error('Failed to save address'); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 36 }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
          <div>
            {/* Addresses */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: 17 }}>Delivery Address</h2>
                <button onClick={() => setAddingAddr(!addingAddr)} style={{ background: 'none', border: '1px solid #6366f1', borderRadius: 8, color: '#6366f1', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Add New</button>
              </div>
              {addresses.map(addr => (
                <div key={addr.id} onClick={() => setSelectedAddr(addr.id)} style={{ padding: 16, borderRadius: 12, border: `2px solid ${selectedAddr === addr.id ? '#6366f1' : '#f1f5f9'}`, marginBottom: 12, cursor: 'pointer', background: selectedAddr === addr.id ? '#ede9fe' : 'white', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontWeight: 700, color: '#0f172a' }}>{addr.name} · {addr.phone}</p>
                    {addr.is_default && <span style={{ fontSize: 11, background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: 50 }}>Default</span>}
                  </div>
                  <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              ))}
              {addingAddr && (
                <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, marginTop: 16 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>New Address</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <input value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} placeholder="Full Name" style={inputStyle} />
                    <input value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} placeholder="Phone Number" style={inputStyle} />
                  </div>
                  <input value={newAddr.address_line1} onChange={e => setNewAddr({...newAddr, address_line1: e.target.value})} placeholder="Address Line 1" style={{...inputStyle, marginBottom: 12}} />
                  <input value={newAddr.address_line2} onChange={e => setNewAddr({...newAddr, address_line2: e.target.value})} placeholder="Address Line 2 (optional)" style={{...inputStyle, marginBottom: 12}} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <input value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} placeholder="City" style={inputStyle} />
                    <input value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} placeholder="State" style={inputStyle} />
                    <input value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} placeholder="Pincode" style={inputStyle} />
                  </div>
                  <button onClick={saveAddress} style={{ padding: '10px 24px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Address</button>
                </div>
              )}
            </div>

          {/* Coupon */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Coupon Code</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter coupon code" style={{ flex: 1, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15 }} />
              <button onClick={validateCoupon} style={{ padding: '12px 24px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                {appliedCoupon?.code ? 'Replace' : 'Apply'}
              </button>
            </div>
            {appliedCoupon?.code && (
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <p style={{ color: '#10b981', fontSize: 14, fontWeight: 600, margin: 0 }}>✓ Applied <span style={{ fontWeight: 800 }}>{appliedCoupon.code}</span> · You save ₹{fromPaise(discountPaise)}</p>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Remove</button>
              </div>
            )}
          </div>

          {/* Wallet */}
          {wallet && wallet.balance > 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: 17 }}>ClothStore Wallet</h2>
                    <p style={{ color: '#10b981', fontWeight: 700, fontSize: 18, marginTop: 4 }}>Balance: ₹{wallet.balance}</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} style={{ width: 18, height: 18 }} />
                    <span style={{ fontWeight: 600 }}>Use wallet</span>
                  </label>
                </div>
                {useWallet && walletUsedPaise > 0 && <p style={{ color: '#6366f1', fontSize: 14, marginTop: 12 }}>₹{fromPaise(walletUsedPaise)} will be deducted from wallet</p>}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, position: 'sticky', top: 100 }}>
              <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>Order Summary</h2>
              <div style={{ maxHeight: 250, overflowY: 'auto', marginBottom: 20 }}>
                {cart?.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: '#374151' }}>{item.product_detail?.name} ×{item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                {[
                  ['Subtotal', `₹${fromPaise(itemsTotalPaise)}`],
                  ['Delivery', deliveryPaise === 0 ? 'FREE' : `₹${fromPaise(deliveryPaise)}`],
                  appliedCoupon?.code && discountPaise > 0 && ['Coupon Discount', `-₹${fromPaise(discountPaise)}`],
                  useWallet && walletUsedPaise > 0 && ['Wallet Used', `-₹${fromPaise(walletUsedPaise)}`],
                ].filter(Boolean).map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#64748b', fontSize: 14 }}>{l}</span>
                    <span style={{ fontWeight: 600, color: l.includes('Discount') || l.includes('Wallet') ? '#10b981' : '#374151' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #f1f5f9', marginTop: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 17 }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: '#6366f1' }}>₹{fromPaise(totalPaise)}</span>
                </div>
              </div>
              <button onClick={handlePlaceOrder} disabled={loading} style={{ width: '100%', marginTop: 20, padding: '15px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Processing...' : totalPaise === 0 ? 'Place Order (Free)' : `Pay ₹${fromPaise(totalPaise)} via Razorpay`}
              </button>
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>🔒 Secured by Razorpay · SSL Encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

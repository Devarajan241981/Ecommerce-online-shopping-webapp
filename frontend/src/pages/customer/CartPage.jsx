import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import Navbar from '../../components/common/Navbar';
import CartSidebar from '../../components/customer/CartSidebar';
import toast from 'react-hot-toast';
const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector(s => s.cart);
  useEffect(() => { dispatch(fetchCart()); }, []);
  const delivery = cart?.total >= 499 ? 0 : 49;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <CartSidebar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Shopping Cart ({cart?.item_count || 0} items)</h1>
        {!cart?.items?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Your cart is empty</h2>
            <p style={{ color: '#94a3b8', marginBottom: 28 }}>Add items to your cart to proceed</p>
            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Continue Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
            <div>
              {cart.items.map(item => {
                const img = item.product_detail?.primary_image?.image;
                const imgUrl = img ? (img.startsWith('http') ? img : `${API}${img}`) : null;
                return (
                  <div key={item.id} style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, display: 'flex', gap: 20, border: '1px solid #f1f5f9' }}>
                    <div style={{ width: 100, height: 130, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#f8fafc' }}>
                      {imgUrl ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👗</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link to={`/products/${item.product_detail?.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{item.product_detail?.name}</h3>
                      </Link>
                      {item.variant_detail && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Size: {item.variant_detail.size} · Color: {item.variant_detail.color}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 4px' }}>
                          <button onClick={() => dispatch(updateCartItem({ item_id: item.id, quantity: item.quantity - 1 }))} style={{ padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 700, fontSize: 18 }}>−</button>
                          <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => dispatch(updateCartItem({ item_id: item.id, quantity: item.quantity + 1 }))} style={{ padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 700, fontSize: 18 }}>+</button>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#6366f1' }}>₹{item.subtotal}</span>
                        <button onClick={() => { dispatch(removeFromCart(item.id)); toast.success('Removed!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #f1f5f9', position: 'sticky', top: 100 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Order Summary</h2>
                {[['Subtotal', `₹${cart.total}`], ['Delivery', delivery === 0 ? 'FREE' : `₹${delivery}`], ['Total', `₹${parseFloat(cart.total) + delivery}`]].map(([l, v], i) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 2 ? 16 : 0, paddingTop: i === 2 ? 16 : 0, borderTop: i === 2 ? '2px solid #f1f5f9' : 'none' }}>
                    <span style={{ color: i === 2 ? '#0f172a' : '#64748b', fontWeight: i === 2 ? 800 : 400, fontSize: i === 2 ? 18 : 15 }}>{l}</span>
                    <span style={{ fontWeight: i === 2 ? 800 : 600, color: i === 2 ? '#6366f1' : v === 'FREE' ? '#10b981' : '#374151', fontSize: i === 2 ? 20 : 15 }}>{v}</span>
                  </div>
                ))}
                {delivery > 0 && <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 12 }}>Add ₹{499 - cart.total} more for free delivery!</p>}
                <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ width: '100%', marginTop: 24, fontSize: 16, padding: '14px' }}>
                  Proceed to Checkout →
                </button>
                <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 16, color: '#6366f1', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

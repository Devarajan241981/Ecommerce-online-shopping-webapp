import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { fetchCart, updateCartItem, removeFromCart, toggleCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function CartSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isOpen } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [isAuthenticated]);

  const handleQty = (item_id, qty) => {
    dispatch(updateCartItem({ item_id, quantity: qty }));
  };

  const handleRemove = (item_id) => {
    dispatch(removeFromCart(item_id));
    toast.success('Removed from cart');
  };

  const handleCheckout = () => {
    dispatch(toggleCart());
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={() => dispatch(toggleCart())} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 420, background: 'white', zIndex: 1200, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)' }} className="animate-slideIn">
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Shopping Cart ({cart?.item_count || 0})</h2>
          <button onClick={() => dispatch(toggleCart())} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {!cart?.items?.length ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <ShoppingCartIcon style={{ width: 60, height: 60, margin: '0 auto 16px', display: 'block', color: '#e2e8f0' }} />
              <p style={{ fontSize: 16, fontWeight: 500 }}>Your cart is empty</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Add some items to get started</p>
            </div>
          ) : (
            cart.items.map(item => {
              const img = item.product_detail?.primary_image?.image;
              const imgUrl = img ? (img.startsWith('http') ? img : `${API}${img}`) : 'https://via.placeholder.com/80';
              return (
                <div key={item.id} style={{ display: 'flex', gap: 16, marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                  <img src={imgUrl} alt={item.product_detail?.name} style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#1e293b' }}>{item.product_detail?.name}</h4>
                    {item.variant_detail && <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{item.variant_detail.size} / {item.variant_detail.color}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', padding: '4px 8px' }}>
                        <button onClick={() => handleQty(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', display: 'flex' }}><MinusIcon style={{ width: 16, height: 16 }} /></button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => handleQty(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', display: 'flex' }}><PlusIcon style={{ width: 16, height: 16 }} /></button>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>₹{item.subtotal}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', alignSelf: 'flex-start' }}>
                    <TrashIcon style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, color: '#64748b' }}>Subtotal</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>₹{cart.total}</span>
            </div>
            <p style={{ fontSize: 12, color: '#10b981', marginBottom: 16 }}>✓ Free delivery on orders above ₹499</p>
            <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '14px' }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

import { ShoppingCartIcon } from '@heroicons/react/24/outline';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured, fetchCategories } from '../../store/slices/productSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import Navbar from '../../components/common/Navbar';
import CartSidebar from '../../components/customer/CartSidebar';
import ProductCard from '../../components/common/ProductCard';
import { ShoppingBagIcon, HeartIcon, WalletIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { featured } = useSelector(s => s.products);
  const { cart } = useSelector(s => s.cart);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
    dispatch(fetchCart());
  }, []);

  const quickLinks = [
    { icon: ClipboardDocumentListIcon, label: 'My Orders', path: '/orders', color: '#6366f1', bg: '#ede9fe', desc: 'Track your orders' },
    { icon: HeartIcon, label: 'Wishlist', path: '/wishlist', color: '#ec4899', bg: '#fce7f3', desc: 'Saved items' },
    { icon: WalletIcon, label: 'Wallet', path: '/wallet', color: '#10b981', bg: '#d1fae5', desc: 'Check balance' },
    { icon: ShoppingBagIcon, label: 'Shop Now', path: '/products', color: '#f59e0b', bg: '#fef3c7', desc: 'Browse all' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <CartSidebar />

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)', fontSize: 120, opacity: 0.1 }}>👗</div>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Welcome back</p>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Hey, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 28 }}>Discover the latest fashion trends curated just for you.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/products" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, fontSize: 15 }}>Browse Collection →</Link>
            <Link to="/orders" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 600, fontSize: 15, border: '1px solid rgba(255,255,255,0.2)' }}>View Orders</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 40px' }}>
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 48 }}>
          {quickLinks.map(({ icon: Icon, label, path, color, bg, desc }) => (
            <Link key={label} to={path} style={{ textDecoration: 'none', background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #f1f5f9', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: 50, height: 50, background: bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 24, height: 24, color }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{label}</p>
                <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Products */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Trending Now 🔥</h2>
            <p style={{ color: '#64748b', marginTop: 4 }}>Most popular picks this week</p>
          </div>
          <Link to="/products" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>See All →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

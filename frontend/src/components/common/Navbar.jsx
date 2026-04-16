import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/cartSlice';
import { ShoppingCartIcon, HeartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { cart } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const cartCount = cart?.item_count || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?search=${encodeURIComponent(searchQ)}`);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') });
    } catch {}
    dispatch(logout());
    toast.success('Logged out!');
    navigate('/');
  };

  return (
    <nav style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 70, gap: 20 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>C</div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>ClothStore</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 24, marginLeft: 20 }}>
          {[['Men', '/products?gender=men'], ['Women', '/products?gender=women'], ['Unisex', '/products?gender=unisex'], ['Kids', '/products?gender=kids']].map(([label, href]) => (
            <Link key={label} to={href} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#cbd5e1'}>{label}</Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search clothes, brands..."
              style={{ width: '100%', padding: '10px 16px 10px 40px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, color: 'white', fontSize: 14, outline: 'none' }} />
          </div>
        </form>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated && (
            <>
              <Link to="/wishlist" style={{ color: '#cbd5e1', position: 'relative' }}>
                <HeartIcon style={{ width: 24, height: 24 }} />
              </Link>
              <button onClick={() => dispatch(toggleCart())} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', position: 'relative' }}>
                <ShoppingCartIcon style={{ width: 24, height: 24 }} />
                {cartCount > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#ec4899', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
              </button>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(!profileOpen)} style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 16 }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </button>
                {profileOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 48, background: 'white', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', minWidth: 180, overflow: 'hidden', zIndex: 100 }}>
                    {[['Dashboard', '/dashboard'], ['My Orders', '/orders'], ['Profile', '/profile'], ['Wallet', '/wallet'], ['Wishlist', '/wishlist'], ['Support', '/support']].map(([label, to]) => (
                      <Link key={label} to={to} onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '12px 20px', color: '#374151', textDecoration: 'none', fontSize: 14, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.target.style.background = '#f3f4f6'} onMouseLeave={e => e.target.style.background = 'transparent'}>{label}</Link>
                    ))}
                    <hr style={{ margin: 0, border: '1px solid #f3f4f6' }} />
                    <button onClick={handleLogout} style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', color: '#ef4444', fontSize: 14, textAlign: 'left', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Login</Link>
              <Link to="/register" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 20px', borderRadius: 50 }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

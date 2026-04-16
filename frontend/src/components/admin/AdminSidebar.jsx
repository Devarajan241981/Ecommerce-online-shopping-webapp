import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  HomeIcon, ShoppingBagIcon, ClipboardDocumentListIcon,
  UsersIcon, TagIcon, ArrowPathIcon, ChartBarIcon,
  CreditCardIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const navItems = [
  { icon: HomeIcon, label: 'Dashboard', path: '/admin' },
  { icon: ChartBarIcon, label: 'Analytics', path: '/admin/analytics' },
  { icon: ShoppingBagIcon, label: 'Products', path: '/admin/products' },
  { icon: ClipboardDocumentListIcon, label: 'Orders', path: '/admin/orders' },
  { icon: UsersIcon, label: 'Customers', path: '/admin/customers' },
  { icon: CreditCardIcon, label: 'Payments', path: '/admin/payments' },
  { icon: TagIcon, label: 'Coupons', path: '/admin/coupons' },
  { icon: ArrowPathIcon, label: 'Refunds', path: '/admin/refunds' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out!');
    navigate('/admin/login');
  };

  return (
    <div style={{ width: 260, minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50 }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20 }}>C</div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>ClothStore</div>
            <div style={{ color: '#6366f1', fontSize: 11, fontWeight: 600 }}>ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Admin info */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Administrator</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, marginBottom: 4,
              background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(236,72,153,0.15))' : 'transparent',
              color: active ? '#a5b4fc' : '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400,
              border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}>
              <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
          <ArrowRightOnRectangleIcon style={{ width: 20, height: 20 }} />
          Logout
        </button>
      </div>
    </div>
  );
}

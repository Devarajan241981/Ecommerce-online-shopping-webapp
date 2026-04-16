import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured, fetchCategories } from '../../store/slices/productSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import Navbar from '../../components/common/Navbar';
import ProductCard from '../../components/common/ProductCard';
import CartSidebar from '../../components/customer/CartSidebar';

const BANNERS = [
  { title: "New Season Arrivals", subtitle: "Discover the latest fashion trends", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", tag: "MEN'S COLLECTION" },
  { title: "Women's Exclusive", subtitle: "Elegant styles for every occasion", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", tag: "WOMEN'S COLLECTION" },
  { title: "Unisex Essentials", subtitle: "Style that fits everyone", bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", tag: "UNISEX" },
];

const CATEGORY_ICONS = { tshirts: '👕', shirts: '👔', jeans: '👖', shorts: '🩳', dresses: '👗', kurtis: '🥻', jackets: '🧥', ethnic: '👘' };

export default function LandingPage() {
  const dispatch = useDispatch();
  const { featured, categories } = useSelector(s => s.products);
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
    if (isAuthenticated) dispatch(fetchCart());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <CartSidebar />

      {/* Hero Banner */}
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', overflow: 'hidden', minHeight: 520 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.2) 0%, transparent 40%)' }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 40px', position: 'relative', display: 'flex', alignItems: 'center', gap: 60 }}>
          <div style={{ flex: 1 }}>
            <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>NEW COLLECTION 2025</span>
            <h1 style={{ color: 'white', fontSize: 58, fontWeight: 900, lineHeight: 1.1, margin: '20px 0', letterSpacing: '-1px' }}>
              Fashion That<br /><span style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Defines You</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.8, maxWidth: 460, marginBottom: 36 }}>
              Explore premium quality clothing for Men, Women & Kids. Fast delivery, easy returns.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="/products" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', textDecoration: 'none', padding: '16px 36px', borderRadius: 50, fontWeight: 700, fontSize: 16, boxShadow: '0 8px 30px rgba(99,102,241,0.5)', transition: 'transform 0.2s' }}>Shop Now →</Link>
              {!isAuthenticated && <Link to="/register" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', padding: '16px 36px', borderRadius: 50, fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.2)' }}>Join Free</Link>}
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
              {[['10K+', 'Products'], ['50K+', 'Happy Customers'], ['Free', 'Delivery above ₹499']].map(([v, l]) => (
                <div key={l}><div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>{v}</div><div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 380, height: 480, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))', borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', fontSize: 100 }}>👗</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 40px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Shop by Category</h2>
            <p style={{ color: '#64748b' }}>Find exactly what you're looking for</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {[['All', '/products', '🛍️'],['Men', '/products?gender=men', '👔'],['Women', '/products?gender=women', '👗'],['Unisex', '/products?gender=unisex', '🔀'],['T-Shirts', '/products?search=tshirt', '👕'],['Jeans', '/products?search=jeans', '👖'],['Shorts', '/products?search=shorts', '🩳'],['Dresses', '/products?search=dress', '💃']].map(([name, href, icon]) => (
            <Link key={name} to={href} style={{ flexShrink: 0, textDecoration: 'none', background: 'white', borderRadius: 16, padding: '20px 28px', textAlign: 'center', border: '2px solid #f1f5f9', transition: 'all 0.3s', minWidth: 120 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 40px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Featured Products</h2>
              <p style={{ color: '#64748b' }}>Handpicked favorites for you</p>
            </div>
            <Link to="/products?is_featured=true" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Promo Banners */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 20, padding: 40, color: 'white' }}>
            <p style={{ opacity: 0.8, fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>NEW ARRIVALS</p>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Men's Summer Collection</h3>
            <Link to="/products?gender=men" style={{ background: 'white', color: '#6366f1', textDecoration: 'none', padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: 14, display: 'inline-block' }}>Shop Men →</Link>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 20, padding: 40, color: 'white' }}>
            <p style={{ opacity: 0.8, fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>WOMEN'S PICKS</p>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Trending Dresses & More</h3>
            <Link to="/products?gender=women" style={{ background: 'white', color: '#e11d48', textDecoration: 'none', padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: 14, display: 'inline-block' }}>Shop Women →</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>C</div>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>ClothStore</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8 }}>Premium fashion for every style. Quality clothing delivered to your door.</p>
            </div>
            {[['Quick Links', [['Home','/'],['Men','/products?gender=men'],['Women','/products?gender=women'],['New Arrivals','/products?ordering=-created_at']]],
              ['Customer Care', [['My Orders','/orders'],['Returns & Refunds','/refund'],['Wallet','/wallet'],['Support','/support']]],
              ['Contact', [['📧 support@clothstore.in'],['📞 1800-CLOTHSTORE'],['⏰ Mon-Sat 9AM-6PM']]]
            ].map(([title, links]) => (
              <div key={title}>
                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>{title}</h4>
                {links.map(([l, href]) => href ? (
                  <Link key={l} to={href} style={{ display: 'block', color: '#64748b', textDecoration: 'none', marginBottom: 10, fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#a5b4fc'} onMouseLeave={e => e.target.style.color = '#64748b'}>{l}</Link>
                ) : <p key={l} style={{ fontSize: 14, marginBottom: 10 }}>{l}</p>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, textAlign: 'center', fontSize: 13 }}>
            © 2025 ClothStore. All rights reserved. | Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
}

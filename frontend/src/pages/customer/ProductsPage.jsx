import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../../store/slices/productSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import Navbar from '../../components/common/Navbar';
import CartSidebar from '../../components/customer/CartSidebar';
import ProductCard from '../../components/common/ProductCard';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, categories, loading, count } = useSelector(s => s.products);
  const { isAuthenticated } = useSelector(s => s.auth);
  const [filters, setFilters] = useState({ gender: searchParams.get('gender') || '', search: searchParams.get('search') || '', category: searchParams.get('category') || '', min_price: '', max_price: '', min_discount: '', ordering: '-created_at' });

  useEffect(() => { dispatch(fetchCategories()); if (isAuthenticated) dispatch(fetchCart()); }, []);
  // Keep filters in sync with URL query params so navbar links work even when
  // the user is already on `/products` and only the query string changes.
  useEffect(() => {
    const gender = searchParams.get('gender') || '';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const ordering = searchParams.get('ordering');

    setFilters(prev => {
      const next = {
        ...prev,
        gender,
        search,
        category,
        ...(ordering ? { ordering } : {}),
      };
      const changed =
        prev.gender !== next.gender ||
        prev.search !== next.search ||
        prev.category !== next.category ||
        prev.ordering !== next.ordering;
      return changed ? next : prev;
    });
  }, [searchParams]);
  useEffect(() => { buildAndFetch(); }, [filters]);

  const buildAndFetch = () => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    dispatch(fetchProducts(p.toString()));
  };

  const genders = [{ v: '', l: 'All' }, { v: 'men', l: 'Men' }, { v: 'women', l: 'Women' }, { v: 'unisex', l: 'Unisex' }, { v: 'kids', l: 'Kids' }];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <CartSidebar />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 40px' }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar Filters */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><AdjustmentsHorizontalIcon style={{ width: 20, height: 20 }} /> Filters</h3>
              
              {/* Gender */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Gender</p>
                {genders.map(g => (
                  <button key={g.v} onClick={() => setFilters({...filters, gender: g.v})} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 8, border: 'none', background: filters.gender === g.v ? '#ede9fe' : 'transparent', color: filters.gender === g.v ? '#6366f1' : '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: filters.gender === g.v ? 600 : 400, marginBottom: 4 }}>{g.l}</button>
                ))}
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Price Range</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={filters.min_price} onChange={e => setFilters({...filters, min_price: e.target.value})} placeholder="Min ₹" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
                  <input value={filters.max_price} onChange={e => setFilters({...filters, max_price: e.target.value})} placeholder="Max ₹" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>

              {/* Discount */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Min Discount</p>
                {[0, 10, 20, 30, 50, 70].map(d => (
                  <button key={d} onClick={() => setFilters({...filters, min_discount: d === 0 ? '' : d})} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 8, border: 'none', background: filters.min_discount == d ? '#ede9fe' : 'transparent', color: filters.min_discount == d ? '#6366f1' : '#64748b', cursor: 'pointer', fontSize: 14, marginBottom: 4 }}>
                    {d === 0 ? 'All' : `${d}% & above`}
                  </button>
                ))}
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Category</p>
                  <button onClick={() => setFilters({...filters, category: ''})} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 8, border: 'none', background: !filters.category ? '#ede9fe' : 'transparent', color: !filters.category ? '#6366f1' : '#64748b', cursor: 'pointer', fontSize: 14, marginBottom: 4 }}>All Categories</button>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setFilters({...filters, category: c.id})} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 8, border: 'none', background: filters.category == c.id ? '#ede9fe' : 'transparent', color: filters.category == c.id ? '#6366f1' : '#64748b', cursor: 'pointer', fontSize: 14, marginBottom: 4 }}>{c.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div style={{ flex: 1 }}>
            {/* Search bar + sort */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <MagnifyingGlassIcon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                <input value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
                  placeholder="Search products, brands, colors..."
                  style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 15, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={filters.ordering} onChange={e => setFilters({...filters, ordering: e.target.value})} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 12, background: 'white', fontSize: 14, cursor: 'pointer' }}>
                <option value="-created_at">Newest First</option>
                <option value="base_price">Price: Low to High</option>
                <option value="-base_price">Price: High to Low</option>
                <option value="-discount_percentage">Best Discount</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ color: '#64748b', fontSize: 14 }}>{count || products.length} products found</p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {[...Array(8)].map((_, i) => <div key={i} style={{ background: 'white', borderRadius: 16, height: 380, animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
                <p style={{ fontSize: 18, fontWeight: 600 }}>No products found</p>
                <p style={{ marginTop: 8 }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

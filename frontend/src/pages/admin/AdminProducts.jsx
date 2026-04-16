import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/products/admin/all/').then(r => { setProducts(r.data.results || r.data); setLoading(false); }); }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (p) => {
    await api.patch(`/products/admin/${p.id}/update/`, { is_active: !p.is_active });
    setProducts(products.map(pr => pr.id === p.id ? { ...pr, is_active: !pr.is_active } : pr));
    toast.success(`Product ${!p.is_active ? 'activated' : 'deactivated'}`);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/admin/${id}/update/`);
    setProducts(products.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Products</h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>{products.length} products total</p>
          </div>
          <Link to="/admin/products/add" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 15 }}>
            <PlusIcon style={{ width: 18, height: 18 }} /> Add Product
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                style={{ width: '100%', padding: '10px 16px 10px 42px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none' }} />
            </div>
          </div>

          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Product', 'Category', 'Price', 'Discount', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const img = p.images?.[0]?.image;
                  const imgUrl = img ? (img.startsWith('http') ? img : `${API}${img}`) : null;
                  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 60, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                            {imgUrl ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👗</div>}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</p>
                            <p style={{ fontSize: 12, color: '#94a3b8' }}>{p.brand} · {p.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b' }}>{p.category?.name || '—'}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a' }}>₹{p.discounted_price}<br/><span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 400 }}>{p.discount_percentage > 0 ? `₹${p.base_price}` : ''}</span></td>
                      <td style={{ padding: '16px 20px' }}>{p.discount_percentage > 0 ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 50, fontWeight: 700, fontSize: 12 }}>{p.discount_percentage}%</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td style={{ padding: '16px 20px', color: totalStock > 10 ? '#10b981' : totalStock > 0 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{totalStock}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <button onClick={() => toggleActive(p)} style={{ padding: '4px 14px', borderRadius: 50, border: 'none', background: p.is_active ? '#dcfce7' : '#fee2e2', color: p.is_active ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link to={`/admin/products/add?edit=${p.id}`} style={{ padding: '6px 12px', background: '#ede9fe', borderRadius: 8, color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                            <PencilIcon style={{ width: 14, height: 14 }} /> Edit
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} style={{ padding: '6px 12px', background: '#fee2e2', borderRadius: 8, color: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                            <TrashIcon style={{ width: 14, height: 14 }} /> Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

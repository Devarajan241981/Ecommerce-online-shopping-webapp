import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([{ size: 'M', color: 'Black', color_hex: '#000000', stock: 50 }]);
  const [form, setForm] = useState({ name: '', category: '', description: '', gender: 'unisex', brand: 'ClothStore', base_price: '', discount_percentage: 0, material: '', care_instructions: '', is_featured: false, is_active: true, tags: '' });

  useEffect(() => { api.get('/products/categories/').then(r => setCategories(r.data.results || r.data)); }, []);

  const addVariant = () => setVariants([...variants, { size: 'M', color: 'Black', color_hex: '#000000', stock: 50 }]);
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, val) => setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      fd.append('variants', JSON.stringify(variants));
  // Let the browser/axios set the multipart Content-Type (including boundary).
  // Manually setting 'Content-Type' can omit the required boundary and cause server errors.
  await api.post('/products/admin/create/', fd);
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (err) {
      const e = err.response?.data;
      if (e) Object.entries(e).forEach(([k, v]) => toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`));
      else toast.error('Failed to create product');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', background: 'white' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Add New Product</h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>Fill in the details to list a new product</p>
          </div>
          <button onClick={() => navigate('/admin/products')} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Left */}
            <div>
              {/* Basic Info */}
              <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Basic Information</h2>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Classic White T-Shirt" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={4} placeholder="Product description..." style={{...inputStyle, resize: 'vertical'}} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Brand *</label>
                    <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender *</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} style={inputStyle}>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required style={inputStyle}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.gender})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="cotton, summer, casual" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Material</label>
                  <input value={form.material} onChange={e => setForm({...form, material: e.target.value})} placeholder="e.g. 100% Cotton" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Care Instructions</label>
                  <textarea value={form.care_instructions} onChange={e => setForm({...form, care_instructions: e.target.value})} rows={3} placeholder="Machine wash cold..." style={{...inputStyle, resize: 'vertical'}} />
                </div>
              </div>

              {/* Images */}
              <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Product Images *</h2>
                <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} required
                  style={{ width: '100%', padding: '12px', border: '2px dashed #e2e8f0', borderRadius: 10, cursor: 'pointer' }} />
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>First image will be the primary image. Supports JPG, PNG, WebP.</p>
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ width: 80, height: 100, borderRadius: 10, overflow: 'hidden', border: i === 0 ? '2px solid #6366f1' : '2px solid #e2e8f0' }}>
                        <img src={URL.createObjectURL(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants */}
              <div style={{ background: 'white', borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontWeight: 700 }}>Variants (Size/Color/Stock) *</h2>
                  <button type="button" onClick={addVariant} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#ede9fe', border: 'none', borderRadius: 8, color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                    <PlusIcon style={{ width: 14, height: 14 }} /> Add Variant
                  </button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 40px', gap: 10, marginBottom: 12, alignItems: 'end' }}>
                    <div>
                      {i === 0 && <label style={labelStyle}>Size</label>}
                      <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} style={inputStyle}>
                        {['XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Color</label>}
                      <input value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="e.g. Black" style={inputStyle} />
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Hex</label>}
                      <input type="color" value={v.color_hex} onChange={e => updateVariant(i, 'color_hex', e.target.value)} style={{ width: '100%', height: 43, border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer' }} />
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Stock</label>}
                      <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value))} min="0" style={inputStyle} />
                    </div>
                    <div>
                      {i === 0 && <div style={{ height: 22 }} />}
                      <button type="button" onClick={() => removeVariant(i)} style={{ padding: '10px', background: '#fee2e2', border: 'none', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}>
                        <TrashIcon style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Pricing</h2>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Base Price (₹) *</label>
                  <input type="number" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} required min="0" step="0.01" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Discount (%)</label>
                  <input type="number" value={form.discount_percentage} onChange={e => setForm({...form, discount_percentage: e.target.value})} min="0" max="100" style={inputStyle} />
                </div>
                {form.base_price && form.discount_percentage > 0 && (
                  <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Selling Price</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>₹{(form.base_price * (1 - form.discount_percentage / 100)).toFixed(2)}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>₹{form.base_price}</p>
                  </div>
                )}
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Settings</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} style={{ width: 18, height: 18 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Featured Product</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>Show on homepage</p>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} style={{ width: 18, height: 18 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Active (Visible)</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>Customers can see this</p>
                  </div>
                </label>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating Product...' : '✓ Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

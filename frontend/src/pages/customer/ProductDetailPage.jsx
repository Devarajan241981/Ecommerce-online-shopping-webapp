import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import Navbar from '../../components/common/Navbar';
import CartSidebar from '../../components/customer/CartSidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StarIcon, HeartIcon, ShoppingCartIcon, TruckIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [tab, setTab] = useState('details');
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    api.get(`/products/${slug}/`).then(r => { setProduct(r.data); }).catch(() => toast.error('Product not found'));
    api.get(`/reviews/product/0/`).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (product) api.get(`/reviews/product/${product.id}/`).then(r => setReviews(r.data.results || r.data));
  }, [product]);

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const v = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
      setSelectedVariant(v || null);
    }
  }, [selectedSize, selectedColor, product]);

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );

  const images = product.images || [];
  const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const colors = [...new Set(product.variants?.filter(v => !selectedSize || v.size === selectedSize).map(v => v.color) || [])];
  const imgUrl = (img) => img?.startsWith('http') ? img : `${API}${img}`;

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    if (!selectedVariant) { toast.error('This variant is unavailable'); return; }
    await dispatch(addToCart({ product_id: product.id, variant_id: selectedVariant.id, quantity: qty }));
    toast.success('Added to cart! 🛒');
  };

  const handleWishlist = async () => {
    try {
      const res = await api.post(`/orders/wishlist/${product.id}/toggle/`);
      setLiked(res.data.liked);
      toast.success(res.data.liked ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Please login first'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(review).forEach(([k, v]) => fd.append(k, v));
      await api.post(`/reviews/product/${product.id}/create/`, fd);
      toast.success('Review submitted!');
      const r = await api.get(`/reviews/product/${product.id}/`);
      setReviews(r.data.results || r.data);
      setReview({ rating: 5, title: '', comment: '' });
    } catch { toast.error('Failed to submit review'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <CartSidebar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
          {/* Images */}
          <div>
            <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', marginBottom: 16, aspectRatio: '3/4' }}>
              {images[selectedImg] ? (
                <img src={imgUrl(images[selectedImg].image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>👗</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setSelectedImg(i)} style={{ width: 80, height: 100, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === selectedImg ? '#6366f1' : 'transparent'}`, flexShrink: 0 }}>
                  <img src={imgUrl(img.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{product.category?.name} · {product.brand}</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 16, lineHeight: 1.3 }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <StarIcon key={i} style={{ width: 18, height: 18, color: '#f59e0b', fill: i < Math.round(product.avg_rating) ? '#f59e0b' : 'none' }} />)}
              </div>
              <span style={{ fontSize: 14, color: '#64748b' }}>{product.avg_rating} ({product.review_count} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#0f172a' }}>₹{product.discounted_price}</span>
              {product.discount_percentage > 0 && (
                <>
                  <span style={{ fontSize: 20, color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.base_price}</span>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: 50, fontSize: 14, fontWeight: 700 }}>{product.discount_percentage}% OFF</span>
                </>
              )}
            </div>

            {/* Size */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>Select Size</p>
                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Size Guide</button>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{ padding: '10px 18px', borderRadius: 10, border: `2px solid ${selectedSize === s ? '#6366f1' : '#e2e8f0'}`, background: selectedSize === s ? '#6366f1' : 'white', color: selectedSize === s ? 'white' : '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontWeight: 600, color: '#374151', fontSize: 15, marginBottom: 12 }}>Color: <span style={{ fontWeight: 400 }}>{selectedColor}</span></p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} style={{ padding: '8px 16px', borderRadius: 10, border: `2px solid ${selectedColor === c ? '#6366f1' : '#e2e8f0'}`, background: selectedColor === c ? '#ede9fe' : 'white', color: selectedColor === c ? '#6366f1' : '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            </div>

            {selectedVariant && <p style={{ fontSize: 13, color: selectedVariant.stock > 0 ? '#10b981' : '#ef4444', marginBottom: 20, fontWeight: 600 }}>
              {selectedVariant.stock > 0 ? `✓ In Stock (${selectedVariant.stock} left)` : '✗ Out of Stock'}
            </p>}

            {/* Quantity */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setQty(Math.max(1, qty-1))} style={{ padding: '12px 18px', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6366f1' }}>−</button>
                <span style={{ padding: '0 16px', fontWeight: 700, fontSize: 16 }}>{qty}</span>
                <button onClick={() => setQty(qty+1)} style={{ padding: '12px 18px', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6366f1' }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <button onClick={handleAddToCart} style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 25px rgba(99,102,241,0.3)' }}>
                <ShoppingCartIcon style={{ width: 20, height: 20 }} /> Add to Cart
              </button>
              <button onClick={handleWishlist} style={{ padding: '16px', border: `2px solid ${liked ? '#ef4444' : '#e2e8f0'}`, borderRadius: 12, background: liked ? '#fef2f2' : 'white', cursor: 'pointer', color: liked ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center' }}>
                {liked ? <HeartSolid style={{ width: 22, height: 22 }} /> : <HeartIcon style={{ width: 22, height: 22 }} />}
              </button>
            </div>

            {/* Features */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20 }}>
              {[['🚚', 'Free Delivery', 'On orders above ₹499'], ['🔄', 'Easy Returns', '7-day hassle-free returns'], ['🛡️', 'Genuine Products', '100% authentic clothing']].map(([icon, title, sub]) => (
                <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div><p style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{title}</p><p style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 60 }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #f1f5f9', marginBottom: 32 }}>
            {['details', 'reviews', 'sizechart'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 28px', background: 'none', border: 'none', borderBottom: `3px solid ${tab === t ? '#6366f1' : 'transparent'}`, color: tab === t ? '#6366f1' : '#64748b', fontWeight: tab === t ? 700 : 500, fontSize: 15, cursor: 'pointer', marginBottom: -2, transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {t === 'details' ? 'Product Details' : t === 'reviews' ? `Reviews (${reviews.length})` : 'Size Chart'}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>Description</h3>
                <p style={{ color: '#64748b', lineHeight: 1.8 }}>{product.description}</p>
                {product.material && <><h4 style={{ fontWeight: 600, marginTop: 20, marginBottom: 8, color: '#374151' }}>Material</h4><p style={{ color: '#64748b' }}>{product.material}</p></>}
              </div>
              <div>
                {product.care_instructions && (
                  <>
                    <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>Care Instructions</h3>
                    <p style={{ color: '#64748b', lineHeight: 1.8 }}>{product.care_instructions}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div>
              {/* Write review */}
              <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 32, border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Write a Review</h3>
                <form onSubmit={handleReview}>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Rating</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1,2,3,4,5].map(r => (
                        <button key={r} type="button" onClick={() => setReview({...review, rating: r})} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28 }}>
                          {r <= review.rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={review.title} onChange={e => setReview({...review, title: e.target.value})} placeholder="Review title" style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 12, fontSize: 14, boxSizing: 'border-box' }} />
                  <textarea value={review.comment} onChange={e => setReview({...review, comment: e.target.value})} placeholder="Share your experience..." rows={4} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ marginTop: 12, padding: '12px 24px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Submit Review</button>
                </form>
              </div>
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f172a' }}>{r.user_name}</p>
                      {r.is_verified_purchase && <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 50, fontWeight: 600 }}>✓ Verified Purchase</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>{[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 16 }}>{i < r.rating ? '⭐' : '☆'}</span>)}</div>
                  </div>
                  {r.title && <p style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>{r.title}</p>}
                  <p style={{ color: '#64748b', lineHeight: 1.7 }}>{r.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No reviews yet. Be the first to review!</p>}
            </div>
          )}

          {tab === 'sizechart' && (
            <div>
              {product.size_chart?.chart_image ? (
                <img src={imgUrl(product.size_chart.chart_image)} alt="Size Chart" style={{ maxWidth: '100%', borderRadius: 12 }} />
              ) : (
                <div style={{ background: 'white', borderRadius: 16, padding: 24, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)', 'Length (in)'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[['S','36-38','30-32','38-40','28'],['M','38-40','32-34','40-42','29'],['L','40-42','34-36','42-44','30'],['XL','42-44','36-38','44-46','31'],['XXL','44-46','38-40','46-48','32']].map(row => (
                        <tr key={row[0]} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {row.map((cell, i) => <td key={i} style={{ padding: '12px 16px', color: '#64748b', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#6366f1' : '#64748b' }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

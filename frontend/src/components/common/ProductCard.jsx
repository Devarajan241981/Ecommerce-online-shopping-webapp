import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function ProductCard({ product, showWishlist = true }) {
  const dispatch = useDispatch();
  const [liked, setLiked] = React.useState(false);
  const imgUrl = product.primary_image?.image
    ? (product.primary_image.image.startsWith('http') ? product.primary_image.image : `${API}${product.primary_image.image}`)
    : 'https://via.placeholder.com/300x400?text=No+Image';

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/orders/wishlist/${product.id}/toggle/`);
      setLiked(res.data.liked);
      toast.success(res.data.liked ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch { toast.error('Please login first'); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 }));
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  return (
    <div className="product-card" style={{ background: 'white', borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
      <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}>
          <img src={imgUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.08)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          {product.discount_percentage > 0 && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: '#ef4444', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
              {product.discount_percentage}% OFF
            </span>
          )}
          {product.is_featured && (
            <span style={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
              FEATURED
            </span>
          )}
          {/* Hover actions */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, opacity: 0, transition: 'opacity 0.3s' }}
            className="card-actions">
            {showWishlist && (
              <button onClick={handleWishlist} style={{ background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                {liked ? <HeartSolid style={{ width: 20, height: 20, color: '#ef4444' }} /> : <HeartIcon style={{ width: 20, height: 20 }} />}
              </button>
            )}
            <button onClick={handleAddToCart} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 20, padding: '8px 16px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <ShoppingCartIcon style={{ width: 16, height: 16 }} /> Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{product.brand || product.category_name}</p>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>₹{product.discounted_price}</span>
              {product.discount_percentage > 0 && (
                <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 8, textDecoration: 'line-through' }}>₹{product.base_price}</span>
              )}
            </div>
            {product.avg_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <StarIcon style={{ width: 14, height: 14, color: '#f59e0b', fill: '#f59e0b' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{product.avg_rating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* CSS for hover */}
      <style>{`.product-card:hover .card-actions { opacity: 1 !important; }`}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import CartSidebar from '../../components/customer/CartSidebar';
import ProductCard from '../../components/common/ProductCard';
import api from '../../services/api';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/orders/wishlist/').then(r => setItems(r.data.results || r.data)); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar /><CartSidebar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>My Wishlist ({items.length})</h1>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><div style={{ fontSize: 60 }}>❤️</div><h2 style={{ marginTop: 20, color: '#374151' }}>Your wishlist is empty</h2></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {items.map(item => <ProductCard key={item.id} product={item.product_detail} />)}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  useEffect(() => { api.get('/wallet/').then(r => setWallet(r.data)); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>My Wallet</h1>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 20, padding: 36, color: 'white', marginBottom: 24, textAlign: 'center' }}>
          <p style={{ opacity: 0.8, marginBottom: 8 }}>Available Balance</p>
          <h2 style={{ fontSize: 48, fontWeight: 800 }}>₹{wallet?.balance || '0.00'}</h2>
          <p style={{ opacity: 0.7, marginTop: 8, fontSize: 14 }}>Use at checkout to save on orders</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Transaction History</h2>
          {!wallet?.transactions?.length ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No transactions yet</p>
          ) : wallet.transactions.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{t.description}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: t.transaction_type === 'credit' ? '#10b981' : '#ef4444' }}>
                {t.transaction_type === 'credit' ? '+' : '-'}₹{t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

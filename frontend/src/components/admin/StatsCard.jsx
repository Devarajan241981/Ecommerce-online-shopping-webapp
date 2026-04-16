import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color, subtext, trend }) {
  const colors = {
    purple: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', icon: '#6366f1', text: '#4f46e5' },
    green: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: '#10b981', text: '#059669' },
    pink: { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)', icon: '#ec4899', text: '#db2777' },
    orange: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b', text: '#d97706' },
    blue: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', icon: '#3b82f6', text: '#2563eb' },
    red: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: '#ef4444', text: '#dc2626' },
  };
  const c = colors[color] || colors.purple;

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: `1px solid ${c.border}`, transition: 'all 0.3s', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ background: c.bg, borderRadius: 12, padding: 12, border: `1px solid ${c.border}` }}>
          <Icon style={{ width: 24, height: 24, color: c.icon }} />
        </div>
      </div>
      {subtext && <p style={{ fontSize: 12, color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8' }}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {subtext}
      </p>}
    </div>
  );
}

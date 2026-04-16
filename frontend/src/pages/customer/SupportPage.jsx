import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const FAQS = [
  ['How do I track my order?', 'Go to My Orders and click on your order to see real-time tracking status.'],
  ['What is the return policy?', '7-day hassle-free returns for all products. Initiate from Returns & Refunds section.'],
  ['How does the wallet work?', 'Your ClothStore wallet gets credited with refunds. Use it at checkout to save on future orders.'],
  ['When will my refund be processed?', 'Refunds are processed within 5-7 business days after approval.'],
  ['Is free delivery available?', 'Yes! Free delivery on all orders above ₹499. Orders below have a ₹49 delivery charge.'],
  ['Can I change or cancel my order?', 'You can cancel orders that are in "Pending" or "Confirmed" status. Go to Order Details to cancel.'],
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const canSend = useMemo(() => !!chatInput.trim() && !sending && !!sessionId, [chatInput, sending, sessionId]);

  const scrollToBottom = () => {
    try { endRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  };

  useEffect(() => { if (chatOpen) scrollToBottom(); }, [chatOpen, messages.length]);

  const openChat = async () => {
    setChatOpen(true);
    try {
      const res = await api.get('/support/chat/');
      setSessionId(res.data.id);
      setMessages(res.data.messages || []);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to open chat');
    }
  };

  const clearChat = async () => {
    try {
      const res = await api.post('/support/chat/clear/');
      setSessionId(res.data.id);
      setMessages(res.data.messages || []);
      toast.success('Started a new chat');
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  const sendMessage = async ({ text, action }) => {
    const t = (text || '').trim();
    if (!sessionId) return;
    if (!t && !action) return;
    setSending(true);
    try {
      if (t) {
        setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: t, payload: {}, created_at: new Date().toISOString() }]);
      }
      const res = await api.post('/support/chat/message/', { session_id: sessionId, text: t || '', action: action || '' });
      if (res.data?.message) setMessages(prev => [...prev, res.data.message]);
      setChatInput('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Customer Support</h1>
        <p style={{ color: '#94a3b8', marginBottom: 36 }}>We're here to help!</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          <a href="tel:1800CLOTHSTORE" style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📞</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Call Us</h3>
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 14 }}>1800-CLOTHSTORE</p>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Mon–Sat 9AM–6PM</p>
          </a>
          <a href="mailto:support@clothstore.in" style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Email Us</h3>
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 14 }}>support@clothstore.in</p>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Response within 24 hours</p>
          </a>
          <button onClick={openChat} style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Chat with BABU</h3>
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 14 }}>Instant help</p>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Orders, returns, payments</p>
          </button>
          <button onClick={() => navigate('/refund')} style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔄</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Returns</h3>
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 14 }}>Start a return</p>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Go to Returns & Refunds</p>
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Frequently Asked Questions</h2>
          {FAQS.map(([q, a], i) => (
            <div key={i} style={{ borderBottom: '1px solid #f8fafc', marginBottom: 0 }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '16px 0', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{q}</span>
                <span style={{ color: '#6366f1', fontSize: 20 }}>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, paddingBottom: 16 }}>{a}</p>}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Send us a message</h2>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describe your issue..." rows={4} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
          <button onClick={() => { toast.success('Message sent! We\'ll reply within 24 hours.'); setMsg(''); }} style={{ padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Send Message</button>
        </div>
      </div>

      {/* Chat modal */}
      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 2000 }} />
          <div style={{ position: 'fixed', right: 24, bottom: 24, width: 420, maxWidth: 'calc(100vw - 48px)', height: 560, maxHeight: 'calc(100vh - 48px)', background: 'white', borderRadius: 18, zIndex: 2100, overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Chat with BABU</div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>ClothStore Support Assistant</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={clearChat} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>New chat</button>
                <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
              </div>
            </div>

            <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f8fafc' }}>
              {messages.map(m => {
                const isUser = m.sender === 'user';
                const options = m.payload?.options || [];
                return (
                  <div key={m.id} style={{ marginBottom: 12, display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%' }}>
                      <div style={{
                        background: isUser ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'white',
                        color: isUser ? 'white' : '#0f172a',
                        border: isUser ? 'none' : '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '10px 12px',
                        fontSize: 13,
                        lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {m.text}
                      </div>
                      {!isUser && options.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                          {options.filter(Boolean).slice(0, 10).map((o, idx) => (
                            o.type === 'link' ? (
                              <button key={idx} onClick={() => { setChatOpen(false); navigate(o.href); }} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#334155' }}>
                                {o.label}
                              </button>
                            ) : (
                              <button key={idx} onClick={() => sendMessage({ action: o.value })} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid #c7d2fe', background: '#eef2ff', cursor: 'pointer', fontSize: 12, fontWeight: 800, color: '#4338ca' }}>
                                {o.label}
                              </button>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <div style={{ padding: 14, borderTop: '1px solid #e2e8f0', background: 'white' }}>
              <form onSubmit={(e) => { e.preventDefault(); if (canSend) sendMessage({ text: chatInput }); }} style={{ display: 'flex', gap: 10 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message… (try: track my order)"
                  style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13 }} />
                <button disabled={!canSend} type="submit" style={{ padding: '12px 14px', borderRadius: 12, border: 'none', background: canSend ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#cbd5e1', color: 'white', fontWeight: 800, cursor: canSend ? 'pointer' : 'not-allowed' }}>
                  {sending ? '…' : 'Send'}
                </button>
              </form>
              <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                BABU can check your order status and tracking based on your account.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

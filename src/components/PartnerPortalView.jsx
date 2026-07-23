import { useState, useEffect } from 'react';
import {
  Store, Zap, TrendingUp, BarChart3, Radio, Sparkles, CheckCircle2,
  Send, Users, Award, ChevronRight, X, ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

const PARTNER_TIERS = [
  {
    id: 'growth',
    name: 'Starter Partner',
    tag: 'Essential Visibility',
    price: '₱1,499',
    period: '/ month',
    accent: '#476856',
    popular: false,
    features: [
      'Verified Partner Badge on Map & Directory',
      'Basic Digital Passport Stamp Integration',
      'Manage Café Menu, Hours & Amenities',
      'Standard Listing in Search Results',
      'Monthly Traffic Analytics Report'
    ]
  },
  {
    id: 'spotlight',
    name: 'Spotlight Partner',
    tag: 'Most Popular for Local Cafés',
    price: '₱3,499',
    period: '/ month',
    accent: '#d97706',
    popular: true,
    features: [
      'Everything in Starter Tier',
      'Golden Glowing Map Pin & Top Category Placement',
      'Flash Deal Broadcasts (2 / month)',
      'Real-time Customer Analytics Dashboard',
      'Exclusive Custom Passport Stamp Icon',
      'Featured Banner on App Discovery Page'
    ]
  },
  {
    id: 'enterprise',
    name: 'Roaster & Chain Suite',
    tag: 'Multi-location Growth',
    price: '₱7,999',
    period: '/ month',
    accent: '#2563eb',
    popular: false,
    features: [
      'Everything in Spotlight Tier',
      'Unlimited Flash Deal Push Notifications',
      'Multi-branch Analytics & Heatmaps',
      'Dedicated Account Manager & Marketing Support',
      'Sponsor Monthly Community Challenges',
      'Direct POS / Loyalty SDK Integration'
    ]
  }
];

export default function PartnerPortalView({ onShowToast, onBack }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | dashboard | flashdeal
  const [selectedTier, setSelectedTier] = useState('spotlight');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [dealText, setDealText] = useState('');
  const [dealDiscount, setDealDiscount] = useState('20% OFF');
  const [dealDuration, setDealDuration] = useState('2 Hours');
  const dealTarget = 'Nearby Coffee Lovers (within 3km)';

  // Real-time Supabase Subscription for Merchants
  useEffect(() => {
    const channel = supabase
      .channel('merchant-realtime-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('⚡ New customer check-in received:', payload.new);
          if (onShowToast) {
            onShowToast(`🔔 New customer check-in at ${payload.new.cafe_name || 'your cafe'}!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onShowToast]);

  // Claim form state
  const [cafeName, setCafeName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // ROI Calculator state
  const [dailyTraffic, setDailyTraffic] = useState(40);
  const [avgTicket, setAvgTicket] = useState(180);

  const estimatedNewCustomers = Math.round(dailyTraffic * 0.25);
  const monthlyRevenueBoost = (estimatedNewCustomers * avgTicket * 26).toLocaleString();

  const handleLaunchDeal = (e) => {
    e.preventDefault();
    if (!dealText.trim()) return;
    onShowToast(`🚀 Flash Deal Broadcasted to 1,240 nearby coffee lovers!`);
    setDealText('');
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!cafeName || !email) return;
    setClaimModalOpen(false);
    onShowToast(`🎉 Claim application submitted for ${cafeName}! Our team will review within 24 hours.`);
    setCafeName(''); setOwnerName(''); setEmail(''); setPhone('');
  };

  return (
    <div className="partner-portal-page page-animated" style={{ paddingBottom: 40 }}>
      {/* Back Button */}
      {onBack && (
        <button className="page-back-btn" onClick={onBack} aria-label="Back to Map" style={{ marginBottom: 12 }}>
          <ChevronLeft size={16} />
          <span>Map</span>
        </button>
      )}
      {/* Header Banner */}
      <div className="partner-hero-card" style={{
        background: 'linear-gradient(135deg, #1c2720 0%, #2c3e34 100%)',
        borderRadius: 'var(--r-lg)',
        padding: '24px 20px',
        color: '#fff',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(217, 119, 6, 0.2)',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            color: '#fbbf24',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--r-full)',
            marginBottom: 12,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            <Store size={14} /> Partner Growth Hub (B2B)
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.2 }}>
            Turn Foot Traffic Into Loyal Coffee Regulars
          </h2>
          <p style={{ fontSize: 13, opacity: 0.85, margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
            Put your café on the map. Boost off-peak hour revenue with instant flash deals, custom passport stamps, and direct local customer analytics.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => setClaimModalOpen(true)}
              style={{
                background: 'var(--amber)',
                color: '#1a1d1a',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 'var(--r-full)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
              }}
            >
              Claim My Café Page <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '10px 18px',
                borderRadius: 'var(--r-full)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <BarChart3 size={15} /> Demo Owner Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'overview', label: '⭐ Pricing & Tiers', icon: Store },
          { id: 'dashboard', label: '📊 Partner Analytics', icon: BarChart3 },
          { id: 'flashdeal', label: '⚡ Flash Deals', icon: Zap }
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: 'var(--r-md)',
                border: `1px solid ${active ? 'var(--pine)' : 'var(--line)'}`,
                background: active ? 'var(--pine)' : 'var(--bg-card)',
                color: active ? '#fff' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRICING & TIERS */}
      {activeTab === 'overview' && (
        <>
          {/* Tiers Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}>
            {PARTNER_TIERS.map(tier => (
              <div
                key={tier.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--r-md)',
                  border: tier.popular ? '2px solid var(--amber)' : '1px solid var(--line)',
                  padding: 20,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: tier.popular ? '0 8px 24px rgba(217, 119, 6, 0.12)' : 'none'
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    right: 16,
                    background: 'var(--amber)',
                    color: '#1a1d1a',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--r-full)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Recommended
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                  {tier.tag}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: tier.accent }}>{tier.price}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tier.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', flex: 1 }}>
                  {tier.features.map((feat, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginBottom: 8,
                      lineHeight: 1.4
                    }}>
                      <CheckCircle2 size={15} color={tier.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setClaimModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 'var(--r-full)',
                    border: 'none',
                    background: tier.popular ? 'var(--amber)' : 'var(--pine)',
                    color: tier.popular ? '#1a1d1a' : '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  Get Started with {tier.name}
                </button>
              </div>
            ))}
          </div>

          {/* Interactive ROI Calculator */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            padding: 20,
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={18} color="var(--pine-light)" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Partner ROI Calculator
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
              Estimate your monthly revenue increase by capturing nearby app users & passport collectors.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Estimated Current Daily Customers: <strong style={{ color: 'var(--text-primary)' }}>{dailyTraffic}</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={dailyTraffic}
                  onChange={e => setDailyTraffic(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--pine)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Avg Order Value (₱): <strong style={{ color: 'var(--text-primary)' }}>₱{avgTicket}</strong>
                </label>
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="10"
                  value={avgTicket}
                  onChange={e => setAvgTicket(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--pine)' }}
                />
              </div>
            </div>

            <div style={{
              background: 'var(--pine-glow)',
              border: '1px solid rgba(71, 104, 86, 0.3)',
              borderRadius: 'var(--r-sm)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--pine-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Projected Monthly Revenue Boost
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--pine-light)' }}>
                  +₱{monthlyRevenueBoost} / mo
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', maxWidth: 150 }}>
                Based on ~{estimatedNewCustomers} new passport visits per day
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PARTNER ANALYTICS DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { title: 'App Views (30d)', value: '3,840', sub: '+24% vs last mo', icon: Users, color: '#476856' },
              { title: 'Stamps Collected', value: '412', sub: '92 repeats', icon: Award, color: '#d97706' },
              { title: 'Flash Redemptions', value: '88', sub: '₱14,800 revenue', icon: Zap, color: '#2563eb' },
              { title: 'Avg Rating', value: '4.8 ★', sub: '48 verified reviews', icon: Sparkles, color: '#e0a832' }
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: 14
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{m.title}</span>
                    <Icon size={16} color={m.color} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Peak Foot Traffic Chart Preview */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            padding: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Hourly Foot Traffic Heatmap
                </h4>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Identify your slowest hours to launch Flash Deals</div>
              </div>
              <span style={{ fontSize: 10, background: 'var(--pine-glow)', color: 'var(--pine-light)', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                Live Analytics
              </span>
            </div>

            {/* Simulated Bar Graph */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingTop: 10, borderBottom: '1px solid var(--line)' }}>
              {[
                { time: '8 AM', val: 75, slow: false },
                { time: '10 AM', val: 90, slow: false },
                { time: '12 PM', val: 40, slow: true },
                { time: '2 PM', val: 30, slow: true },
                { time: '4 PM', val: 85, slow: false },
                { time: '6 PM', val: 60, slow: false },
                { time: '8 PM', val: 20, slow: true }
              ].map((bar, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${bar.val}%`,
                    background: bar.slow ? 'rgba(217, 119, 6, 0.4)' : 'var(--pine)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s'
                  }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>{bar.time}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, background: 'var(--pine)', borderRadius: 2 }} /> Peak Hours
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, background: 'rgba(217, 119, 6, 0.4)', borderRadius: 2 }} /> Slow Hours (Opportunity)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLASH DEAL LAUNCHER */}
      {activeTab === 'flashdeal' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          padding: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={20} color="var(--amber)" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Broadcaster: Instant Flash Deal Launcher
            </h3>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
            Send a real-time push notification to all active app users within 3 kilometers of your café.
          </p>

          <form onSubmit={handleLaunchDeal} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Promo Title / Offer
              </label>
              <input
                className="review-input"
                placeholder="e.g. Rainy Afternoon Brew: 20% off all Espresso drinks!"
                value={dealText}
                onChange={e => setDealText(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Discount Tag
                </label>
                <select
                  value={dealDiscount}
                  onChange={e => setDealDiscount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--line)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                >
                  <option value="20% OFF">20% OFF</option>
                  <option value="BUY 1 GET 1">BUY 1 GET 1</option>
                  <option value="FREE PASTRIES">FREE PASTRY W/ COFFEE</option>
                  <option value="15% OFF BEANS">15% OFF WHOLE BEANS</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Duration Limit
                </label>
                <select
                  value={dealDuration}
                  onChange={e => setDealDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--line)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                >
                  <option value="1 Hour">1 Hour (Flash Surge)</option>
                  <option value="2 Hours">2 Hours (Afternoon Special)</option>
                  <option value="Until 6 PM">Until Closing (6 PM)</option>
                </select>
              </div>
            </div>

            {/* Notification Preview Box */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--amber)',
              borderRadius: 'var(--r-sm)',
              padding: 12,
              marginTop: 4
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Radio size={12} /> Push Notification Live Preview
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                ⚡ {dealText || "Your deal notification title will appear here..."}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Redeemable for next {dealDuration} · Target: {dealTarget}
              </div>
            </div>

            <button
              type="submit"
              style={{
                background: 'var(--amber)',
                color: '#1a1d1a',
                border: 'none',
                padding: '12px 0',
                borderRadius: 'var(--r-full)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 8
              }}
            >
              <Send size={16} /> Broadcast Deal to 1,240 Nearby Users
            </button>
          </form>
        </div>
      )}

      {/* CLAIM CAFÉ MODAL */}
      {claimModalOpen && (
        <div className="login-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--r-lg)',
            width: '100%',
            maxWidth: 440,
            padding: 24,
            border: '1px solid var(--line)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setClaimModalOpen(false)}
              style={{
                position: 'absolute',
                top: 16, right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Store size={20} color="var(--amber)" />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                Claim & Upgrade Your Café
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
              Join the partner network to gain verified status, glowing map pin, and owner metrics.
            </p>

            <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Café Name *
                </label>
                <input
                  className="review-input"
                  placeholder="e.g. Hive & Roast Malaybalay"
                  value={cafeName}
                  onChange={e => setCafeName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Owner / Manager Name *
                </label>
                <input
                  className="review-input"
                  placeholder="Your full name"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    className="review-input"
                    placeholder="cafe@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="review-input"
                    placeholder="0917 XXX XXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Selected Plan
                </label>
                <select
                  value={selectedTier}
                  onChange={e => setSelectedTier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--line)',
                    color: 'var(--text-primary)',
                    fontSize: 12
                  }}
                >
                  <option value="growth">Starter Partner (₱1,499/mo)</option>
                  <option value="spotlight">Spotlight Partner (₱3,499/mo) — Recommended</option>
                  <option value="enterprise">Roaster & Chain Suite (₱7,999/mo)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  background: 'var(--pine)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 'var(--r-full)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                Submit Partner Verification Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

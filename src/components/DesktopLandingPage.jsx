import { useState } from 'react';
import {
  Coffee, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2,
  MapPin, Award, Sparkles, Star, ChevronRight,
  Gift, Users, Heart, Crown
} from 'lucide-react';
import { CAFE_OF_THE_WEEK, COFFEE_OF_THE_WEEK } from '../data.js';

export default function DesktopLandingPage({ onLoginSuccess, onExploreAsGuest, cafes = [] }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (mode === 'forgot') {
        setSuccessMsg(`Password reset link sent to ${email}`);
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
        }, 3000);
        return;
      }

      const userData = {
        name: mode === 'signup' ? name : (email.split('@')[0] || 'Coffee Explorer'),
        email: email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        joined: 'Just now',
        tier: 'Bean Explorer'
      };

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    }, 1200);
  };


  return (
    <div className="desktop-landing-root">
      {/* ── Top Navigation Bar ── */}
      <header className="desktop-navbar">
        <div className="desktop-nav-container">
          <div className="desktop-brand">
            <div className="desktop-logo-icon">
              <img src="/icon-192.png" alt="Kapehan Icon" style={{ width: 32, height: 32, borderRadius: 8 }} />
            </div>
            <div>
              <span className="desktop-brand-name">Kapehan</span>
              <span className="desktop-brand-tag">Malaybalay Highland Coffee</span>
            </div>
          </div>

          <nav className="desktop-nav-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#cafes" onClick={(e) => { e.preventDefault(); document.getElementById('cafes')?.scrollIntoView({ behavior: 'smooth' }); }}>Featured Cafés</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onExploreAsGuest('passport'); }}>Digital Passport</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onExploreAsGuest('community'); }}>Community</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onExploreAsGuest('partner'); }}>Partner Hub</a>
          </nav>

          <div className="desktop-nav-actions">
            <button className="desktop-guest-btn" onClick={onExploreAsGuest}>
              <Sparkles size={15} />
              <span>Explore Interactive Map</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Split 2-Column Desktop View) ── */}
      <section className="desktop-hero-section">
        <div className="desktop-hero-container">
          {/* Left Column: Rich Pitch & Value Prop */}
          {/* Left Column: Premium Value Prop & Mockup */}
          <div className="desktop-hero-left">
            <div className="premium-badge">
              <span className="pulse-dot"></span>
              Bukidnon's #1 Coffee Companion
            </div>
            
            <h1 className="premium-title">
              Your Digital Passport to <br/>
              <span className="text-gradient">Highland Coffee.</span>
            </h1>
            
            <p className="premium-subtitle">
              Join thousands of locals discovering hidden mountain roasteries, unlocking digital rewards, and mastering the Malaybalay coffee trail.
            </p>

            <div className="passport-mockup">
              <div className="passport-header">
                <div className="passport-user">
                  <div className="passport-avatar">☕</div>
                  <div>
                    <div className="passport-name">Explorer Pass</div>
                    <div className="passport-tier">Level 3: Bean Master</div>
                  </div>
                </div>
                <div className="passport-points">1,240 pts</div>
              </div>
              <div className="passport-stamps">
                <div className="stamp-box active"><span className="stamp-icon">🌲</span><div className="stamp-date">Aug 12</div></div>
                <div className="stamp-box active"><span className="stamp-icon">🚐</span><div className="stamp-date">Aug 15</div></div>
                <div className="stamp-box active"><span className="stamp-icon">🍰</span><div className="stamp-date">Aug 18</div></div>
                <div className="stamp-box empty"></div>
              </div>
              <div className="passport-progress">
                <div className="progress-text">
                  <span>Reward Progress</span>
                  <span>75%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: '75%' }}></div></div>
                <div className="progress-hint">1 more stamp to unlock a Free Drip Coffee</div>
              </div>
            </div>

            <div className="live-activity-pill">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" alt="User" />
              <div>
                <strong>Bea T.</strong> just stamped at <span className="highlight-cafe">Foglian Peak Roasters</span>
              </div>
            </div>
          </div>

          {/* Right Column: Full Desktop Auth Card */}
          <div className="desktop-hero-right">
            <div className="desktop-auth-card">
              <div className="auth-card-top">
                <div className="auth-card-icon">
                  <Coffee size={28} color="#5D4037" />
                </div>
                <h3>
                  {mode === 'login' && 'Sign In to Passport'}
                  {mode === 'signup' && 'Create Your Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </h3>
                <p>
                  {mode === 'login' && 'Access your digital stamps, points, & rewards'}
                  {mode === 'signup' && 'Join the Malaybalay coffee trail today'}
                  {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
                </p>
              </div>

              {errorMsg && (
                <div className="login-alert error">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="login-alert success">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="desktop-auth-form">
                {mode === 'signup' && (
                  <div className="form-group">
                    <label htmlFor="desk-name">Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        id="desk-name"
                        type="text"
                        placeholder="e.g. Maria Santos"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="desk-email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="desk-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="form-group">
                    <div className="label-with-link">
                      <label htmlFor="desk-password">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => setMode('forgot')}
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="desk-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="remember-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember this computer</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="desktop-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Authenticating…</span>
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Sign In to Passport'}
                        {mode === 'signup' && 'Create Passport Free'}
                        {mode === 'forgot' && 'Send Reset Link'}
                      </span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="desktop-alt-actions">
                <button
                  type="button"
                  className="desktop-explore-link"
                  onClick={onExploreAsGuest}
                >
                  <Sparkles size={16} color="#A1887F" />
                  <span>Continue as Guest Explorer</span>
                </button>
              </div>

              <div className="auth-card-footer">
                {mode === 'login' && (
                  <p>
                    Don't have a coffee passport?{' '}
                    <button className="text-link-bold" onClick={() => setMode('signup')}>
                      Sign up free
                    </button>
                  </p>
                )}

                {mode === 'signup' && (
                  <p>
                    Already registered?{' '}
                    <button className="text-link-bold" onClick={() => setMode('login')}>
                      Log in here
                    </button>
                  </p>
                )}

                {mode === 'forgot' && (
                  <p>
                    Remembered password?{' '}
                    <button className="text-link-bold" onClick={() => setMode('login')}>
                      Back to Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights Grid ── */}
      <section className="desktop-section" id="features">
        <div className="desktop-section-container">
          <div className="section-header">
            <span className="section-tag">EVERYTHING YOU NEED</span>
            <h2 className="section-title">Designed for Coffee Lovers & Explorers</h2>
            <p className="section-desc">Everything you need to discover, visit, and enjoy Malaybalay's thriving coffee culture.</p>
          </div>

          <div className="desktop-features-grid">
            <div className="desktop-feature-card">
              <div className="card-icon"><MapPin size={24} /></div>
              <h3>Highland Interactive Map</h3>
              <p>Filter by Wi-Fi, mountain view, pet-friendly, power outlets & outdoor seating across all Malaybalay barangays.</p>
            </div>

            <div className="desktop-feature-card">
              <div className="card-icon"><Award size={24} /></div>
              <h3>Digital Passport Stamps</h3>
              <p>Scan QR codes or check in at partner coffee shops to earn points, level up rank tiers, and claim free brewed coffees.</p>
            </div>

            <div className="desktop-feature-card">
              <div className="card-icon"><Gift size={24} /></div>
              <h3>Rewards & Challenges</h3>
              <p>Complete coffee crawl quests (e.g. "Mountain Brew Tour", "Espresso Explorer") to win exclusive local barista rewards.</p>
            </div>

            <div className="desktop-feature-card">
              <div className="card-icon"><Users size={24} /></div>
              <h3>Community & Events</h3>
              <p>Stay updated on local latte art competitions, cupping sessions, bean roasting workshops & coffee lover meetups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Cafes Preview ── */}
      <section className="desktop-section alt-bg" id="cafes">
        <div className="desktop-section-container">
          {/* Weekly Highlights Banner Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
            {/* Café of the Week Card */}
            <div
              onClick={onExploreAsGuest}
              style={{
                background: 'linear-gradient(135deg, #1f2d24 0%, #2e4437 100%)',
                borderRadius: 'var(--r-xl)',
                padding: 24,
                color: '#fff',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--amber)', color: '#1a1d1a', padding: '4px 10px', borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {CAFE_OF_THE_WEEK.badge}
                </span>
                <Crown size={20} color="var(--amber)" />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                {CAFE_OF_THE_WEEK.title}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 8px', color: '#fff' }}>
                {CAFE_OF_THE_WEEK.name}
              </h3>
              <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 14px', lineHeight: 1.5 }}>
                {CAFE_OF_THE_WEEK.reason}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: 'var(--amber)', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Signature Drink: {CAFE_OF_THE_WEEK.highlight_drink}</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Coffee of the Week Card */}
            <div
              onClick={onExploreAsGuest}
              style={{
                background: 'linear-gradient(135deg, #1a2536 0%, #283a54 100%)',
                borderRadius: 'var(--r-xl)',
                padding: 24,
                color: '#fff',
                border: '1px solid rgba(37, 99, 235, 0.4)',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {COFFEE_OF_THE_WEEK.badge}
                </span>
                <Sparkles size={20} color="#60a5fa" />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                {COFFEE_OF_THE_WEEK.title} · {COFFEE_OF_THE_WEEK.price}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
                {COFFEE_OF_THE_WEEK.drink_name}
              </h3>
              <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600, marginBottom: 8 }}>
                {COFFEE_OF_THE_WEEK.cafe_name}
              </div>
              <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 14px', lineHeight: 1.5 }}>
                {COFFEE_OF_THE_WEEK.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#93c5fd', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Order at Roastery</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>

          <div className="section-header">
            <span className="section-tag">MALAYBALAY HIGHLIGHTS</span>
            <h2 className="section-title">Popular Local Coffee Destinations</h2>
            <p className="section-desc">Sample a few of the top-rated spots waiting for your passport stamp.</p>
          </div>

          <div className="desktop-cafes-grid">
            <div className="desktop-cafe-card">
              <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=500" alt="Pino & Grind" />
              <div className="cafe-card-body">
                <span className="cafe-barangay">Barangay 9</span>
                <h4>Pino & Grind</h4>
                <p>Pine tree canopy outdoor seating with specialty pour-over local Bukidnon Arabica.</p>
                <div className="cafe-tags">
                  <span>🌲 Pine View</span>
                  <span>⚡ Fast Wi-Fi</span>
                </div>
              </div>
            </div>

            <div className="desktop-cafe-card">
              <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=500" alt="Malaybalay Brew Co." />
              <div className="cafe-card-body">
                <span className="cafe-barangay">Barangay 4</span>
                <h4>Malaybalay Brew Co.</h4>
                <p>Modern industrial cafe with signature espresso roasts & artisanal sourdough pastries.</p>
                <div className="cafe-tags">
                  <span>☕ Micro-roastery</span>
                  <span>🔌 Outlets</span>
                </div>
              </div>
            </div>

            <div className="desktop-cafe-card">
              <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=500" alt="Foglian Peak Roasters" />
              <div className="cafe-card-body">
                <span className="cafe-barangay">Barangay 1</span>
                <h4>Foglian Peak Roasters</h4>
                <p>Highland mountain ridge view with cold brews and relaxing acoustic weekend vibes.</p>
                <div className="cafe-tags">
                  <span>⛰️ Mountain View</span>
                  <span>🐾 Pet-friendly</span>
                </div>
              </div>
            </div>
          </div>

          <div className="desktop-cta-bar">
            <span>Ready to explore all 12+ local coffee spots on the interactive map?</span>
            <button className="desktop-submit-btn inline" onClick={onExploreAsGuest}>
              Launch Interactive Map <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="desktop-footer">
        <div className="desktop-footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <Coffee size={22} color="#5D4037" />
              <span>Kapehan</span>
            </div>
            <p>The definitive guide and digital passport for specialty coffee in Malaybalay City, Bukidnon.</p>
          </div>

          <div className="footer-right">
            <span>© 2026 Kapehan. Crafted with <Heart size={13} fill="#8D6E63" color="#8D6E63" inline /> in Bukidnon, Philippines.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Search, Flame, Sparkles, Star, TrendingUp, Coffee, ArrowRight } from 'lucide-react';
import { TRENDING_DRINKS, FEATURED_BEANS } from '../data/socialData.js';

export default function ExploreTrendingView({ cafes, onSelectCafe }) {
  const [query, setQuery] = useState('');

  const filteredDrinks = TRENDING_DRINKS.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.cafeName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'var(--bg-card)',
        padding: '12px 16px',
        borderRadius: 'var(--r-full)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '20px'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search drinks, beans, cafés or origin..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            flex: 1,
            fontSize: '13.5px',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {/* Taste Matcher Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--pine), #3b2a22)',
        borderRadius: 'var(--r-xl)',
        padding: '18px 20px',
        color: '#fff',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--amber)' }}>
          <Sparkles size={14} /> AI Coffee Matcher
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', marginBottom: '6px' }}>
          Find Your Perfect Roast
        </h3>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, maxWidth: '260px' }}>
          Preference: Light Roast Pour-over with Floral Notes
        </p>
        <button style={{
          marginTop: '12px',
          padding: '8px 16px',
          borderRadius: 'var(--r-full)',
          background: 'var(--amber)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '12px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          Generate Tasting Match <ArrowRight size={14} />
        </button>
      </div>

      {/* Trending Drinks Section */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            <Flame size={18} color="#e11d48" /> Trending Drinks Nearby
          </div>
          <span style={{ fontSize: '12px', color: 'var(--pine)', fontWeight: 700 }}>Top 3 Today</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredDrinks.map(drink => (
            <div
              key={drink.id}
              style={{
                display: 'flex',
                gap: '14px',
                background: 'var(--bg-card)',
                padding: '12px',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img
                src={drink.image}
                alt={drink.name}
                style={{ width: '80px', height: '80px', borderRadius: 'var(--r-md)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{drink.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{drink.cafeName}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={12} fill="#f59e0b" /> {drink.rating}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🔥 {drink.orders} orders this week</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Beans Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            <Coffee size={18} color="var(--amber)" /> Featured Coffee Beans
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FEATURED_BEANS.map(bean => (
            <div
              key={bean.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--line)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
                <img src={bean.image} alt={bean.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {bean.price}
                </span>
              </div>

              <div style={{ padding: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{bean.name}</h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{bean.roaster} • Elevation {bean.elevation}</div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {bean.flavorProfile.map((note, i) => (
                    <span key={i} style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: 'var(--r-sm)', fontSize: '11px', fontWeight: 500 }}>
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

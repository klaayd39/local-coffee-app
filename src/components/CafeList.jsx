import { Coffee, Stamp, Crown, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { RatingStars, AmenityChips } from './shared.jsx';
import { CAFE_OF_THE_WEEK, COFFEE_OF_THE_WEEK } from '../data.js';

function CafeCard({ cafe, onOpen, stamped }) {
  return (
    <button className="cafe-card" onClick={() => onOpen(cafe.id)} aria-label={`Open ${cafe.name}`}>
      {/* Thumbnail */}
      <div className="cafe-thumb" style={{ background: `linear-gradient(135deg, ${cafe.accent}55, ${cafe.accent2}88)` }}>
        <div className="cafe-thumb-inner">
          <span style={{ fontSize: 26 }}>{cafe.emoji}</span>
        </div>
        {stamped && (
          <div className="thumb-stamp" title="Passport stamped">
            <Stamp size={11} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="cafe-card-info">
        <div className="cafe-card-header">
          <span className="cafe-card-name">{cafe.name}</span>
          <span className="cafe-card-dist">{cafe.distance_km} km</span>
        </div>
        <div className="cafe-card-tagline">{cafe.tagline}</div>
        <div className="cafe-card-meta">
          <RatingStars value={cafe.rating} size={11} />
          <span className="rating-count">{cafe.rating} ({cafe.reviews_count})</span>
          <span className="price-badge">{cafe.price_range}</span>
        </div>
        <AmenityChips cafe={cafe} compact />
      </div>
    </button>
  );
}

export default function CafeList({ cafes, onOpen, stamps, onBack }) {
  const nearby = [...cafes].sort((a, b) => a.distance_km - b.distance_km);

  return (
    <div className="list-page page-animated">
      {/* Back Button */}
      {onBack && (
        <button className="page-back-btn" onClick={onBack} aria-label="Back to Map" style={{ marginBottom: 12 }}>
          <ChevronLeft size={16} />
          <span>Map</span>
        </button>
      )}
      {/* WEEKLY FEATURED HIGHLIGHTS */}
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 10 }}>
        {/* Café of the Week */}
        <div
          onClick={() => onOpen(CAFE_OF_THE_WEEK.cafe_id)}
          style={{
            background: 'linear-gradient(135deg, #1f2d24 0%, #2e4437 100%)',
            borderRadius: 'var(--r-md)',
            padding: 16,
            color: '#fff',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--amber)', color: '#1a1d1a', padding: '3px 8px', borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {CAFE_OF_THE_WEEK.badge}
            </span>
            <Crown size={16} color="var(--amber)" />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            {CAFE_OF_THE_WEEK.title}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, margin: '2px 0 6px', color: '#fff' }}>
            {CAFE_OF_THE_WEEK.name}
          </div>
          <p style={{ fontSize: 11.5, opacity: 0.85, margin: '0 0 10px', lineHeight: 1.4 }}>
            {CAFE_OF_THE_WEEK.reason}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--amber)', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span>Try: {CAFE_OF_THE_WEEK.highlight_drink}</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Coffee of the Week */}
        <div
          onClick={() => onOpen(COFFEE_OF_THE_WEEK.cafe_id)}
          style={{
            background: 'linear-gradient(135deg, #1a2536 0%, #283a54 100%)',
            borderRadius: 'var(--r-md)',
            padding: 16,
            color: '#fff',
            border: '1px solid rgba(37, 99, 235, 0.4)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, background: '#3b82f6', color: '#fff', padding: '3px 8px', borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {COFFEE_OF_THE_WEEK.badge}
            </span>
            <Sparkles size={16} color="#60a5fa" />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            {COFFEE_OF_THE_WEEK.title} · {COFFEE_OF_THE_WEEK.price}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, margin: '2px 0 2px', color: '#fff' }}>
            {COFFEE_OF_THE_WEEK.drink_name}
          </div>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, marginBottom: 6 }}>
            {COFFEE_OF_THE_WEEK.cafe_name}
          </div>
          <p style={{ fontSize: 11.5, opacity: 0.85, margin: '0 0 10px', lineHeight: 1.4 }}>
            {COFFEE_OF_THE_WEEK.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#93c5fd', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span>Featured at Roastery</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      <div className="list-section-header">
        <Coffee size={12} />
        {cafes.length} café{cafes.length !== 1 ? 's' : ''} found · sorted by distance
      </div>
      {cafes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No cafés match those filters.</p>
          <p style={{ marginTop: 6, fontSize: 11 }}>Try adjusting your search or filters.</p>
        </div>
      )}
      {nearby.map(c => (
        <CafeCard key={c.id} cafe={c} onOpen={onOpen} stamped={!!stamps[c.id]} />
      ))}
    </div>
  );
}

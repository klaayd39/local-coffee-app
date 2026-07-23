import { useState } from 'react';
import { Heart, MessageCircle, Camera, ChevronLeft } from 'lucide-react';
import { COMMUNITY_PHOTOS, REVIEWS, CAFES } from '../data.js';
import { RatingStars } from './shared.jsx';

function PhotoCell({ photo, onClick }) {
  return (
    <div className="photo-cell" onClick={onClick} role="button" tabIndex={0} aria-label={`Photo from ${photo.label}`}>
      <div
        className="photo-cell-bg"
        style={{ background: `radial-gradient(circle at 30% 70%, ${photo.color}dd, #0b1410)` }}
      >
        {/* Simulated photo with emoji art */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
        }}>
          {photo.emoji}
        </div>
        {/* Texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 10px)',
        }} />
      </div>
      <div className="photo-cell-overlay">
        <div className="photo-cell-label">
          {photo.user}<br />{photo.label}
        </div>
      </div>
    </div>
  );
}

export default function CommunityView({ cafes, onOpenCafe, onBack }) {
  const [liked, setLiked] = useState(new Set());
  const [lightbox, setLightbox] = useState(null);

  const toggleLike = (id) => setLiked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const recentReviews = REVIEWS.slice(0, 6);

  return (
    <div className="community-page page-animated">
      {/* Back + Header */}
      {onBack && (
        <button className="page-back-btn" onClick={onBack} aria-label="Back to Map">
          <ChevronLeft size={16} />
          <span>Map</span>
        </button>
      )}
      <div className="page-title-row" style={{ marginTop: onBack ? 12 : 0 }}>
        <div className="page-title-content">
          <div className="page-title">Community</div>
          <div className="page-sub">Photos & reviews from the Kapehan fam</div>
        </div>
        <div style={{ fontSize: 28 }}>📸</div>
      </div>

      {/* Submit photo CTA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        padding: '12px 14px',
        marginBottom: 16,
        cursor: 'pointer',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '2px dashed var(--line-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Camera size={18} color="var(--text-muted)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            Share your café moment
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Earn +20 pts per photo • Help the community
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--pine-light)', fontWeight: 600 }}>Upload</div>
      </div>

      {/* Section: Community Photos */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
        📷 Recent Photos
      </div>
      <div className="photo-grid" style={{ marginBottom: 20 }}>
        {COMMUNITY_PHOTOS.map(photo => (
          <PhotoCell key={photo.id} photo={photo} onClick={() => setLightbox(photo)} />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 280, height: 280,
            borderRadius: 'var(--r-lg)',
            background: `radial-gradient(circle at 30% 70%, ${lightbox.color}dd, #0b1410)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12,
            border: '1px solid var(--line-strong)',
            position: 'relative',
          }}>
            <div style={{ fontSize: 72 }}>{lightbox.emoji}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{lightbox.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>by {lightbox.user}</div>
            </div>
            <button
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.5)', border: 'none',
                color: '#fff', width: 28, height: 28,
                borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}
              onClick={() => setLightbox(null)}
            >✕</button>
          </div>
        </div>
      )}

      {/* Section: Recent Reviews Feed */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
        ⭐ Recent Reviews
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recentReviews.map(r => {
          const cafe = CAFES.find(c => c.id === r.cafe_id);
          const isLiked = liked.has(r.id);
          return (
            <div key={r.id} className="review-card" style={{ cursor: 'default' }}>
              {/* Café tag */}
              {cafe && (
                <div
                  onClick={() => onOpenCafe?.(cafe.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 10.5, fontWeight: 600, color: cafe.accent,
                    background: `${cafe.accent}22`,
                    border: `1px solid ${cafe.accent}44`,
                    borderRadius: 'var(--r-full)',
                    padding: '2px 8px',
                    marginBottom: 8,
                    cursor: 'pointer',
                  }}
                >
                  {cafe.emoji} {cafe.name}
                </div>
              )}
              <div className="review-top">
                <span className="review-user">{r.user_emoji} {r.user_name}</span>
                <RatingStars value={r.rating} size={12} />
              </div>
              {r.drink && <div className="review-drink">☕ {r.drink}</div>}
              <p className="review-body">{r.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="review-time">{r.created_at}</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => toggleLike(r.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, color: isLiked ? '#c26a3a' : 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <Heart size={13} fill={isLiked ? '#c26a3a' : 'none'} color={isLiked ? '#c26a3a' : 'var(--text-muted)'} />
                    Like
                  </button>
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    <MessageCircle size={13} />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

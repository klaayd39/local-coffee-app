import { useState, useEffect } from 'react';
import {
  ChevronLeft, Stamp, Clock, Navigation, Phone,
  Star, Coffee, Heart, ChevronDown, Search
} from 'lucide-react';
import { MENU, fetchReviews } from '../data.js';
import { RatingStars, AmenityChips, AMENITY_META } from './shared.jsx';

function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [drink, setDrink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    onSubmit({ rating, text, drink });
    setRating(0); setText(''); setDrink('');
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Leave a Review</h4>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i} type="button"
            className="star-pick-btn"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={22}
              fill={i <= (hovered || rating) ? '#e0a832' : 'none'}
              color={i <= (hovered || rating) ? '#e0a832' : '#3a4038'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <input
        className="review-input"
        style={{ height: 38, marginBottom: 8 }}
        placeholder="What did you order? (optional)"
        value={drink}
        onChange={e => setDrink(e.target.value)}
      />
      <textarea
        className="review-input"
        rows={3}
        placeholder="Share your experience…"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button type="submit" className="submit-btn" disabled={!rating || !text.trim()}>
        Post Review
      </button>
    </form>
  );
}

export default function CafeDetail({ cafe, onClose, onStamp, stamped, onReview }) {
  const [tab, setTab] = useState('about');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [menuSearch, setMenuSearch] = useState('');

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  useEffect(() => {
    setLoading(true);
    fetchReviews(cafe.id).then(r => {
      setReviews(r);
      setLoading(false);
    });
  }, [cafe.id]);

  const handleReview = (data) => {
    const newReview = {
      id: `r_new_${Date.now()}`,
      cafe_id: cafe.id,
      user_name: 'You',
      user_emoji: '🧑',
      rating: data.rating,
      drink: data.drink || 'Something delicious',
      body: data.text,
      created_at: 'just now',
    };
    setReviews(prev => [newReview, ...prev]);
    onReview?.(cafe.id);
  };

  const menu = MENU[cafe.id] || [];
  const menuByCategory = menu.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="sheet">
      {/* Cover */}
      <div className="sheet-cover">
        <div className="sheet-cover-bg" style={{ background: `linear-gradient(135deg, ${cafe.accent} 0%, ${cafe.accent2} 100%)` }} />
        <div className="sheet-cover-pattern" />
        <div className="sheet-cover-overlay" />

        {/* Actions bar */}
        <div className="sheet-cover-actions">
          <button className="icon-btn" onClick={onClose} aria-label="Go back">
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`icon-btn ${liked ? '' : ''}`}
              onClick={() => setLiked(l => !l)}
              aria-label="Save café"
              style={liked ? { background: 'rgba(194,106,58,0.7)', borderColor: 'rgba(194,106,58,0.5)' } : {}}
            >
              <Heart size={18} fill={liked ? '#fff' : 'none'} />
            </button>
            <button
              className={`icon-btn stamp-btn ${stamped ? 'stamped' : ''}`}
              onClick={() => onStamp(cafe.id)}
              title="Stamp your Coffee Passport"
              aria-label="Stamp passport"
            >
              <Stamp size={18} />
            </button>
          </div>
        </div>

        {/* Cover text */}
        <div className="sheet-cover-content">
          <span className="barangay-tag">{cafe.barangay}</span>
          <h2>{cafe.name}</h2>
          <p className="sheet-cover-tagline">{cafe.tagline}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="sheet-meta">
        <div className="meta-row">
          <RatingStars value={cafe.rating} size={14} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>{cafe.rating}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {cafe.reviews_count} reviews</span>
          <span className="meta-divider">·</span>
          <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>{cafe.price_range}</span>
        </div>
        <div className="meta-row">
          <Clock size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12 }}>{cafe.hours}</span>
          <span className="meta-divider">·</span>
          <Navigation size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12 }}>{cafe.distance_km} km away</span>
        </div>
        <div className="meta-row">
          <Phone size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12 }}>{cafe.phone}</span>
        </div>

        {/* Native In-App Navigation Button */}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => onClose()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--r-full)',
              background: 'linear-gradient(135deg, var(--pine), #2f5e3a)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(74,124,89,0.3)'
            }}
          >
            <Navigation size={15} color="#fff" />
            <span>View Route & Directions in App Map</span>
          </button>
        </div>

        <AmenityChips cafe={cafe} />
      </div>

      {/* Tabs */}
      <div className="sheet-tabs" style={{ display: 'flex', background: 'var(--bg-surface)', borderBottom: '1px solid var(--line)', padding: '0 20px' }}>
        {['about', 'menu', 'reviews'].map(t => (
          <button
            key={t}
            className={`sheet-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'about' ? 'About' : t === 'menu' ? 'Menu' : `Reviews (${cafe.reviews_count})`}
          </button>
        ))}
      </div>

      {/* Tab bodies */}
      <div className="sheet-body">
        {tab === 'about' && (
          <div className="about-block">
            <p>{cafe.tagline}. Located in {cafe.barangay}, Malaybalay City. Open {cafe.hours}.</p>
            <div className="amenity-grid">
              {Object.keys(AMENITY_META).map(k => {
                const Icon = AMENITY_META[k].icon;
                const has = cafe[k];
                return (
                  <div className={`amenity-row ${has ? '' : 'off'}`} key={k}>
                    <Icon size={15} color={has ? 'var(--pine-light)' : 'var(--text-muted)'} />
                    <span>{AMENITY_META[k].label}</span>
                    <span className={`amenity-status ${has ? 'yes' : 'no'}`}>
                      {has ? 'Available' : 'Not available'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'menu' && (
          <div className="menu-list">
            {/* Quick Search & Drop-Down Header */}
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search MC2 drinks or food (e.g. Cold Brew, Latte, Wok)..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--line)',
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Category Pills Slider */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--r-full)',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: selectedCategory === 'All' ? 'none' : '1px solid var(--line)',
                    background: selectedCategory === 'All' ? 'var(--primary-coffee)' : 'var(--bg-surface)',
                    color: selectedCategory === 'All' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  All ({menu.length})
                </button>
                {Object.keys(menuByCategory).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--r-full)',
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      border: selectedCategory === cat ? 'none' : '1px solid var(--line)',
                      background: selectedCategory === cat ? 'var(--primary-coffee)' : 'var(--bg-surface)',
                      color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {cat} ({menuByCategory[cat].length})
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion Collapsible Dropdown Sections */}
            {Object.entries(menuByCategory)
              .filter(([cat]) => selectedCategory === 'All' || selectedCategory === cat)
              .map(([cat, items]) => {
                const filteredItems = items.filter(m =>
                  !menuSearch.trim() ||
                  m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                  (m.description && m.description.toLowerCase().includes(menuSearch.toLowerCase()))
                );

                if (filteredItems.length === 0 && menuSearch.trim()) return null;

                const isCollapsed = collapsedCategories[cat] && !menuSearch.trim();

                return (
                  <div
                    key={cat}
                    style={{
                      marginBottom: 12,
                      borderRadius: 'var(--r-md)',
                      border: '1px solid rgba(93, 64, 55, 0.15)',
                      overflow: 'hidden',
                      background: 'var(--liquid-glass-card)',
                      backdropFilter: 'var(--liquid-glass-blur)',
                      WebkitBackdropFilter: 'var(--liquid-glass-blur)',
                      boxShadow: 'var(--liquid-glass-shadow)'
                    }}
                  >
                    {/* Collapsible Dropdown Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(93, 64, 55, 0.08)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-coffee)' }}>
                          {cat}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--card-coffee)', color: 'var(--primary-coffee)', padding: '2px 8px', borderRadius: 'var(--r-full)' }}>
                          {filteredItems.length}
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        color="var(--primary-coffee)"
                        style={{
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    </button>

                    {/* Menu Items Container */}
                    {!isCollapsed && (
                      <div style={{ padding: '4px 16px 8px' }}>
                        {filteredItems.map((m, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              padding: '12px 0',
                              borderBottom: i === filteredItems.length - 1 ? 'none' : '1px solid rgba(93, 64, 55, 0.08)'
                            }}
                          >
                            <div style={{ paddingRight: 12 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {m.name}
                              </div>
                              {m.description && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                                  {m.description}
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber)', whiteSpace: 'nowrap' }}>
                              ₱{m.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="reviews-list">
            <ReviewForm onSubmit={handleReview} />
            {loading && (
              <div className="empty-state">
                <div className="loading-icon" style={{ fontSize: 28 }}>☕</div>
                <p className="loading-text">Loading reviews…</p>
              </div>
            )}
            {!loading && reviews.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No reviews yet — be the first!</p>
              </div>
            )}
            {reviews.map(r => (
              <div className="review-card" key={r.id}>
                <div className="review-top">
                  <span className="review-user">{r.user_emoji} {r.user_name}</span>
                  <RatingStars value={r.rating} size={12} />
                </div>
                {r.drink && <div className="review-drink">☕ {r.drink}</div>}
                <p className="review-body">{r.body}</p>
                <span className="review-time">{r.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

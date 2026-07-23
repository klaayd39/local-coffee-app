import { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, ChevronLeft } from 'lucide-react';
import { EVENTS } from '../data.js';

const EVENT_TYPE_META = {
  competition: { color: '#e0a832', icon: '🏆' },
  music:       { color: '#4a7c59', icon: '🎵' },
  tour:        { color: '#9b4f1e', icon: '🏔️' },
  workshop:    { color: '#3d6b7a', icon: '📚' },
  study:       { color: '#4e4a7a', icon: '💻' },
};

export default function EventsView({ cafes, onBack }) {
  const [rsvpd, setRsvpd] = useState(new Set());
  const cafeName = (id) => cafes.find(c => c.id === id)?.name || '';
  const cafeAccent = (id) => cafes.find(c => c.id === id)?.accent || '#4a7c59';

  // Stable random attendee counts (computed once, not on every render)
  const attendeeCounts = useMemo(() => {
    const counts = {};
    EVENTS.forEach(e => {
      counts[e.id] = Math.floor(Math.random() * 30) + 5;
    });
    return counts;
  }, []);

  const toggleRsvp = (id) => {
    setRsvpd(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="events-page page-animated">
      {/* Back + Header */}
      {onBack && (
        <button className="page-back-btn" onClick={onBack} aria-label="Back to Map">
          <ChevronLeft size={16} />
          <span>Map</span>
        </button>
      )}
      <div className="page-title-row" style={{ marginTop: onBack ? 12 : 0 }}>
        <div className="page-title-content">
          <div className="page-title">Events</div>
          <div className="page-sub">Happening around Malaybalay</div>
        </div>
        <div style={{ fontSize: 28 }}>🎉</div>
      </div>

      {/* Upcoming banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2e20, #0e1c14)',
        border: '1px solid rgba(74,124,89,0.25)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ fontSize: 28 }}>📅</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pine-light)', marginBottom: 2 }}>
            {EVENTS.length} events upcoming
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
            RSVP to save your spot at local café events
          </div>
        </div>
      </div>

      {EVENTS.map(e => {
        const meta = EVENT_TYPE_META[e.type] || EVENT_TYPE_META.music;
        const accent = cafeAccent(e.cafe_id);
        const isRsvpd = rsvpd.has(e.id);

        return (
          <div key={e.id} className="event-card">
            {/* Color accent strip */}
            <div className="event-card-accent" style={{ background: `linear-gradient(90deg, ${accent}, ${meta.color})` }} />

            <div className="event-card-body">
              {/* Date row */}
              <div className="event-date-row">
                <Calendar size={12} />
                {e.starts_at}
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  background: `${meta.color}22`,
                  color: meta.color,
                  padding: '2px 8px',
                  borderRadius: 'var(--r-full)',
                  border: `1px solid ${meta.color}44`,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}>
                  {meta.icon} {e.type}
                </span>
              </div>

              {/* Title */}
              <div className="event-title">{e.title}</div>

              {/* Café tag */}
              <div className="event-cafe-tag">
                <MapPin size={11} />
                {cafeName(e.cafe_id)}
              </div>

              {/* Description */}
              <p className="event-desc">{e.description}</p>

              {/* RSVP + attendees */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <button
                  className="event-rsvp-btn"
                  onClick={() => toggleRsvp(e.id)}
                  style={isRsvpd ? {
                    background: 'var(--pine)',
                    borderColor: 'var(--pine)',
                    color: '#fff',
                  } : {}}
                >
                  {isRsvpd ? '✓ Going' : 'RSVP'}
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} />
                  {attendeeCounts[e.id] + (isRsvpd ? 1 : 0)} going
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Call to action */}
      <div style={{
        textAlign: 'center',
        padding: '20px 16px',
        border: '1px dashed var(--line-strong)',
        borderRadius: 'var(--r-lg)',
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>☕</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Hosting an event?</div>
        <div style={{ fontSize: 11.5 }}>Contact us to get your café event listed here.</div>
      </div>
    </div>
  );
}

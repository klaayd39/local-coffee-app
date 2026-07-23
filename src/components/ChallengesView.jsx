import { Trophy, Flame, CheckCircle, Lock, ChevronLeft } from 'lucide-react';
import { CHALLENGES, LEADERBOARD } from '../data.js';

function ChallengeCard({ challenge }) {
  const pct = Math.round((challenge.progress / challenge.total) * 100);
  const done = challenge.progress >= challenge.total;

  return (
    <div
      className="challenge-big-card"
      style={done ? { borderColor: 'var(--gold)', boxShadow: '0 0 20px var(--amber-glow)' } : {}}
    >
      {/* Top strip */}
      <div style={{
        height: 4,
        background: done
          ? 'linear-gradient(90deg, var(--gold), var(--amber))'
          : 'linear-gradient(90deg, var(--pine), var(--pine-light))',
      }} />

      <div className="challenge-big-header">
        <div style={{ fontSize: 10, fontWeight: 700, color: done ? 'var(--gold)' : 'var(--clay)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Flame size={12} />
          {challenge.active ? challenge.month : 'Coming soon'} · {done ? '✅ Completed!' : 'In Progress'}
        </div>

        <div className="challenge-big-badge">{challenge.badge}</div>

        <h3>{challenge.title}</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
          {challenge.description}
        </p>
      </div>

      <div className="challenge-big-footer">
        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${pct}%`,
            background: done
              ? 'linear-gradient(90deg, var(--gold), var(--amber))'
              : 'linear-gradient(90deg, var(--pine), var(--pine-light))',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="progress-label">
            {challenge.progress} / {challenge.total} completed
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>
            🏅 +{challenge.reward_pts} pts
          </span>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {Array.from({ length: challenge.total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 6,
                background: i < challenge.progress
                  ? (done ? 'var(--gold)' : 'var(--pine)')
                  : 'var(--bg-elevated)',
                border: `1px solid ${i < challenge.progress ? (done ? 'var(--gold)' : 'var(--pine)') : 'var(--line)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
                transition: 'all 0.3s',
              }}
            >
              {i < challenge.progress ? '✓' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChallengesView({ onBack }) {
  const active = CHALLENGES.filter(c => c.active);
  const upcoming = CHALLENGES.filter(c => !c.active);

  return (
    <div className="challenges-page page-animated">
      {/* Back + Header */}
      {onBack && (
        <button className="page-back-btn" onClick={onBack} aria-label="Back to Map">
          <ChevronLeft size={16} />
          <span>Map</span>
        </button>
      )}
      <div className="page-title-row" style={{ marginTop: onBack ? 12 : 0 }}>
        <div className="page-title-content">
          <div className="page-title">Challenges</div>
          <div className="page-sub">Monthly coffee quests · earn badges & points</div>
        </div>
        <div style={{ fontSize: 28 }}>🏆</div>
      </div>

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'Active', value: active.length, color: 'var(--pine-light)', icon: '🔥' },
          { label: 'Completed', value: active.filter(c => c.progress >= c.total).length, color: 'var(--gold)', icon: '✅' },
          { label: 'Points Up', value: active.reduce((sum, c) => sum + c.reward_pts, 0), color: 'var(--amber)', icon: '🏅' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            padding: '12px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-serif)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Active Challenges */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pine-light)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Flame size={12} /> Active This Month
      </div>
      {active.map(ch => <ChallengeCard key={ch.id} challenge={ch} />)}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} /> Coming Soon
          </div>
          {upcoming.map(ch => (
            <div key={ch.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              padding: 16,
              marginBottom: 12,
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{ fontSize: 32 }}>{ch.badge}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{ch.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{ch.month} · 🏅 +{ch.reward_pts} pts</div>
              </div>
              <Lock size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </>
      )}

      {/* Leaderboard snapshot */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Trophy size={12} /> Top Challengers
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {LEADERBOARD.slice(0, 5).map((u, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            borderBottom: i < 4 ? '1px solid var(--line)' : 'none',
            background: i === 0 ? 'linear-gradient(90deg, rgba(224,168,50,0.08), transparent)' : 'transparent',
          }}>
            <span style={{ fontSize: 20 }}>{u.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.user_name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{u.badges} badges earned</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>
              {u.points.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

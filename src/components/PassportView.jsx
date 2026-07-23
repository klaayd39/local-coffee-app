import { useState } from 'react';
import { Award, Flame, Trophy, ChevronLeft } from 'lucide-react';
import { CHALLENGES, LEADERBOARD, REWARDS } from '../data.js';

function PassportCard({ cafe, stamped }) {
  return (
    <div className={`passport-card ${stamped ? 'stamped' : ''}`}>
      <div className="passport-card-top" style={{ background: `linear-gradient(135deg, ${cafe.accent}88, ${cafe.accent2}aa)` }}>
        {stamped ? (
          <span className="passport-stamp-mark" style={{ fontSize: 22 }}>✅</span>
        ) : (
          <span style={{ fontSize: 22, opacity: 0.3 }}>{cafe.emoji}</span>
        )}
      </div>
      <div className="passport-card-name">{cafe.name}</div>
      <div className="passport-card-sub">{cafe.barangay}</div>
    </div>
  );
}

export default function PassportView({ cafes, stamps, userPoints, onBack }) {
  const [activeTab, setActiveTab] = useState('passport');
  const total = cafes.length;
  const collected = Object.values(stamps).filter(Boolean).length;
  const progressPct = Math.round((collected / total) * 100);

  return (
    <div className="passport-page page-animated">
      {/* Back + Header */}
      {onBack && (
        <button className="page-back-btn" onClick={onBack} aria-label="Back to Map">
          <ChevronLeft size={16} />
          <span>Map</span>
        </button>
      )}
      <div className="page-title-row" style={{ marginTop: onBack ? 12 : 0 }}>
        <div className="page-title-content">
          <div className="page-title">Coffee Passport</div>
          <div className="page-sub">{collected} of {total} cafés stamped · {progressPct}% complete</div>
        </div>
        <div className="passport-badge">
          <Award size={22} />
        </div>
      </div>

      {/* Inner tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['passport', 'rewards', 'leaderboard'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--r-full)',
              border: `1px solid ${activeTab === t ? 'var(--pine)' : 'var(--line)'}`,
              background: activeTab === t ? 'var(--pine)' : 'var(--bg-card)',
              color: activeTab === t ? '#fff' : 'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.2px',
            }}
          >
            {t === 'passport' ? '🎟️ Stamps' : t === 'rewards' ? '🎁 Rewards' : '🏆 Board'}
          </button>
        ))}
      </div>

      {/* ── PASSPORT STAMPS ── */}
      {activeTab === 'passport' && (
        <>
          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PROGRESS</span>
              <span style={{ fontSize: 11, color: 'var(--pine-light)', fontWeight: 700 }}>{collected}/{total}</span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="passport-grid">
            {cafes.map(c => (
              <PassportCard key={c.id} cafe={c} stamped={!!stamps[c.id]} />
            ))}
          </div>

          {/* Challenge */}
          {CHALLENGES.filter(ch => ch.active).map(ch => (
            <div key={ch.id} className="challenge-card">
              <div className="card-label">
                <Flame size={13} />
                Monthly Challenge · {ch.month}
              </div>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{ch.badge}</div>
              <h3>{ch.title}</h3>
              <p>{ch.description}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(ch.progress / ch.total) * 100}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span className="progress-label">{ch.progress} / {ch.total} stamps</span>
                <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>+{ch.reward_pts} pts</span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── REWARDS ── */}
      {activeTab === 'rewards' && (
        <>
          {/* Loyalty Points Banner */}
          <div className="loyalty-banner">
            <div>
              <div className="loyalty-points">{userPoints}</div>
              <div style={{ fontSize: 10, color: 'var(--pine-light)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Brew Points</div>
            </div>
            <div className="loyalty-info">
              <h4>Your Loyalty Balance</h4>
              <p>Earn points every visit & review. Redeem for free drinks and perks.</p>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
            Available Rewards
          </div>
          <div className="reward-list">
            {REWARDS.map(r => (
              <div key={r.id} className="reward-item">
                <div className="reward-icon">{r.icon}</div>
                <div className="reward-info">
                  <div className="reward-name">{r.name}</div>
                  <div className="reward-cost">🏅 {r.cost} pts</div>
                </div>
                <button
                  className="redeem-btn"
                  disabled={!r.available || userPoints < r.cost}
                  title={userPoints < r.cost ? 'Not enough points' : 'Redeem'}
                >
                  {userPoints >= r.cost && r.available ? 'Redeem' : 'Locked'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>How to earn points</div>
            {[
              ['✅', 'Visit a new café', '+50 pts'],
              ['⭐', 'Leave a review', '+30 pts'],
              ['🎟️', 'Complete a challenge', '+200–500 pts'],
              ['📸', 'Share a photo', '+20 pts'],
            ].map(([icon, label, pts]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>{icon} {label}</span>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{pts}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── LEADERBOARD ── */}
      {activeTab === 'leaderboard' && (
        <div className="leaderboard-card">
          <div className="card-label">
            <Trophy size={13} />
            July 2026 Rankings
          </div>
          {LEADERBOARD.map((u, i) => (
            <div key={i} className="leaderboard-row">
              <span className="lb-rank">{u.emoji}</span>
              <div className="lb-info">
                <div className="lb-name">{u.user_name}</div>
                <div className="lb-sub">{u.visits} visits · {u.badges} badges</div>
              </div>
              <span className="lb-points">{u.points.toLocaleString()} pts</span>
            </div>
          ))}
          {/* "You" row */}
          <div className="leaderboard-row" style={{ background: 'var(--pine-glow)', borderRadius: 8, padding: '10px 8px' }}>
            <span className="lb-rank">😊</span>
            <div className="lb-info">
              <div className="lb-name" style={{ color: 'var(--pine-light)' }}>You</div>
              <div className="lb-sub">Keep visiting to climb!</div>
            </div>
            <span className="lb-points" style={{ color: 'var(--pine-light)' }}>{userPoints} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}

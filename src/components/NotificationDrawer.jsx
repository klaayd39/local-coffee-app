import { X, Heart, UserPlus, Award, Bell } from 'lucide-react';
import { NOTIFICATIONS } from '../data/socialData.js';

export default function NotificationDrawer({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        maxHeight: '80vh',
        background: 'var(--bg-card)',
        borderTopLeftRadius: 'var(--r-xl)',
        borderTopRightRadius: 'var(--r-xl)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--pine)" /> Activity & Notifications
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {NOTIFICATIONS.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--r-lg)',
                background: n.read ? 'var(--bg-card)' : 'var(--bg-elevated)',
                border: '1px solid var(--line)'
              }}
            >
              {n.user ? (
                <img src={n.user.avatar} alt={n.user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {n.icon}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {n.user && <strong>{n.user.name} </strong>}
                  {n.text}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

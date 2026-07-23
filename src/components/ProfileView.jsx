import { useState, useEffect, useRef } from 'react';
import {
  UserCheck, UserPlus, Award, Stamp, Heart, Bookmark,
  Settings, Grid, Coffee, MapPin, CheckCircle, LogOut, Edit2, Check, X, MessageCircle,
  Share2, QrCode as QrCodeIcon, Shield, Bell, Moon, Copy, ExternalLink, HelpCircle,
  Flame, Star, Trophy, Compass, Sparkles, BookOpen, ThumbsUp, Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CURRENT_USER, USERS, BADGES, POSTS } from '../data/socialData.js';
import { getCurrentProfile, updateProfile, signOutUser } from '../lib/supabaseClient.js';

// Animated Counter Hook
function useAnimatedCounter(targetValue, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let numeric = parseInt(targetValue, 10);
    if (isNaN(numeric) || numeric <= 0) {
      setCount(targetValue);
      return;
    }
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeOutQuad * numeric));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(numeric);
      }
    };
    requestAnimationFrame(step);
  }, [targetValue, duration]);

  return typeof targetValue === 'number' ? count : targetValue;
}

// Reusable Coffee Journey Stat Card Component
function CoffeeStatCard({ icon: Icon, value, label, subtext, progress, accentColor = 'var(--amber)', highlight = false, tooltip }) {
  const animatedVal = useAnimatedCounter(typeof value === 'number' ? value : 0);
  const displayVal = typeof value === 'number' ? animatedVal : value;

  return (
    <div className={`coffee-stat-card ${highlight ? 'highlight-streak' : ''}`} role="region" aria-label={label}>
      <div className="stat-card-top">
        <div className="stat-card-icon-badge" style={{ color: accentColor, background: `${accentColor}18` }}>
          <Icon size={18} />
        </div>
        {tooltip && (
          <div className="stat-card-tooltip-wrapper" title={tooltip}>
            <Info size={13} className="stat-tooltip-icon" />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value" style={{ color: highlight ? 'var(--amber)' : 'var(--text-primary)' }}>
          {displayVal}
        </div>
        <div className="stat-card-label">{label}</div>
        {subtext && <div className="stat-card-subtext">{subtext}</div>}
      </div>

      {progress !== undefined && progress !== null && (
        <div className="stat-card-progress-bar">
          <div 
            className="stat-card-progress-fill" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: accentColor }}
          />
        </div>
      )}
    </div>
  );
}

export default function ProfileView({ user: propUser = CURRENT_USER, savedPostIds = [], onOpenPost, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', bio: '', avatar_url: '', cover_url: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState('checkins'); // checkins | saved | badges
  const [isFollowing, setIsFollowing] = useState(false);

  // Sticky Header Logic
  const coverRef = useRef(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyHeader(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    if (coverRef.current) {
      observer.observe(coverRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentProfile();
        if (data) {
          setProfile(data);
          setEditForm({ name: data.name || '', username: data.username || '', bio: data.bio || '', avatar_url: data.avatar_url || '', cover_url: data.cover_url || localStorage.getItem('local_cover_url') || '' });
        } else {
          setProfile({
            id: propUser.id,
            name: propUser.name,
            username: propUser.username,
            avatar_url: propUser.avatar,
            bio: propUser.bio,
            level: propUser.level,
            points: propUser.points,
            followersCount: propUser.followersCount,
            followingCount: propUser.followingCount,
            checkInsCount: propUser.checkInsCount
          });
          setEditForm({ name: propUser.name || '', username: propUser.username || '', bio: propUser.bio || '', avatar_url: propUser.avatar_url || propUser.avatar || '', cover_url: propUser.cover_url || localStorage.getItem('local_cover_url') || '' });
        }
      } catch (err) {
        console.warn('Error loading Supabase profile, using default:', err.message);
        setProfile({
          id: propUser.id,
          name: propUser.name,
          username: propUser.username,
          avatar_url: propUser.avatar,
          bio: propUser.bio,
          level: propUser.level,
          points: propUser.points,
          followersCount: propUser.followersCount,
          followingCount: propUser.followingCount,
          checkInsCount: propUser.checkInsCount
        });
        setEditForm({ name: propUser.name || '', username: propUser.username || '', bio: propUser.bio || '', avatar_url: propUser.avatar_url || propUser.avatar || '', cover_url: propUser.cover_url || localStorage.getItem('local_cover_url') || '' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [propUser]);

  const [followers, setFollowers] = useState(propUser.followersCount || 142);

  const currentUserData = profile || propUser;
  const isMe = true;

  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
    setFollowers(count => (isFollowing ? count - 1 : count + 1));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsSavingProfile(true);
    try {
      const updated = await updateProfile(profile.id, { 
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        avatar_url: editForm.avatar_url,
        cover_url: editForm.cover_url
      });
      if (updated) setProfile(updated);
      localStorage.setItem('local_cover_url', editForm.cover_url || '');
      setShowEditProfile(false);
      setShowAvatarModal(false);
      setShowCoverModal(false);
    } catch (err) {
      if (err.message && err.message.includes('cover_url')) {
        try {
          const fallback = await updateProfile(profile.id, {
            name: editForm.name,
            username: editForm.username,
            bio: editForm.bio,
            avatar_url: editForm.avatar_url
          });
          if (fallback) setProfile({ ...fallback, cover_url: editForm.cover_url });
          localStorage.setItem('local_cover_url', editForm.cover_url || '');
          setShowEditProfile(false);
          setShowAvatarModal(false);
          setShowCoverModal(false);
        } catch (fallbackErr) {
          alert('Failed to update profile: ' + fallbackErr.message);
        }
      } else {
        alert('Failed to update profile: ' + err.message);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [showQrModal, setShowQrModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [shareToast, setShareToast] = useState('');

  const handleShareProfile = async () => {
    const profileUrl = window.location.origin + '/?user=' + (currentUserData.username || 'coffeelover');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentUserData.name} on KapeGram`,
          text: `Check out ${currentUserData.name}'s coffee passport profile on KapeGram! ☕`,
          url: profileUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard if share was cancelled or failed
      }
    }
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setShareToast('Profile link copied to clipboard!');
      setTimeout(() => setShareToast(''), 3000);
    } catch (err) {
      setShareToast('Profile link: ' + profileUrl);
      setTimeout(() => setShareToast(''), 4000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Logout error:', err.message);
    }
    if (onLogout) onLogout();
  };

  const userPosts = POSTS.filter(p => p.user.id === propUser.id || p.user.name === currentUserData.name);
  const savedPosts = POSTS.filter(p => savedPostIds.includes(p.id));

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Coffee Passport Profile...
      </div>
    );
  }

  const avatarImg = currentUserData.avatar_url || currentUserData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
  const coverUrl = currentUserData.cover_url || localStorage.getItem('local_cover_url') || '';

  // Touch Swipe Gesture Handling for Tabs (Mobile UX)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const TABS_ORDER = ['checkins', 'saved', 'badges'];

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // min px to trigger swipe

    if (Math.abs(distance) > minSwipeDistance) {
      const currentIndex = TABS_ORDER.indexOf(activeTab);
      if (distance > 0 && currentIndex < TABS_ORDER.length - 1) {
        // Swiped Left -> Move to Next Tab
        setActiveTab(TABS_ORDER[currentIndex + 1]);
      } else if (distance < 0 && currentIndex > 0) {
        // Swiped Right -> Move to Previous Tab
        setActiveTab(TABS_ORDER[currentIndex - 1]);
      }
    }
    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="profile-layout-container">
      {/* Sticky Header */}
      <div className={`profile-sticky-header ${showStickyHeader ? 'visible' : ''}`}>
        <img src={avatarImg} alt={currentUserData.name} className="profile-sticky-avatar" />
        <div className="profile-sticky-name">{currentUserData.name}</div>
      </div>

      <div className="profile-layout-inner">
        {/* Cover Header */}
        <div className="profile-cover" ref={coverRef} onClick={() => {
          setEditForm({
            name: currentUserData.name || '',
            username: currentUserData.username || '',
            bio: currentUserData.bio || '',
            avatar_url: currentUserData.avatar_url || currentUserData.avatar || '',
            cover_url: currentUserData.cover_url || localStorage.getItem('local_cover_url') || ''
          });
          setShowCoverModal(true);
        }} style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' } : { cursor: 'pointer' }}>
          <div className="profile-cover-actions">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSettingsModal(true); }} 
              title="Settings" 
              className="profile-cover-btn"
              aria-label="Open Settings"
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Profile Split Wrapper for Desktop vs Mobile */}
        <div className="profile-split-wrapper">
          {/* Left Panel: Sidebar on Desktop, Top Section on Mobile */}
          <div className="profile-sidebar-panel">
            <div className="profile-info-section">
              <div className="profile-avatar-row">
                <img
                  src={avatarImg}
                  alt={currentUserData.name}
                  className="profile-avatar"
                  onClick={() => {
                    setEditForm({
                      name: currentUserData.name || '',
                      username: currentUserData.username || '',
                      bio: currentUserData.bio || '',
                      avatar_url: currentUserData.avatar_url || currentUserData.avatar || '',
                      cover_url: currentUserData.cover_url || localStorage.getItem('local_cover_url') || ''
                    });
                    setShowAvatarModal(true);
                  }}
                  style={{ cursor: 'pointer' }}
                />

                {!isMe ? (
                  <button
                    onClick={toggleFollow}
                    className={`profile-action-btn ${isFollowing ? 'secondary' : 'primary'}`}
                  >
                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                ) : (
                  <div className="profile-level-container">
                    <div className="profile-level-text">
                      👑 {currentUserData.level || 'Bean Explorer'} <span style={{fontSize:'11px', color:'var(--text-muted)'}}>({currentUserData.points || 142} / 200 PTS)</span>
                    </div>
                    <div className="profile-level-bar-bg">
                      <div className="profile-level-bar-fill" style={{ width: `${Math.min(100, ((currentUserData.points || 142) / 200) * 100)}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="profile-name">{currentUserData.name}</h2>
                <div className="profile-username">@{currentUserData.username || 'coffeelover'}</div>
                
                {/* Bio Section */}
                <div>
                  <div className="profile-bio-container">
                    <p className="profile-bio-text">
                      {currentUserData.bio || 'Coffee enthusiast exploring local cafes ☕'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="profile-quick-actions" role="region" aria-label="Quick Actions">
                <button
                  onClick={() => {
                    setEditForm({
                      name: currentUserData.name || '',
                      username: currentUserData.username || '',
                      bio: currentUserData.bio || '',
                      avatar_url: currentUserData.avatar_url || currentUserData.avatar || '',
                      cover_url: currentUserData.cover_url || localStorage.getItem('local_cover_url') || ''
                    });
                    setShowEditProfile(true);
                  }}
                  className="quick-action-btn primary-action"
                  aria-label="Edit Profile"
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={handleShareProfile}
                  className="quick-action-btn"
                  aria-label="Share Profile"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="quick-action-btn icon-only"
                  title="Personal QR Code"
                  aria-label="Show Personal QR Code"
                >
                  <QrCodeIcon size={18} />
                </button>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="quick-action-btn icon-only"
                  title="Settings"
                  aria-label="Open Settings"
                >
                  <Settings size={18} />
                </button>
              </div>

              {/* Feedback Toast */}
              {shareToast && (
                <div className="profile-toast-notification">
                  <Check size={14} />
                  <span>{shareToast}</span>
                </div>
              )}

              {/* Coffee Journey Statistics Cards Grid */}
              <div className="coffee-journey-stats-section" role="region" aria-label="Coffee Journey Statistics">
                <div className="journey-stats-header">
                  <h3 className="journey-stats-title">
                    <Sparkles size={16} color="var(--amber)" />
                    Coffee Journey Highlights
                  </h3>
                  <span className="journey-level-pill">
                    {currentUserData.level || 'Bean Explorer'}
                  </span>
                </div>

                <div className="coffee-stats-grid">
                  <CoffeeStatCard
                    icon={Coffee}
                    value={userPosts.length || currentUserData.checkInsCount || 12}
                    label="Check-ins"
                    subtext="Total brews logged"
                    accentColor="#8C5A3C"
                    tooltip="Number of coffee check-ins posted to your profile"
                  />

                  <CoffeeStatCard
                    icon={Stamp}
                    value="16 / 42"
                    label="Passport Completed"
                    subtext="38% Stamped"
                    progress={38}
                    accentColor="#365C41"
                    tooltip="Official stamps collected in your Coffee Passport"
                  />

                  <CoffeeStatCard
                    icon={Heart}
                    value="Spanish Latte"
                    label="Favorite Drink"
                    subtext="Most enjoyed brew"
                    accentColor="#E11D48"
                    tooltip="Your top-rated and most frequently logged coffee drink"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Content Tabs & Feed on Desktop, Below on Mobile */}
          <div className="profile-main-content-panel">
            {/* Navigation Tabs */}
            <div className="profile-tabs">
              <button
                onClick={() => setActiveTab('checkins')}
                className={`profile-tab-btn ${activeTab === 'checkins' ? 'active' : ''}`}
              >
                <Grid size={16} /> Posts ({userPosts.length})
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`profile-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              >
                <Bookmark size={16} /> Saved ({savedPosts.length})
              </button>

              <button
                onClick={() => setActiveTab('badges')}
                className={`profile-tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
              >
                <Award size={16} /> Badges
              </button>

              <div 
                className="profile-tab-indicator" 
                style={{
                  width: '33.33%',
                  left: activeTab === 'checkins' ? '0%' : activeTab === 'saved' ? '33.33%' : '66.66%'
                }}
              ></div>
            </div>

            {/* Tab Content Area with Touch Swipe Support */}
            <div 
              className="profile-tab-content-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activeTab === 'checkins' && (
                userPosts.length > 0 ? (
                  <div className="profile-grid">
                    {userPosts.map(p => (
                      <div key={p.id} className="profile-grid-item" onClick={() => onOpenPost?.(p)}>
                        <img src={p.image} alt={p.drinkName} className="profile-grid-img" />
                        <div className="profile-grid-overlay">
                          <div className="profile-grid-stat"><Heart size={16} fill="white" /> {Math.floor(Math.random() * 40) + 10}</div>
                          <div className="profile-grid-stat"><MessageCircle size={16} fill="white" /> {Math.floor(Math.random() * 8) + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <Coffee size={48} strokeWidth={1.5} />
                    <h4>No Posts Yet</h4>
                    <p>Start sharing your coffee experiences! Check in at a café to create your first post.</p>
                  </div>
                )
              )}

              {activeTab === 'saved' && (
                savedPosts.length > 0 ? (
                  <div className="profile-grid">
                    {savedPosts.map(p => (
                      <div key={p.id} className="profile-grid-item" onClick={() => onOpenPost?.(p)}>
                        <img src={p.image} alt={p.drinkName} className="profile-grid-img" />
                        <div className="profile-grid-overlay">
                          <div className="profile-grid-stat"><Heart size={16} fill="white" /> {Math.floor(Math.random() * 40) + 10}</div>
                          <div className="profile-grid-stat"><MessageCircle size={16} fill="white" /> {Math.floor(Math.random() * 8) + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <Bookmark size={48} strokeWidth={1.5} />
                    <h4>No Saved Posts</h4>
                    <p>Bookmark posts you love to find them here later. Tap the save icon on any post!</p>
                  </div>
                )
              )}

              {activeTab === 'badges' && (
                BADGES.filter(b => b.unlocked).length > 0 ? (
                  <div className="profile-badges-grid">
                    {BADGES.map(b => (
                      <div key={b.id} className={`profile-badge-card ${!b.unlocked ? 'locked' : ''}`}>
                        <div className="badge-icon-wrapper">{b.icon}</div>
                        <div>
                          <div className="badge-card-title">
                            {b.name}
                            {b.unlocked && <CheckCircle size={12} color="#10b981" style={{marginLeft: '4px', verticalAlign: '-2px'}} />}
                          </div>
                          <div className="badge-card-desc">{b.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <Award size={48} strokeWidth={1.5} />
                    <h4>No Badges Earned</h4>
                    <p>Complete challenges and milestones to unlock badges. Keep exploring cafés!</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal QR Code Modal ── */}
      {showQrModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="profile-modal-card qr-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="qr-modal-title" aria-modal="true">
            <button className="profile-modal-close" onClick={() => setShowQrModal(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            <div className="qr-modal-header">
              <div className="qr-modal-icon">
                <Coffee size={24} color="var(--amber)" />
              </div>
              <h3 id="qr-modal-title" className="qr-modal-title">Coffee Passport QR</h3>
              <p className="qr-modal-sub">Scan to connect & explore coffee recommendations with @{currentUserData.username || 'coffeelover'}</p>
            </div>

            <div className="qr-code-frame">
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                <QRCodeSVG 
                  value={window.location.origin + '/?user=' + (currentUserData.username || 'coffeelover')} 
                  size={160} 
                  fgColor="var(--primary-coffee)" 
                  imageSettings={{
                    src: "/icon-192.png",
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              </div>
              <div className="qr-user-badge">
                <img src={avatarImg} alt="" className="qr-badge-avatar" />
                <span className="qr-badge-name">@{currentUserData.username || 'coffeelover'}</span>
              </div>
            </div>

            <div className="qr-modal-actions">
              <button className="qr-action-btn secondary" onClick={handleShareProfile}>
                <Share2 size={16} />
                <span>Share Link</span>
              </button>
              <button 
                className="qr-action-btn primary"
                onClick={() => {
                  setShareToast('QR Code saved to photos!');
                  setTimeout(() => setShareToast(''), 3000);
                  setShowQrModal(false);
                }}
              >
                <Copy size={16} />
                <span>Save QR Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Cover Modal ── */}
      {showCoverModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowCoverModal(false)}>
          <div className="edit-profile-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="edit-cover-title" aria-modal="true">
            <div className="edit-profile-header">
              <h3 id="edit-cover-title">Update Cover Photo</h3>
              <button className="edit-profile-close" onClick={() => setShowCoverModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="edit-profile-input-group">
              <label>Cover Photo</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {editForm.cover_url && <img src={editForm.cover_url} style={{ width: 60, height: 40, borderRadius: '4px', objectFit: 'cover' }} alt="Cover Preview" />}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_url')} className="edit-profile-input" style={{ flex: 1, padding: '6px' }} />
              </div>
            </div>
            <div className="edit-profile-actions">
              <button className="edit-profile-btn cancel" onClick={() => setShowCoverModal(false)}>Cancel</button>
              <button className="edit-profile-btn save" onClick={handleSaveProfile} disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Avatar Modal ── */}
      {showAvatarModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowAvatarModal(false)}>
          <div className="edit-profile-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="edit-avatar-title" aria-modal="true">
            <div className="edit-profile-header">
              <h3 id="edit-avatar-title">Update Profile Photo</h3>
              <button className="edit-profile-close" onClick={() => setShowAvatarModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="edit-profile-input-group">
              <label>Avatar Photo</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <img src={editForm.avatar_url || avatarImg} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="Avatar Preview" />
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar_url')} className="edit-profile-input" style={{ flex: 1, padding: '6px' }} />
              </div>
            </div>
            <div className="edit-profile-actions">
              <button className="edit-profile-btn cancel" onClick={() => setShowAvatarModal(false)}>Cancel</button>
              <button className="edit-profile-btn save" onClick={handleSaveProfile} disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      {showEditProfile && (
        <div className="profile-modal-backdrop" onClick={() => setShowEditProfile(false)}>
          <div className="edit-profile-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="edit-profile-title" aria-modal="true">
            <div className="edit-profile-header">
              <h3 id="edit-profile-title">Edit Profile</h3>
              <button className="edit-profile-close" onClick={() => setShowEditProfile(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="edit-profile-input-group">
              <label>Name</label>
              <input 
                type="text" 
                className="edit-profile-input" 
                value={editForm.name} 
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Your Name"
              />
            </div>
            
            <div className="edit-profile-input-group">
              <label>Username</label>
              <input 
                type="text" 
                className="edit-profile-input" 
                value={editForm.username} 
                onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                placeholder="username"
              />
            </div>

            <div className="edit-profile-input-group">
              <label>Bio</label>
              <textarea 
                className="edit-profile-textarea" 
                value={editForm.bio} 
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Share your coffee journey..."
              />
            </div>

            <div className="edit-profile-actions">
              <button className="edit-profile-btn cancel" onClick={() => setShowEditProfile(false)}>
                Cancel
              </button>
              <button 
                className="edit-profile-btn save" 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettingsModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="profile-modal-card settings-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="settings-modal-title" aria-modal="true">
            <div className="settings-modal-header">
              <div className="settings-header-title">
                <Settings size={20} className="settings-icon" />
                <h3 id="settings-modal-title">Settings & Preferences</h3>
              </div>
              <button className="profile-modal-close" onClick={() => setShowSettingsModal(false)} aria-label="Close settings">
                <X size={18} />
              </button>
            </div>

            <div className="settings-modal-body">
              {/* Account Section */}
              <div className="settings-section">
                <div className="settings-section-title">Account & Profile</div>
                <div className="settings-list">
                  <div className="settings-item" onClick={() => { 
                    setShowSettingsModal(false); 
                    setEditForm({
                      name: currentUserData.name || '',
                      username: currentUserData.username || '',
                      bio: currentUserData.bio || '',
                      avatar_url: currentUserData.avatar_url || currentUserData.avatar || '',
                      cover_url: currentUserData.cover_url || localStorage.getItem('local_cover_url') || ''
                    });
                    setShowEditProfile(true); 
                  }}>
                    <div className="settings-item-left">
                      <Edit2 size={17} />
                      <div>
                        <div className="settings-item-label">Edit Profile & Bio</div>
                        <div className="settings-item-desc">Update your display name and coffee bio</div>
                      </div>
                    </div>
                    <ExternalLink size={15} className="settings-chevron" />
                  </div>

                  <div className="settings-item" onClick={() => { setShowSettingsModal(false); setShowQrModal(true); }}>
                    <div className="settings-item-left">
                      <QrCodeIcon size={17} />
                      <div>
                        <div className="settings-item-label">Personal QR Passport</div>
                        <div className="settings-item-desc">Show QR for quick social friending</div>
                      </div>
                    </div>
                    <ExternalLink size={15} className="settings-chevron" />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="settings-section">
                <div className="settings-section-title">App Settings</div>
                <div className="settings-list">
                  <div className="settings-item">
                    <div className="settings-item-left">
                      <Bell size={17} />
                      <div>
                        <div className="settings-item-label">Push Notifications</div>
                        <div className="settings-item-desc">Cafe events, passport updates, new followers</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} className="settings-toggle" aria-label="Toggle notifications" />
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-left">
                      <Shield size={17} />
                      <div>
                        <div className="settings-item-label">Privacy & Security</div>
                        <div className="settings-item-desc">Manage post visibility and account security</div>
                      </div>
                    </div>
                    <ExternalLink size={15} className="settings-chevron" />
                  </div>
                </div>
              </div>

              {/* Support Section */}
              <div className="settings-section">
                <div className="settings-section-title">Support & About</div>
                <div className="settings-list">
                  <div className="settings-item">
                    <div className="settings-item-left">
                      <HelpCircle size={17} />
                      <div>
                        <div className="settings-item-label">Help Center & Feedback</div>
                        <div className="settings-item-desc">Get help or request new features</div>
                      </div>
                    </div>
                    <ExternalLink size={15} className="settings-chevron" />
                  </div>
                </div>
              </div>

              {/* Danger Zone / Sign Out */}
              <div className="settings-section danger-zone">
                <div className="settings-section-title danger">Account Actions</div>
                <button
                  className="settings-signout-btn"
                  onClick={() => setShowSignOutConfirm(true)}
                >
                  <LogOut size={16} />
                  <span>Sign Out of KapeGram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sign Out Confirmation Dialog ── */}
      {showSignOutConfirm && (
        <div className="profile-modal-backdrop confirm-backdrop" onClick={() => setShowSignOutConfirm(false)}>
          <div className="profile-modal-card confirm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="signout-confirm-title" aria-modal="true">
            <div className="confirm-icon-wrapper">
              <LogOut size={24} color="#ef4444" />
            </div>
            <h3 id="signout-confirm-title" className="confirm-title">Sign Out of KapeGram?</h3>
            <p className="confirm-sub">You can always log back in anytime to access your coffee passport, check-ins, and saved cafes.</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={() => setShowSignOutConfirm(false)}>
                Cancel
              </button>
              <button 
                className="confirm-btn danger" 
                onClick={() => {
                  setShowSignOutConfirm(false);
                  setShowSettingsModal(false);
                  handleLogout();
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapPin, Coffee, Stamp, Calendar, Users, Trophy,
  Search, Wifi, Zap, BookOpen, PawPrint, Car, Filter, X,
  User, LogIn, LogOut, Store, ChevronLeft, Moon, Sun,
  Compass, PlusCircle, Bell, Heart
} from 'lucide-react';

import { fetchCafes } from './data.js';
import { POSTS as INITIAL_POSTS, CURRENT_USER } from './data/socialData.js';
import { AMENITY_META } from './components/shared.jsx';
import { supabase, getCurrentProfile } from './lib/supabaseClient.js';

import MapView from './components/MapView.jsx';
import CafeList from './components/CafeList.jsx';
import CafeDetail from './components/CafeDetail.jsx';
import PassportView from './components/PassportView.jsx';
import EventsView from './components/EventsView.jsx';
import CommunityView from './components/CommunityView.jsx';
import ChallengesView from './components/ChallengesView.jsx';
import PartnerPortalView from './components/PartnerPortalView.jsx';

// Social Components
import FeedView from './components/FeedView.jsx';
import CreatePostModal from './components/CreatePostModal.jsx';
import ProfileView from './components/ProfileView.jsx';
import ExploreTrendingView from './components/ExploreTrendingView.jsx';
import NotificationDrawer from './components/NotificationDrawer.jsx';

import LoginModal from './components/LoginModal.jsx';
import AuthLandingPage from './components/AuthLandingPage.jsx';

import DesktopLandingPage from './components/DesktopLandingPage.jsx';
import DesktopAppShell from './components/DesktopAppShell.jsx';
import DesktopMapView from './components/DesktopMapView.jsx';

// Toast notification hook
function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);
  return [toast, showToast];
}

const NAV_ITEMS = [
  { id: 'feed',       label: 'Feed',       Icon: Coffee },
  { id: 'map',        label: 'Map',        Icon: MapPin },
  { id: 'explore',    label: 'Explore',    Icon: Compass },
  { id: 'passport',   label: 'Passport',   Icon: Stamp },
  { id: 'profile',    label: 'Profile',    Icon: User },
];

export default function App() {
  const [cafes, setCafes] = useState([]);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [savedPostIds, setSavedPostIds] = useState(['p2']);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('feed');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [stamps, setStamps] = useState({ c7: true });
  const [userPoints, setUserPoints] = useState(750);
  const [toast, showToast] = useToast();
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Social Modals State
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('timpla_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('timpla_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth & View state
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState(CURRENT_USER);
  const [session, setSession] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Supabase Auth State Observer
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setShowLanding(false);
        getCurrentProfile().then(profile => {
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              username: profile.username || profile.email.split('@')[0],
              avatar: profile.avatar_url,
              bio: profile.bio,
              level: profile.level || 'Bean Explorer',
              points: profile.points || 0
            });
          }
        });
      }
    });

    // Listen for sign-in / sign-out events in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setShowLanding(false);
        const profile = await getCurrentProfile().catch(() => null);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            username: profile.username || profile.email.split('@')[0],
            avatar: profile.avatar_url,
            bio: profile.bio,
            level: profile.level || 'Bean Explorer',
            points: profile.points || 0
          });
        }
      } else {
        setUser(null);
        setShowLanding(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCafes().then(data => {
      setCafes(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return cafes.filter(c => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.barangay.toLowerCase().includes(search.toLowerCase()) ||
        c.tagline.toLowerCase().includes(search.toLowerCase());
      const matchFilters = activeFilters.every(f => c[f]);
      return matchSearch && matchFilters;
    });
  }, [cafes, search, activeFilters]);

  const selected = cafes.find(c => c.id === selectedId);

  const toggleFilter = (key) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  // Social Interaction Handlers
  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    }));
  };

  const handleSavePost = (postId) => {
    setSavedPostIds(prev => {
      const exists = prev.includes(postId);
      if (exists) {
        showToast('Bookmark removed');
        return prev.filter(id => id !== postId);
      } else {
        showToast('Saved to your Coffee Collection ☕');
        return [...prev, postId];
      }
    });

    setPosts(prev => prev.map(p => {
      if (p.id === postId) return { ...p, isSaved: !p.isSaved };
      return p;
    }));
  };

  const handleAddComment = (postId, text) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: 'c_' + Date.now(),
          user,
          text,
          time: 'Just now'
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));
  };

  const handleCreatePostSubmit = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setUserPoints(pts => pts + 50);
    showToast('🎉 Review posted! +50 pts added');
  };

  const handleStamp = (cafeId) => {
    const wasStamped = !!stamps[cafeId];
    setStamps(prev => ({ ...prev, [cafeId]: !prev[cafeId] }));
    if (!wasStamped) {
      setUserPoints(p => p + 50);
      showToast('✅ Passport stamped! +50 pts');
    } else {
      showToast('Stamp removed');
    }
  };

  const handleReview = () => {
    setUserPoints(p => p + 30);
    showToast('⭐ Review posted! +30 pts');
  };

  const handleNavChange = (v) => {
    setView(v);
    setSelectedId(null);
  };

  const handleLoginSuccess = (userData) => {
    // Immediately hide the landing page; onAuthStateChange will load the full profile
    setShowLanding(false);
    const displayName = userData?.name || userData?.email?.split('@')[0] || 'Coffee Explorer';
    showToast(`☕ Welcome back, ${displayName}!`);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Logout error:', err.message);
    }
    setUser(null);
    setShowLanding(true);
    showToast('Logged out successfully');
  };

  const showSearchFilter = !selected && (view === 'map' || view === 'cafes');

  if (showLanding) {
    return <AuthLandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  const goBack = () => setView('feed');

  const mainContent = (selected && view !== 'map') ? (
    <CafeDetail
      cafe={selected}
      onClose={() => setSelectedId(null)}
      onStamp={handleStamp}
      stamped={!!stamps[selected.id]}
      onReview={handleReview}
    />
  ) : loading ? (
    <div className="loading-screen">
      <div className="loading-icon" style={{ fontSize: 40 }}>☕</div>
      <p className="loading-text">Brewing your social feed…</p>
    </div>
  ) : view === 'feed' ? (
    <FeedView
      posts={posts}
      onLikePost={handleLikePost}
      onSavePost={handleSavePost}
      onAddComment={handleAddComment}
      onOpenCreatePost={() => setCreatePostOpen(true)}
      onSelectCafe={(id) => { setSelectedId(id); setView('map'); }}
    />
  ) : view === 'map' ? (
    isMobile
      ? <MapView cafes={filtered} onSelect={setSelectedId} selectedId={selectedId} />
      : <DesktopMapView cafes={filtered} onSelect={setSelectedId} selectedId={selectedId} />
  ) : view === 'explore' ? (
    <ExploreTrendingView cafes={cafes} onSelectCafe={(id) => { setSelectedId(id); setView('map'); }} />
  ) : view === 'passport' ? (
    <PassportView cafes={cafes} stamps={stamps} userPoints={userPoints} onBack={goBack} />
  ) : view === 'profile' ? (
    <ProfileView user={user || CURRENT_USER} savedPostIds={savedPostIds} onOpenPost={(id) => setView('feed')} onLogout={handleLogout} />
  ) : view === 'cafes' ? (
    <CafeList cafes={filtered} onOpen={setSelectedId} stamps={stamps} onBack={goBack} />
  ) : view === 'challenges' ? (
    <ChallengesView onBack={goBack} />
  ) : view === 'events' ? (
    <EventsView cafes={cafes} onBack={goBack} />
  ) : view === 'partner' ? (
    <PartnerPortalView onShowToast={showToast} onBack={goBack} />
  ) : (
    <CommunityView cafes={cafes} onOpenCafe={(id) => { setSelectedId(id); }} onBack={goBack} />
  );

  if (!isMobile) {
    return (
      <>
        <DesktopAppShell
          navItems={NAV_ITEMS}
          view={view}
          setView={handleNavChange}
          user={user}
          onLogout={handleLogout}
          onShowLanding={() => { setView('feed'); setSelectedId(null); }}
          onOpenLogin={() => setLoginModalOpen(true)}
          showSearchFilter={showSearchFilter}
          search={search}
          setSearch={setSearch}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          selected={selected}
          toast={toast}
        >
          {mainContent}
        </DesktopAppShell>

        {createPostOpen && (
          <CreatePostModal
            cafes={cafes}
            onClose={() => setCreatePostOpen(false)}
            onSubmitPost={handleCreatePostSubmit}
          />
        )}

        {notificationsOpen && (
          <NotificationDrawer onClose={() => setNotificationsOpen(false)} />
        )}

        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="app-shell">
      {/* ── Topbar ── */}
      {!selected && (
        <header className="topbar">
          <div className="brand" onClick={() => { setView('feed'); setSelectedId(null); }} style={{ cursor: 'pointer' }} title="Go to Feed">
            <div className="brand-icon">
              <img src="/icon-192.png" alt="KapeGram Icon" style={{ width: 24, height: 24, borderRadius: 6 }} />
            </div>
            <div>
              <div className="brand-name">KapeGram</div>
              <div className="brand-sub">Coffee Social Network</div>
            </div>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--line)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              title="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
            </button>

            <button
              onClick={() => setNotificationsOpen(true)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--line)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                position: 'relative'
              }}
              title="Notifications"
            >
              <Bell size={17} />
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#e11d48'
              }} />
            </button>

            <button
              onClick={() => setCreatePostOpen(true)}
              style={{
                background: 'var(--pine)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-full)',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={15} /> Post
            </button>
          </div>
        </header>
      )}

      {/* ── Search + Filter zone ── */}
      {showSearchFilter && (
        <div className="search-filter-zone">
          <div className="search-box">
            <Search size={15} color="var(--text-muted)" />
            <input
              id="cafe-search"
              placeholder="Search cafés, barangay, or vibe…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {filterOpen && (
            <div className="filter-row">
              {Object.entries(AMENITY_META).map(([k, { icon: Icon, label }]) => {
                const active = activeFilters.includes(k);
                return (
                  <button
                    key={k}
                    className={`filter-chip ${active ? 'active' : ''}`}
                    onClick={() => toggleFilter(k)}
                    aria-pressed={active}
                  >
                    <Icon size={12} /> {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <main className="main-area" id="main-content">
        {mainContent}
      </main>

      {!selected && (
        <nav className="bottom-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              className={`nav-btn ${view === id ? 'active' : ''}`}
              onClick={() => handleNavChange(id)}
              aria-label={label}
              aria-current={view === id ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={view === id ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </nav>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}

      {createPostOpen && (
        <CreatePostModal
          cafes={cafes}
          onClose={() => setCreatePostOpen(false)}
          onSubmitPost={handleCreatePostSubmit}
        />
      )}

      {notificationsOpen && (
        <NotificationDrawer onClose={() => setNotificationsOpen(false)} />
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

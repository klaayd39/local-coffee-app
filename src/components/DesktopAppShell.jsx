import {
  Coffee, Search, Filter, X, LogIn, LogOut, Sun, Moon, Bell, PlusCircle, Sparkles
} from 'lucide-react';
import { AMENITY_META } from './shared.jsx';

export default function DesktopAppShell({
  navItems,
  view,
  setView,
  user,
  onLogout,
  onShowLanding,
  onOpenLogin,
  showSearchFilter,
  search,
  setSearch,
  filterOpen,
  setFilterOpen,
  activeFilters,
  toggleFilter,
  selected,
  children,
  toast,
  theme,
  onToggleTheme,
  onOpenNotifications,
  onOpenCreatePost
}) {
  return (
    <div className="desktop-app-shell">
      <aside className="desktop-app-sidebar">
        <div className="desktop-sidebar-brand" onClick={onShowLanding} title="Back to landing page">
          <div className="brand-icon">
            <img src="/icon-192.png" alt="KapeGram Icon" style={{ width: 28, height: 28, borderRadius: 8 }} />
          </div>
          <div>
            <div className="brand-name">KapeGram</div>
            <div className="brand-sub">Coffee Social Network</div>
          </div>
        </div>

        <nav className="desktop-sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              className={`desktop-nav-item ${view === id ? 'active' : ''}`}
              onClick={() => setView(id)}
              aria-label={label}
              aria-current={view === id ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="desktop-sidebar-footer">
          {user ? (
            <div className="desktop-user-card">
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-tier">{user.tier || 'Explorer'}</span>
              </div>
            </div>
          ) : (
            <button className="desktop-sidebar-login" onClick={onOpenLogin || onShowLanding}>
              <LogIn size={18} />
              <span>Log In</span>
            </button>
          )}
        </div>
      </aside>

      <div className="desktop-app-content">
        {!selected && showSearchFilter && (
          <header className="desktop-app-topbar">
            <div className="search-box desktop-search-box">
              <Search size={16} color="var(--text-muted)" />
              <input
                id="cafe-search"
                placeholder="Search cafés, barangay, or vibe…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="desktop-topbar-actions">
              <button
                className={`desktop-filter-btn ${activeFilters.length > 0 ? 'has-filters' : ''}`}
                onClick={() => setFilterOpen(o => !o)}
                aria-label="Toggle filters"
              >
                <Filter size={16} />
                {activeFilters.length > 0 && (
                  <span className="filter-count">{activeFilters.length}</span>
                )}
                <span>Filters</span>
              </button>

              <div className="desktop-header-divider" />

              <button
                onClick={onToggleTheme}
                className="desktop-icon-btn"
                title="Toggle Theme (Light / Dark)"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
              </button>

              <button
                onClick={onOpenNotifications}
                className="desktop-icon-btn notification-btn"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span className="notification-dot" />
              </button>

              <button
                onClick={onOpenCreatePost}
                className="desktop-create-post-btn"
                title="Create Coffee Review"
              >
                <PlusCircle size={16} />
                <span>New Review</span>
              </button>

              <span className="desktop-shortcut-hint" title="Press ⌘K or / to search">
                ⌘K
              </span>
            </div>
          </header>
        )}

        {!selected && showSearchFilter && filterOpen && (
          <div className="desktop-filter-bar">
            {Object.entries(AMENITY_META).map(([k, { icon: Icon, label }]) => {
              const active = activeFilters.includes(k);
              return (
                <button
                  key={k}
                  className={`filter-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleFilter(k)}
                  aria-pressed={active}
                >
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>
        )}

        <main className="desktop-main-area" id="main-content">
          {children}
        </main>
      </div>

      {toast && <div className="toast desktop-toast" role="status">{toast}</div>}
    </div>
  );
}

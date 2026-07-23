import { useState } from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, Star, MapPin,
  Coffee, Sparkles, Send, X, PlusCircle, CheckCircle, Flame, Award, ChevronRight
} from 'lucide-react';
import { STORIES } from '../data/socialData.js';

export default function FeedView({
  posts,
  onLikePost,
  onSavePost,
  onAddComment,
  onOpenCreatePost,
  onSelectCafe
}) {
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [activeStory, setActiveStory] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleShare = (post) => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast(`🔗 Link copied to clipboard! Share ${post.drinkName}`);
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(postId, commentText.trim());
    setCommentText('');
    showToast('💬 Comment added!');
  };

  const activePost = posts.find(p => p.id === activeCommentsPostId);

  return (
    <div className="feed-layout-container">
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'var(--pine)',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 'var(--r-full)',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-lg)'
        }}>
          {toastMessage}
        </div>
      )}

      <div className="feed-layout-inner">
        {/* Stories Carousel */}
        <div className="story-strip">
          {/* Create Post Story Action */}
          <button onClick={onOpenCreatePost} className="story-btn">
            <div className="story-ring check-in">
              <PlusCircle size={26} />
            </div>
            <span className="story-label">Check In</span>
          </button>

          {STORIES.map(story => (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="story-btn"
            >
              <div className={`story-ring ${story.hasUnseen ? 'active' : 'inactive'}`}>
                <img src={story.image} alt={story.title} className="story-avatar" />
              </div>
              <span className="story-label">{story.user.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* ── Weekly Highlights Section: Coffee & Cafe of the Week ── */}
        <div className="weekly-highlights-section" role="region" aria-label="Weekly Highlights">
          <div className="weekly-highlights-header">
            <div className="weekly-header-title">
              <Sparkles size={18} color="var(--amber)" />
              <span>Weekly Highlights</span>
            </div>
            <span className="weekly-tag">THIS WEEK'S BEST</span>
          </div>

          <div className="weekly-cards-grid">
            {/* Coffee of the Week Card */}
            <div className="weekly-card coffee-card">
              <div className="weekly-card-badge">
                <Coffee size={13} />
                <span>Coffee of the Week</span>
              </div>
              <div className="weekly-card-image-wrap">
                <img 
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" 
                  alt="Spanish Latte Supreme" 
                  className="weekly-card-img" 
                />
                <span className="weekly-rating-chip">★ 4.9 (142 reviews)</span>
              </div>
              <div className="weekly-card-body">
                <h4 className="weekly-item-name">Spanish Latte Supreme</h4>
                <p className="weekly-item-cafe">by Malaybalay City Coffee (MC2)</p>
                <div className="weekly-item-desc">
                  Rich double espresso infused with condensed milk & silky steamed Bukidnon highlands milk.
                </div>
                <div className="weekly-card-footer">
                  <span className="weekly-votes-count">🔥 486 Votes</span>
                  <button 
                    className="weekly-card-btn"
                    onClick={() => onSelectCafe?.('c7')}
                  >
                    <span>Explore Café</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Cafe of the Week Card */}
            <div className="weekly-card cafe-card">
              <div className="weekly-card-badge cafe">
                <Award size={13} />
                <span>Café of the Week</span>
              </div>
              <div className="weekly-card-image-wrap">
                <img 
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400" 
                  alt="Coffee Wagon & Roastery" 
                  className="weekly-card-img" 
                />
                <span className="weekly-rating-chip">★ 4.8 (156 reviews)</span>
              </div>
              <div className="weekly-card-body">
                <h4 className="weekly-item-name">Coffee Wagon & Roastery</h4>
                <p className="weekly-item-cafe">📍 Poblacion, Malaybalay City</p>
                <div className="weekly-item-desc">
                  Specialty micro-roastery serving fresh single-origin Bukidnon beans & cozy drive-by lounge.
                </div>
                <div className="weekly-card-footer">
                  <span className="weekly-votes-count">⭐ 320 Check-ins</span>
                  <button 
                    className="weekly-card-btn"
                    onClick={() => onSelectCafe?.('c8')}
                  >
                    <span>View Café</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed Posts */}
        <div className="feed-posts-container">
          {posts.map(post => (
            <article key={post.id} className="feed-post-card">
              {/* Post Header */}
              <div className="feed-post-header">
                <div className="feed-post-header-left">
                  <img src={post.user.avatar} alt={post.user.name} className="feed-post-avatar" />
                  <div>
                    <div className="feed-post-user">
                      {post.user.name}
                      <span className="feed-post-username">@{post.user.username}</span>
                    </div>
                    <button className="feed-post-location" onClick={() => onSelectCafe(post.cafeId)}>
                      <MapPin size={12} /> {post.cafeName}
                    </button>
                  </div>
                </div>
                <span className="feed-post-time">{post.timestamp}</span>
              </div>

              {/* Post Image Container */}
              <div className="feed-post-image-wrap">
                <img src={post.image} alt={post.drinkName} className="feed-post-image" />
                
                <div className="feed-post-badge">
                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> {post.rating}
                </div>

                {post.beanRoast && (
                  <div className="feed-post-badge-roast">
                    <Coffee size={12} /> {post.beanRoast}
                  </div>
                )}
              </div>

              {/* Post Details & Tasting Profile */}
              <div className="feed-post-content">
                
                {/* Action Buttons */}
                <div className="feed-post-actions">
                  <div className="feed-action-group">
                    <button onClick={() => onLikePost(post.id)} className={`feed-action-btn ${post.isLiked ? 'liked' : ''}`}>
                      <Heart size={24} fill={post.isLiked ? '#e11d48' : 'none'} />
                      <span className="feed-action-count">{post.likesCount}</span>
                    </button>
                    <button onClick={() => setActiveCommentsPostId(post.id)} className="feed-action-btn">
                      <MessageCircle size={24} />
                      <span className="feed-action-count">{post.commentsCount}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="feed-action-btn">
                      <Share2 size={23} />
                    </button>
                  </div>
                  <button onClick={() => onSavePost(post.id)} className={`feed-action-btn ${post.isSaved ? 'saved' : ''}`}>
                    <Bookmark size={24} fill={post.isSaved ? 'var(--amber)' : 'none'} />
                  </button>
                </div>

                {/* Drink Title */}
                <h3 className="feed-post-title">{post.drinkName}</h3>

                {/* Tasting Notes Tags */}
                <div className="feed-tags-row">
                  {post.tastingNotes.map((note, idx) => (
                    <span key={idx} className="feed-tag">🍃 {note}</span>
                  ))}
                </div>

                {/* Caption */}
                <p className="feed-post-caption">
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: 6 }}>{post.user.username}</span>
                  {post.caption}
                </p>

                {/* Minimal Flavor Profile Sliders */}
                <div className="feed-flavor-mini">
                  <div className="flavor-mini-col">
                    <div className="flavor-mini-label">Acidity</div>
                    <div className="flavor-mini-track">
                      <div className="flavor-mini-fill fill-acidity" style={{ width: `${(post.acidity / 5) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flavor-mini-col">
                    <div className="flavor-mini-label">Body</div>
                    <div className="flavor-mini-track">
                      <div className="flavor-mini-fill fill-body" style={{ width: `${(post.body / 5) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flavor-mini-col">
                    <div className="flavor-mini-label">Sweetness</div>
                    <div className="flavor-mini-track">
                      <div className="flavor-mini-fill fill-sweetness" style={{ width: `${(post.sweetness / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Comments Drawer Modal */}
      {activePost && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '430px',
            maxHeight: '75vh',
            background: 'var(--bg-card)',
            borderTopLeftRadius: 'var(--r-xl)',
            borderTopRightRadius: 'var(--r-xl)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.25s ease-out'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>Comments ({activePost.comments.length})</div>
              <button onClick={() => setActiveCommentsPostId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activePost.comments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: '20px 0' }}>No comments yet. Be the first to comment!</p>
              ) : (
                activePost.comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                    <img src={c.user.avatar} alt={c.user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{c.user.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>{c.time}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => handleCommentSubmit(e, activePost.id)} style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add a tasting note or comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-full)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <button type="submit" style={{ background: 'var(--pine)', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div
          onClick={() => setActiveStory(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px', height: '80vh', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <img src={activeStory.image} alt={activeStory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={activeStory.user.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <div>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{activeStory.user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{activeStory.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

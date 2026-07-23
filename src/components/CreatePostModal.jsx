import { useState } from 'react';
import { X, Camera, Star, Coffee, MapPin, Sparkles } from 'lucide-react';

export default function CreatePostModal({ cafes, onClose, onSubmitPost }) {
  const [drinkName, setDrinkName] = useState('');
  const [cafeId, setCafeId] = useState(cafes[0]?.id || 'c7');
  const [rating, setRating] = useState(5);
  const [beanRoast, setBeanRoast] = useState('Light Roast');
  const [caption, setCaption] = useState('');
  const [notesInput, setNotesInput] = useState('Jasmine, Peach, Honey');
  const [acidity, setAcidity] = useState(4);
  const [body, setBody] = useState(3);
  const [sweetness, setSweetness] = useState(4);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80');

  const SAMPLE_IMAGES = [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const selCafe = cafes.find(c => c.id === cafeId);
    const newPost = {
      id: 'p_' + Date.now(),
      cafeId,
      cafeName: selCafe?.name || 'Local Specialty Café',
      location: selCafe?.barangay || 'Malaybalay',
      image: imageUrl,
      drinkName: drinkName || 'Specialty Coffee Brew',
      beanRoast,
      rating: Number(rating),
      tastingNotes: notesInput.split(',').map(s => s.trim()).filter(Boolean),
      acidity: Number(acidity),
      body: Number(body),
      sweetness: Number(sweetness),
      caption: caption || 'Enjoyed a fresh brew at ' + (selCafe?.name || 'my favorite spot!'),
      likesCount: 1,
      commentsCount: 0,
      isLiked: true,
      isSaved: false,
      timestamp: 'Just now',
      comments: []
    };

    onSubmitPost(newPost);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        maxHeight: '90vh',
        background: 'var(--bg-card)',
        borderTopLeftRadius: 'var(--r-xl)',
        borderTopRightRadius: 'var(--r-xl)',
        overflowY: 'auto',
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
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card)',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coffee size={18} color="var(--pine)" /> Share Coffee Experience
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo Picker */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Select Photo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {SAMPLE_IMAGES.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImageUrl(img)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: imageUrl === img ? '3px solid var(--pine)' : '2px solid transparent'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Drink Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Drink or Bean Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. V60 Ethiopian Yirgacheffe"
              value={drinkName}
              onChange={e => setDrinkName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--line)',
                background: 'var(--bg-elevated)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Café Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Coffee Shop / Roastery
            </label>
            <select
              value={cafeId}
              onChange={e => setCafeId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--line)',
                background: 'var(--bg-elevated)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              {cafes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.barangay})</option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Rating
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--line)',
                    background: rating === num ? 'var(--pine)' : 'var(--bg-elevated)',
                    color: rating === num ? '#fff' : 'var(--text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Star size={14} fill={rating === num ? '#fff' : 'none'} /> {num}
                </button>
              ))}
            </div>
          </div>

          {/* Tasting Notes */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Tasting Notes (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Jasmine, Peach, Honey Sweetness"
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--line)',
                background: 'var(--bg-elevated)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Tasting Profile Sliders */}
          <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Flavor Profile Sliders</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Acidity</span>
                <span>{acidity} / 5</span>
              </div>
              <input type="range" min="1" max="5" value={acidity} onChange={e => setAcidity(e.target.value)} style={{ width: '100%', accentColor: 'var(--amber)' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Body / Mouthfeel</span>
                <span>{body} / 5</span>
              </div>
              <input type="range" min="1" max="5" value={body} onChange={e => setBody(e.target.value)} style={{ width: '100%', accentColor: 'var(--pine)' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Sweetness</span>
                <span>{sweetness} / 5</span>
              </div>
              <input type="range" min="1" max="5" value={sweetness} onChange={e => setSweetness(e.target.value)} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Review / Caption
            </label>
            <textarea
              rows={3}
              placeholder="Tell the coffee community about the extraction, aroma, or ambiance..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--line)',
                background: 'var(--bg-elevated)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--r-full)',
              background: 'var(--pine)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Post to Feed & Stamp Passport
          </button>
        </form>
      </div>
    </div>
  );
}

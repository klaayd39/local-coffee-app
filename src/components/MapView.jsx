import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, X, Search, LocateFixed } from 'lucide-react';

// Default Location (Malaybalay City Center)
const DEFAULT_LOCATION = { lat: 8.1575, lng: 125.1248, name: "Malaybalay City Center" };

// Component to control map viewport declaratively
function MapController({ center, zoom, bounds, locateTrigger, selectedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        animate: true,
        duration: 0.8
      });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 0.6, easeLinearity: 0.25 });
    } else if (locateTrigger > 0) {
      map.flyTo(center, zoom || 15, { animate: true, duration: 0.6 });
    }
  }, [selectedLocation, bounds, locateTrigger, map]);
  return null;
}

export default function MapView({ cafes, onSelect, selectedId }) {
  const [userLoc, setUserLoc] = useState(DEFAULT_LOCATION);
  const [activeRoute, setActiveRoute] = useState(null); // { cafe, steps, dist, estTime, geometry }
  const [searchQuery, setSearchQuery] = useState('');
  const [mapBounds, setMapBounds] = useState(null);
  const [locateTrigger, setLocateTrigger] = useState(1);

  // Initialize Geolocation Tracking
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      // Request high accuracy real-time position updates
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            name: "Your Location"
          });
        },
        (err) => console.warn('Geolocation error:', err),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000
        }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleLocateMe = () => {
    setMapBounds(null);
    setLocateTrigger(prev => prev + 1);
  };

  // Fetch OSRM Route Geometry
  const fetchRoute = async (cafe) => {
    if (!cafe) {
      setActiveRoute(null);
      setMapBounds(null);
      return;
    }
    
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${cafe.lng},${cafe.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM geojson coordinates are [lng, lat], Leaflet needs [lat, lng]
        const geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setActiveRoute({
          cafe,
          geometry,
          dist: (route.distance / 1000).toFixed(1), // km
          estTime: Math.ceil(route.duration / 60) + " mins", // mins
          steps: [
            `Head towards ${cafe.barangay}`,
            `Follow route for ${(route.distance / 1000).toFixed(1)} km`,
            `Arrive at ${cafe.name}`
          ]
        });

        // Fit map bounds to show full route
        const bounds = L.latLngBounds([userLoc, [cafe.lat, cafe.lng]]);
        setMapBounds(bounds);
      }
    } catch (e) {
      console.error("OSRM Routing Error", e);
      // Fallback to straight line if API fails
      setActiveRoute({
        cafe,
        geometry: [[userLoc.lat, userLoc.lng], [cafe.lat, cafe.lng]],
        dist: cafe.distance_km,
        estTime: `${Math.ceil(cafe.distance_km * 3 + 2)} mins`,
        steps: [`Head towards ${cafe.name}`]
      });
      setMapBounds(L.latLngBounds([userLoc, [cafe.lat, cafe.lng]]));
    }
  };

  // React to selection changes
  useEffect(() => {
    if (selectedId) {
      const cafe = cafes.find(c => c.id === selectedId);
      if (cafe) fetchRoute(cafe);
    } else {
      setActiveRoute(null);
      setMapBounds(null);
    }
  }, [selectedId]); // Don't re-fetch on minor userLoc drifts to prevent UI thrashing

  const userIcon = L.divIcon({
    className: 'user-location-pin',
    html: `
      <div style="width: 18px; height: 18px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(37,99,235,0.6); position: relative;">
        <div style="position: absolute; inset: -5px; border-radius: 50%; border: 2px solid #2563eb; animation: pulse-ring 1.5s infinite;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const getCafeIcon = (c) => {
    const isSel = c.id === selectedId;
    const isDimmed = selectedId && !isSel;
    return L.divIcon({
      className: `map-pin ${isSel ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`,
      html: `
        <div class="map-pin-bubble" style="background: linear-gradient(135deg, ${c.accent}, ${c.accent2});">
          <span style="font-size: ${isSel ? '16px' : '13px'}; font-style: normal;">${c.emoji}</span>
        </div>
        ${isSel ? `<span class="pin-label">${c.name}</span>` : ''}
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50]
    });
  };

  const selectedCafe = cafes.find(c => c.id === selectedId);

  return (
    <div className="map-container">
      <div className="map-wrap">
        
        {/* Floating Search Overlay */}
        <div className="map-search-overlay">
          <div className="map-search-input">
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search cafes or locations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '0 4px' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <div className="map-search-results" style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              padding: '6px'
            }}>
              {cafes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.barangay.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    onSelect(c.id);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={16} color="var(--amber)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.barangay} • {c.distance_km} km away</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locate Me FAB */}
        <button 
          className="locate-me-fab"
          aria-label="Locate Me"
          onClick={handleLocateMe}
        >
          <LocateFixed size={20} />
        </button>

        {/* React Leaflet Map */}
        <MapContainer 
          center={[userLoc.lat, userLoc.lng]} 
          zoom={14} 
          style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
          <MapController 
            center={[userLoc.lat, userLoc.lng]} 
            zoom={15} 
            bounds={mapBounds} 
            locateTrigger={locateTrigger} 
            selectedLocation={selectedCafe ? { lat: selectedCafe.lat, lng: selectedCafe.lng } : null}
          />

          {/* User Location */}
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon} />

          {/* Cafe Markers */}
          {cafes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
            <Marker 
              key={c.id} 
              position={[c.lat, c.lng]} 
              icon={getCafeIcon(c)}
              eventHandlers={{ click: () => onSelect(c.id) }}
            />
          ))}

          {/* Route Polyline (OSRM Path) */}
          {activeRoute && activeRoute.geometry && (
            <Polyline 
              positions={activeRoute.geometry}
              pathOptions={{ color: '#476856', weight: 5, opacity: 0.9, dashArray: '8, 8', lineCap: 'round' }}
            />
          )}
        </MapContainer>
      </div>

      {/* BOTTOM SHEET DRAWER FOR ROUTE DIRECTIONS */}
      <div className={`bottom-sheet-overlay ${activeRoute ? 'active' : ''}`} onClick={() => onSelect(null)} />
      <div className={`bottom-sheet-drawer ${activeRoute ? 'active' : ''}`} role="dialog" aria-modal="true" aria-label="Route Directions">
        <div className="sheet-handle" />
        
        {activeRoute && (
          <div style={{ padding: '0 20px 24px' }}>
            {/* Header: Cafe Name & Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${activeRoute.cafe.accent || '#8C5A3C'}, ${activeRoute.cafe.accent2 || '#4A3222'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {activeRoute.cafe.emoji || '☕'}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {activeRoute.cafe.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍 {activeRoute.cafe.barangay}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--amber)', fontWeight: 600 }}>⭐ {activeRoute.cafe.rating || 4.8}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelect(null)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                aria-label="Close directions"
              >
                <X size={16} />
              </button>
            </div>

            {/* Travel Time & Distance Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)',
              padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '14px'
            }}>
              <div style={{ background: 'var(--pine-glow)', padding: '8px', borderRadius: '50%', color: 'var(--pine-light)', display: 'flex' }}>
                <Navigation size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeRoute.estTime} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>({activeRoute.dist} km)</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optimal route via Sayre Highway</div>
              </div>
            </div>

            {/* Turn by turn directions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                Directions
              </div>
              {activeRoute.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'var(--pine-glow)', color: 'var(--pine-light)',
                    fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ marginTop: '1px' }}>{step}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => onSelect(null)}
              style={{
                width: '100%', marginTop: '16px', padding: '12px', borderRadius: 'var(--r-full)',
                background: 'var(--pine)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none',
                boxShadow: '0 4px 12px rgba(42,36,33,0.3)', cursor: 'pointer'
              }}
            >
              Start Navigation
            </button>
          </div>
        )}
      </div>

      {/* Horizontal café strip below map */}
      <div className="map-list-strip" role="list" aria-label="Cafes nearby">
        {cafes.map(c => (
          <button 
            key={c.id} 
            className={`strip-card ${selectedId === c.id ? 'active' : ''}`} 
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(c.id)}
            role="listitem"
            aria-pressed={selectedId === c.id}
            aria-label={`Select ${c.name}, ${c.distance_km} kilometers away`}
          >
            <span className="strip-dot" style={{ background: c.accent }} />
            <span style={{ fontWeight: 600, fontSize: '12px' }}>{c.name}</span>
            <span className="strip-dist">{c.distance_km}km</span>
          </button>
        ))}
      </div>

      {/* Nearby recommendations */}
      <div className="nearby-section">
        <div className="section-label">
          <MapPin size={11} />
          Closest to you
        </div>
        <div className="nearby-strip" role="list">
          {[...cafes].sort((a, b) => a.distance_km - b.distance_km).slice(0, 4).map(c => (
            <div 
              key={c.id} 
              className="nearby-card" 
              onClick={() => onSelect(c.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(c.id)}
              role="button" 
              tabIndex={0}
              aria-label={`Select nearby cafe: ${c.name}`}
            >
              <div
                className="nearby-thumb"
                style={{ background: `linear-gradient(135deg, ${c.accent}33, ${c.accent2}55)` }}
              >
                <span style={{ fontSize: '28px' }}>{c.emoji}</span>
              </div>
              <div className="nearby-info">
                <div className="nearby-name">{c.name}</div>
                <div className="nearby-dist">📍 {c.distance_km} km away</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

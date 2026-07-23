import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ChevronRight, X } from 'lucide-react';

export default function DesktopMapView({ cafes, onSelect, selectedId }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [userLoc, setUserLoc] = useState({ lat: 8.1575, lng: 125.1248, name: "Your Location" });
  const [activeRoute, setActiveRoute] = useState(null);

  // Initialize Geolocation Tracking
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            name: "Your Location"
          });
        },
        (err) => console.warn('Desktop Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const lats = cafes.map(c => c.lat);
  const lngs = cafes.map(c => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const pos = (c) => ({
    left: `${((c.lng - minLng) / (maxLng - minLng || 1)) * 76 + 10}%`,
    top:  `${(1 - (c.lat - minLat) / (maxLat - minLat || 1)) * 68 + 10}%`,
  });

  const sorted = [...cafes].sort((a, b) => a.distance_km - b.distance_km);

  const drawRouteToCafe = (cafe) => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    if (polylineRef.current) polylineRef.current.remove();
    if (userMarkerRef.current) userMarkerRef.current.remove();

    if (!cafe) {
      setActiveRoute(null);
      return;
    }

    const userIcon = window.L.divIcon({
      className: 'user-location-pin',
      html: `
        <div style="width: 22px; height: 22px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(37,99,235,0.6); position: relative;">
          <div style="position: absolute; inset: -6px; border-radius: 50%; border: 2px solid #2563eb; animation: pulse-ring 1.5s infinite;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    userMarkerRef.current = window.L.marker([userLoc.lat, userLoc.lng], { icon: userIcon }).addTo(map);

    const latlngs = [
      [userLoc.lat, userLoc.lng],
      [(userLoc.lat + cafe.lat) / 2 + 0.001, (userLoc.lng + cafe.lng) / 2 - 0.001],
      [cafe.lat, cafe.lng]
    ];

    polylineRef.current = window.L.polyline(latlngs, {
      color: '#476856',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    const bounds = window.L.latLngBounds([
      [userLoc.lat, userLoc.lng],
      [cafe.lat, cafe.lng]
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });

    const steps = [
      `Head north on Sayre Highway towards ${cafe.barangay}`,
      `Turn right onto Fortich St / ${cafe.name} Entrance`,
      `Arrive at ${cafe.name} (${cafe.distance_km} km)`
    ];

    setActiveRoute({
      cafe,
      steps,
      dist: cafe.distance_km,
      estTime: `${Math.ceil(cafe.distance_km * 3 + 2)} mins`
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (window.L && !mapInstanceRef.current) {
      try {
        const centerLat = 8.163;
        const centerLng = 125.128;
        const map = window.L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([centerLat, centerLng], 13);

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        window.L.control.zoom({ position: 'topright' }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Desktop Leaflet initialization error:', err);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    cafes.forEach(c => {
      const isSel = c.id === selectedId;
      const customIcon = window.L.divIcon({
        className: `map-pin ${isSel ? 'active' : ''}`,
        html: `
          <div class="map-pin-bubble" style="background: linear-gradient(135deg, ${c.accent}, ${c.accent2});">
            <span style="font-size: ${isSel ? '16px' : '13px'}; font-style: normal;">${c.emoji}</span>
          </div>
          ${isSel ? `<span class="pin-label">${c.name}</span>` : ''}
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50]
      });

      const marker = window.L.marker([c.lat, c.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        onSelect(c.id);
        drawRouteToCafe(c);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([c.lat, c.lng], 16, { animate: true, duration: 0.8 });
        }
      });
      markersRef.current[c.id] = marker;
    });

    if (selectedId && cafes.find(c => c.id === selectedId)) {
      const selCafe = cafes.find(c => c.id === selectedId);
      drawRouteToCafe(selCafe);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([selCafe.lat, selCafe.lng], 16, { animate: true, duration: 0.8 });
      }
    } else if (!selectedId) {
      if (polylineRef.current) polylineRef.current.remove();
      if (userMarkerRef.current) userMarkerRef.current.remove();
      setActiveRoute(null);
    }
  }, [cafes, selectedId]);

  return (
    <div className="desktop-map-layout">
      <div className="desktop-map-panel">
        <div className="map-wrap desktop-map-wrap" style={{ position: 'relative' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />

          <div className="map-label" style={{ zIndex: 500, pointerEvents: 'none' }}>
            📍 Live In-App Navigation · Malaybalay City
          </div>
        </div>

        {/* IN-APP ROUTE & DIRECTIONS PANEL FOR DESKTOP */}
        {activeRoute && (
          <div style={{
            margin: '12px 0 0 0',
            background: 'var(--bg-card)',
            border: '1px solid var(--pine)',
            borderRadius: 'var(--r-md)',
            padding: 14,
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setActiveRoute(null);
                if (polylineRef.current) polylineRef.current.remove();
                if (userMarkerRef.current) userMarkerRef.current.remove();
              }}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Navigation size={18} color="var(--pine-light)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Native Directions to {activeRoute.cafe.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  📍 {activeRoute.dist} km · ~{activeRoute.estTime} drive/walk
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
              {activeRoute.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--pine-glow)', color: 'var(--pine-light)',
                    fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="desktop-map-chips">
          {cafes.map(c => (
            <button
              key={c.id}
              className={`strip-card ${selectedId === c.id ? 'active' : ''}`}
              onClick={() => {
                onSelect(c.id);
                drawRouteToCafe(c);
              }}
            >
              <span className="strip-dot" style={{ background: c.accent }} />
              <span style={{ fontWeight: 600, fontSize: 12 }}>{c.name}</span>
              <span className="strip-dist">{c.distance_km}km</span>
            </button>
          ))}
        </div>
      </div>

      <aside className="desktop-map-sidebar">
        <div className="desktop-sidebar-header">
          <MapPin size={14} />
          <span>Closest to you</span>
          <span className="desktop-sidebar-count">{cafes.length} cafés</span>
        </div>

        <div className="desktop-cafe-list">
          {sorted.map(c => (
            <button
              key={c.id}
              className={`desktop-cafe-list-item ${selectedId === c.id ? 'active' : ''}`}
              onClick={() => {
                onSelect(c.id);
                drawRouteToCafe(c);
              }}
            >
              <div
                className="desktop-cafe-list-thumb"
                style={{ background: `linear-gradient(135deg, ${c.accent}33, ${c.accent2}55)` }}
              >
                <span style={{ fontSize: 24 }}>{c.emoji}</span>
              </div>
              <div className="desktop-cafe-list-info">
                <div className="desktop-cafe-list-name">{c.name}</div>
                <div className="desktop-cafe-list-meta">
                  <span>{c.barangay}</span>
                  <span>·</span>
                  <span>{c.distance_km} km</span>
                </div>
                <div className="desktop-cafe-list-tagline">{c.tagline}</div>
              </div>
              <ChevronRight size={16} className="desktop-cafe-list-arrow" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, X, Search, LocateFixed, ArrowUp, ArrowUpRight, ArrowUpLeft, Flag, Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react';

// Default Location (Malaybalay City Center)
const DEFAULT_LOCATION = { lat: 8.1575, lng: 125.1248, name: "Malaybalay City Center" };

// Component to control map viewport declaratively
function MapController({ center, zoom, bounds, locateTrigger, selectedLocation, navigationLocation }) {
  const map = useMap();
  useEffect(() => {
    if (navigationLocation) {
      map.setView([navigationLocation.lat, navigationLocation.lng], 18, {
        animate: true,
        duration: 0.5
      });
    } else if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        animate: true,
        duration: 0.8
      });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 0.6, easeLinearity: 0.25 });
    } else if (locateTrigger > 0) {
      map.flyTo(center, zoom || 15, { animate: true, duration: 0.6 });
    }
  }, [selectedLocation, bounds, locateTrigger, navigationLocation, map]);
  return null;
}

export default function MapView({ cafes, onSelect, selectedId }) {
  const [userLoc, setUserLoc] = useState(DEFAULT_LOCATION);
  const [activeRoute, setActiveRoute] = useState(null); // { cafe, steps, dist, estTime, geometry }
  const [searchQuery, setSearchQuery] = useState('');
  const [mapBounds, setMapBounds] = useState(null);
  const [locateTrigger, setLocateTrigger] = useState(1);

  // Navigation states
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgressIndex, setNavProgressIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(2);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const lastSpokenTextRef = useRef('');

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

  // Geolocation math helpers
  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Text-To-Speech function
  const speakMessage = (text) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get active instruction text and icon based on progress percent
  const getNavigationStep = (progress, cafe) => {
    if (!cafe) return { text: '', icon: 'straight' };
    if (progress >= 100) return { text: `You have arrived at ${cafe.name}`, icon: 'flag' };
    if (progress >= 90) return { text: `Your destination ${cafe.name} is ahead on the right`, icon: 'arrive' };
    if (progress >= 65) return { text: `Prepare to turn towards ${cafe.name}`, icon: 'turn-right' };
    if (progress >= 35) return { text: `Continue straight on Sayre Highway`, icon: 'straight' };
    return { text: `Head towards ${cafe.barangay || 'the cafe'}`, icon: 'straight' };
  };

  // Calculate current progress percentage along the route
  const getProgressPercent = () => {
    if (!activeRoute || !activeRoute.geometry || activeRoute.geometry.length <= 1) return 0;
    return Math.min(100, Math.round((navProgressIndex / (activeRoute.geometry.length - 1)) * 100));
  };

  // Dynamic remaining metrics calculations
  const getRemainingMetrics = () => {
    if (!activeRoute || !activeRoute.geometry || activeRoute.geometry.length === 0) {
      return { dist: '0.0', time: '0 mins' };
    }

    if (!isNavigating) {
      return { dist: activeRoute.dist, time: activeRoute.estTime };
    }

    let remainingDist = 0;

    // First, from current position to next point
    if (navProgressIndex < activeRoute.geometry.length) {
      const nextPt = activeRoute.geometry[navProgressIndex];
      remainingDist += getDistanceKm(userLoc.lat, userLoc.lng, nextPt[0], nextPt[1]);
    }

    // Rest of segments
    for (let i = navProgressIndex; i < activeRoute.geometry.length - 1; i++) {
      remainingDist += getDistanceKm(
        activeRoute.geometry[i][0], activeRoute.geometry[i][1],
        activeRoute.geometry[i + 1][0], activeRoute.geometry[i + 1][1]
      );
    }

    const ratio = activeRoute.originalDistKm > 0 ? (remainingDist / activeRoute.originalDistKm) : 0;
    const remainingSecs = Math.max(0, Math.round(ratio * activeRoute.originalDurationSecs));
    const mins = Math.max(1, Math.ceil(remainingSecs / 60));

    return {
      dist: remainingDist.toFixed(1),
      time: mins === 1 ? "1 min" : `${mins} mins`
    };
  };

  // Handle active navigation speech triggers
  useEffect(() => {
    if (isNavigating && activeRoute && activeRoute.cafe) {
      lastSpokenTextRef.current = '';
      speakMessage(`Starting navigation to ${activeRoute.cafe.name}. Head towards ${activeRoute.cafe.barangay || 'your destination'}.`);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isNavigating]);

  // Voice announcement trigger when step text updates
  useEffect(() => {
    if (isNavigating && activeRoute && activeRoute.cafe) {
      const progress = getProgressPercent();
      const stepInfo = getNavigationStep(progress, activeRoute.cafe);
      if (progress > 0 && stepInfo.text && stepInfo.text !== lastSpokenTextRef.current) {
        speakMessage(stepInfo.text);
        lastSpokenTextRef.current = stepInfo.text;
      }
    }
  }, [isNavigating, navProgressIndex, activeRoute]);

  // Simulation Progression Timer
  useEffect(() => {
    let timer;
    if (isNavigating && isSimulating && activeRoute && activeRoute.geometry) {
      timer = setInterval(() => {
        setNavProgressIndex((prevIndex) => {
          if (prevIndex < activeRoute.geometry.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(timer);
            setIsSimulating(false);
            return prevIndex;
          }
        });
      }, 1000 / simSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isNavigating, isSimulating, activeRoute, simSpeed]);

  // Update user marker position during simulation
  useEffect(() => {
    if (isNavigating && activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0) {
      const currentCoord = activeRoute.geometry[navProgressIndex];
      if (currentCoord) {
        setUserLoc({
          lat: currentCoord[0],
          lng: currentCoord[1],
          name: "Your Location"
        });
      }
    }
  }, [isNavigating, navProgressIndex, activeRoute]);

  // Track proximity to find the current active coordinate index in real GPS mode
  useEffect(() => {
    if (isNavigating && !isSimulating && activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0) {
      let minDistance = Infinity;
      let closestIdx = 0;

      activeRoute.geometry.forEach((coord, idx) => {
        const dist = getDistanceKm(userLoc.lat, userLoc.lng, coord[0], coord[1]);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      if (closestIdx !== navProgressIndex) {
        setNavProgressIndex(closestIdx);
      }
    }
  }, [userLoc, isNavigating, isSimulating, activeRoute]);

  const handleLocateMe = () => {
    setMapBounds(null);
    setLocateTrigger(prev => prev + 1);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setNavProgressIndex(0);
    setIsSimulating(true);
    setSimSpeed(2);
  };

  const handleOpenExternalMaps = () => {
    if (!activeRoute || !activeRoute.cafe) return;
    const destLat = activeRoute.cafe.lat;
    const destLng = activeRoute.cafe.lng;
    const userLat = userLoc.lat;
    const userLng = userLoc.lng;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    let url = "";
    if (isIOS) {
      url = `maps://maps.apple.com/?daddr=${destLat},${destLng}&saddr=${userLat},${userLng}&dirflg=d`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
    }
    window.open(url, '_blank');
  };

  const renderTurnIcon = (iconName) => {
    switch (iconName) {
      case 'turn-right':
        return <ArrowUpRight size={24} />;
      case 'turn-left':
        return <ArrowUpLeft size={24} />;
      case 'arrive':
        return <Navigation size={24} style={{ transform: 'rotate(45deg)' }} />;
      case 'flag':
        return <Flag size={24} />;
      case 'straight':
      default:
        return <ArrowUp size={24} />;
    }
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
          originalDistKm: route.distance / 1000,
          originalDurationSecs: route.duration,
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
      const fallbackDist = cafe.distance_km || 1.5;
      setActiveRoute({
        cafe,
        geometry: [[userLoc.lat, userLoc.lng], [cafe.lat, cafe.lng]],
        dist: fallbackDist,
        estTime: `${Math.ceil(fallbackDist * 3 + 2)} mins`,
        originalDistKm: fallbackDist,
        originalDurationSecs: (fallbackDist * 3 + 2) * 60,
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
        {!isNavigating && (
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
        )}

        {/* Locate Me FAB */}
        {!isNavigating && (
          <button
            className="locate-me-fab"
            aria-label="Locate Me"
            onClick={handleLocateMe}
          >
            <LocateFixed size={20} />
          </button>
        )}

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
            navigationLocation={isNavigating ? userLoc : null}
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

        {/* Navigation HUD Overlay */}
        {isNavigating && activeRoute && activeRoute.cafe && (
          <div className="nav-hud-overlay">
            {/* Header: Instruction and Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="nav-hud-step-icon">
                {renderTurnIcon(getNavigationStep(getProgressPercent(), activeRoute.cafe).icon)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--pine-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {getProgressPercent() >= 100 ? 'Arrived' : 'Next Step'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: '1.2' }}>
                  {getNavigationStep(getProgressPercent(), activeRoute.cafe).text}
                </div>
              </div>
            </div>

            {/* Middle: Progress and ETA metrics */}
            <div className="nav-hud-eta-panel">
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>
                  {getRemainingMetrics().time}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  {getRemainingMetrics().dist} km remaining
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${getProgressPercent()}%`, height: '100%', background: 'var(--pine-light)' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--pine-light)' }}>
                  {getProgressPercent()}% completed
                </span>
              </div>
            </div>

            {/* Footer: Controls */}
            <div className="nav-hud-controls">
              {/* Play / Pause simulation */}
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`nav-hud-btn ${isSimulating ? 'primary' : 'secondary'}`}
                title={isSimulating ? "Pause Simulation" : "Start Simulation"}
              >
                {isSimulating ? <Pause size={16} /> : <Play size={16} />}
                <span>{isSimulating ? 'Pause Sim' : 'Play Sim'}</span>
              </button>

              {/* Simulation Speed cycle button */}
              {isSimulating && (
                <button
                  onClick={() => setSimSpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : prev === 5 ? 10 : 1)}
                  className="nav-hud-btn secondary"
                  style={{ maxWidth: '65px' }}
                  title="Change simulation speed"
                >
                  <span>{simSpeed}x</span>
                </button>
              )}

              {/* Voice guidance toggle */}
              <button
                onClick={() => {
                  const newVoice = !voiceEnabled;
                  setVoiceEnabled(newVoice);
                  if (!newVoice && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="nav-hud-btn secondary"
                style={{ maxWidth: '50px' }}
                title={voiceEnabled ? "Mute Voice Guidance" : "Unmute Voice Guidance"}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Open in external Maps (Google Maps / Apple Maps) */}
              <button
                onClick={handleOpenExternalMaps}
                className="nav-hud-btn secondary"
                title="Open in native mapping application"
              >
                <ExternalLink size={16} />
                <span>Open Maps</span>
              </button>

              {/* Quit Navigation */}
              <button
                onClick={() => {
                  setIsNavigating(false);
                  setNavProgressIndex(0);
                  setIsSimulating(false);
                }}
                className="nav-hud-btn danger"
                style={{ maxWidth: '70px' }}
                title="Stop Navigation"
              >
                <span>Exit</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SHEET DRAWER FOR ROUTE DIRECTIONS */}
      {!isNavigating && (
        <>
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
                  onClick={handleStartNavigation}
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
        </>
      )}

      {/* Horizontal café strip below map */}
      {!isNavigating && (
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
      )}

      {/* Nearby recommendations */}
      {!isNavigating && (
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
      )}
    </div>
  );
}

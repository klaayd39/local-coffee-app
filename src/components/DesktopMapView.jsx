import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ChevronRight, X, ArrowUp, ArrowUpRight, ArrowUpLeft, Flag, Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react';

export default function DesktopMapView({ cafes, onSelect, selectedId }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [userLoc, setUserLoc] = useState({ lat: 8.1575, lng: 125.1248, name: "Your Location" });
  const [activeRoute, setActiveRoute] = useState(null);

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

  // Update user marker position and center map during simulation
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

  // Update user marker position on Leaflet instance and pan map
  useEffect(() => {
    if (userMarkerRef.current && mapInstanceRef.current) {
      userMarkerRef.current.setLatLng([userLoc.lat, userLoc.lng]);
      if (isNavigating) {
        mapInstanceRef.current.setView([userLoc.lat, userLoc.lng], 18, { animate: true, duration: 0.5 });
      }
    }
  }, [userLoc, isNavigating]);

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

  const lats = cafes.map(c => c.lat);
  const lngs = cafes.map(c => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const pos = (c) => ({
    left: `${((c.lng - minLng) / (maxLng - minLng || 1)) * 76 + 10}%`,
    top:  `${(1 - (c.lat - minLat) / (maxLat - minLat || 1)) * 68 + 10}%`,
  });

  const sorted = [...cafes].sort((a, b) => a.distance_km - b.distance_km);

  const drawRouteToCafe = async (cafe) => {
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

    let geometry = [];
    let distText = "";
    let durationText = "";
    let originalDistKm = 0;
    let originalDurationSecs = 0;

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${cafe.lng},${cafe.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        geometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        distText = (route.distance / 1000).toFixed(1);
        durationText = Math.ceil(route.duration / 60) + " mins";
        originalDistKm = route.distance / 1000;
        originalDurationSecs = route.duration;
      } else {
        throw new Error("No route found");
      }
    } catch (e) {
      console.warn("OSRM Desktop Routing Error", e);
      // Fallback
      geometry = [
        [userLoc.lat, userLoc.lng],
        [(userLoc.lat + cafe.lat) / 2 + 0.001, (userLoc.lng + cafe.lng) / 2 - 0.001],
        [cafe.lat, cafe.lng]
      ];
      distText = cafe.distance_km;
      durationText = `${Math.ceil(cafe.distance_km * 3 + 2)} mins`;
      originalDistKm = cafe.distance_km || 1.5;
      originalDurationSecs = (originalDistKm * 3 + 2) * 60;
    }

    polylineRef.current = window.L.polyline(geometry, {
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

    setActiveRoute({
      cafe,
      geometry,
      dist: distText,
      estTime: durationText,
      originalDistKm,
      originalDurationSecs,
      steps: [
        `Head north towards ${cafe.barangay}`,
        `Follow optimal path to ${cafe.name} (${distText} km)`,
        `Arrive at ${cafe.name}`
      ]
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

          {!isNavigating && (
            <div className="map-label" style={{ zIndex: 500, pointerEvents: 'none' }}>
              📍 Live In-App Navigation · Malaybalay City
            </div>
          )}

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
            {!isNavigating && (
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
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Navigation size={18} color="var(--pine-light)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isNavigating ? `Navigating to ${activeRoute.cafe.name}` : `Native Directions to ${activeRoute.cafe.name}`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  📍 {getRemainingMetrics().dist} km · ~{getRemainingMetrics().time} remaining
                </div>
              </div>
            </div>

            {!isNavigating && (
              <>
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

                <button 
                  onClick={handleStartNavigation}
                  style={{
                    width: '100%', marginTop: '16px', padding: '12px', borderRadius: 'var(--r-full)',
                    background: 'var(--pine)', color: 'white', fontWeight: 600, fontSize: '13px', border: 'none',
                    boxShadow: '0 4px 12px rgba(42,36,33,0.3)', cursor: 'pointer', fontFamily: 'var(--font-sans)'
                  }}
                >
                  Start Navigation
                </button>
              </>
            )}
          </div>
        )}

        {!isNavigating && (
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
        )}
      </div>

      {!isNavigating && (
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
      )}
    </div>
  );
}

// Calculate distance between two coordinates in kilometers using Haversine formula
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
}

// Calculate the minimum distance (in km) from a user point to a polyline route,
// projecting the user onto the line segments for accurate off-route detection.
export function getMinDistanceToRoute(userLat, userLng, geometry) {
  if (!geometry || geometry.length < 2) return { minDistance: Infinity, closestIdx: 0 };
  
  let minDistance = Infinity;
  let closestIdx = 0;
  
  const sqr = (x) => x * x;

  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = { lat: geometry[i][0], lng: geometry[i][1] };
    const p2 = { lat: geometry[i+1][0], lng: geometry[i+1][1] };
    const p = { lat: userLat, lng: userLng };
    
    // Scale longitude by cos(latitude) for equirectangular approximation
    const cosLat = Math.cos(userLat * Math.PI / 180);
    const p1Proj = { lat: p1.lat, lng: p1.lng * cosLat };
    const p2Proj = { lat: p2.lat, lng: p2.lng * cosLat };
    const pProj = { lat: p.lat, lng: p.lng * cosLat };
    
    const l2 = sqr(p1Proj.lat - p2Proj.lat) + sqr(p1Proj.lng - p2Proj.lng);
    let projPoint = p1;
    if (l2 > 0) {
      let t = ((pProj.lng - p1Proj.lng) * (p2Proj.lng - p1Proj.lng) + (pProj.lat - p1Proj.lat) * (p2Proj.lat - p1Proj.lat)) / l2;
      t = Math.max(0, Math.min(1, t));
      projPoint = {
        lat: p1.lat + t * (p2.lat - p1.lat),
        lng: p1.lng + t * (p2.lng - p1.lng)
      };
    }
    
    const dist = getDistanceKm(userLat, userLng, projPoint.lat, projPoint.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = i; // Store segment index as the progress
    }
  }
  return { minDistance, closestIdx };
}

// Fallback location fetch via IP address when hardware GPS is blocked
export const fetchIpLocation = async () => {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    if (data && data.latitude && data.longitude) {
      return {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        accuracy: 5000, // IP locations are roughly city-level
        name: data.city ? `Your Location (${data.city})` : "Your Location"
      };
    }
    return null;
  } catch (error) {
    console.warn("IP Geolocation fallback failed:", error);
    return null;
  }
};

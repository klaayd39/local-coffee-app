import { Star, Wifi, Zap, BookOpen, PawPrint, Car } from 'lucide-react';

export const AMENITY_META = {
  has_wifi:       { icon: Wifi,      label: "Wi-Fi" },
  has_outlets:    { icon: Zap,       label: "Outlets" },
  has_study_space:{ icon: BookOpen,  label: "Study Space" },
  pet_friendly:   { icon: PawPrint,  label: "Pet-Friendly" },
  has_parking:    { icon: Car,       label: "Parking" },
};

export function RatingStars({ value, size = 13 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(value) ? "#e0a832" : "none"}
          color={i <= Math.round(value) ? "#e0a832" : "#3a4038"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function AmenityChips({ cafe, compact }) {
  const active = Object.keys(AMENITY_META).filter(k => cafe[k]);
  return (
    <div className={`chips ${compact ? 'compact' : ''}`}>
      {active.map(k => {
        const Icon = AMENITY_META[k].icon;
        return (
          <span className="chip" key={k}>
            <Icon size={compact ? 10 : 11} />
            {!compact && <span>{AMENITY_META[k].label}</span>}
          </span>
        );
      })}
    </div>
  );
}

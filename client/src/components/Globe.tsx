import { useMemo } from 'react';

/**
 * Lightweight, dependency-free globe rendering.
 *
 * The production deployment swaps in a tiled satellite renderer behind the same
 * component API. Keeping the default renderer SVG-based means the app builds and
 * runs offline, and the globe stays crisp at every zoom level.
 */
export function Globe({ className = '' }: { className?: string }) {
  const meridians = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 0.5) * 15), []);
  const parallels = useMemo(() => [-60, -30, 0, 30, 60], []);
  const markers = useMemo(
    () => [
      { name: 'Amazon Basin', x: 32, y: 62 },
      { name: 'Arctic Sea Ice', x: 55, y: 14 },
      { name: 'Lagos', x: 52, y: 57 },
      { name: 'Ganges Delta', x: 70, y: 52 },
      { name: 'Great Barrier Reef', x: 84, y: 70 }
    ],
    []
  );

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Interactive globe preview"
      className={`h-full w-full ${className}`}
    >
      <defs>
        <radialGradient id="ocean" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="55%" stopColor="#0f3f9e" />
          <stop offset="100%" stopColor="#061a3f" />
        </radialGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(56,189,248,0.25)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#glow)" />
      <circle cx="50" cy="50" r="38" fill="url(#ocean)" stroke="#38bdf8" strokeOpacity="0.45" strokeWidth="0.4" />

      {parallels.map((lat) => {
        const y = 50 - (lat / 90) * 38;
        const halfWidth = Math.sqrt(Math.max(0, 38 * 38 - (y - 50) * (y - 50)));
        return (
          <line
            key={`p-${lat}`}
            x1={50 - halfWidth}
            y1={y}
            x2={50 + halfWidth}
            y2={y}
            stroke="#7dd3fc"
            strokeOpacity="0.22"
            strokeWidth="0.25"
          />
        );
      })}

      {meridians.map((lon) => {
        const rx = Math.abs(Math.cos((lon * Math.PI) / 180)) * 38;
        return (
          <ellipse
            key={`m-${lon}`}
            cx="50"
            cy="50"
            rx={rx || 0.4}
            ry="38"
            fill="none"
            stroke="#7dd3fc"
            strokeOpacity="0.18"
            strokeWidth="0.25"
          />
        );
      })}

      {markers.map((marker) => (
        <g key={marker.name}>
          <circle cx={marker.x} cy={marker.y} r="1.1" fill="#f472b6" />
          <circle cx={marker.x} cy={marker.y} r="2.4" fill="none" stroke="#f472b6" strokeOpacity="0.45" strokeWidth="0.3" />
        </g>
      ))}
    </svg>
  );
}

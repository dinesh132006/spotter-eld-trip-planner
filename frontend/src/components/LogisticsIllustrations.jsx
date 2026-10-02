import React from 'react';

export function HeroLogisticsGraphic() {
  return (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center p-4 relative overflow-hidden">
      <svg viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[220px]">
        {/* Background Grid Pattern */}
        <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
        </pattern>
        <rect width="600" height="240" fill="url(#hero-grid)" rx="16" />

        {/* Outer Glow Path */}
        <path
          d="M 60 160 Q 180 50, 300 130 T 540 80"
          stroke="#38bdf8"
          strokeWidth="8"
          strokeOpacity="0.2"
          strokeLinecap="round"
        />

        {/* Main Glowing Route Polyline */}
        <path
          d="M 60 160 Q 180 50, 300 130 T 540 80"
          stroke="url(#route-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="6 4"
        />

        <defs>
          <linearGradient id="route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>

        {/* Waypoint 1: Origin (New York) */}
        <g transform="translate(60, 160)">
          <circle r="12" fill="#10b981" fillOpacity="0.2" />
          <circle r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="24" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">NEW YORK</text>
          <text x="0" y="36" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Origin (00:00)</text>
        </g>

        {/* Waypoint 2: Pickup (Chicago) */}
        <g transform="translate(230, 95)">
          <circle r="14" fill="#c084fc" fillOpacity="0.2" />
          <circle r="7" fill="#c084fc" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="-14" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">CHICAGO</text>
          <text x="0" y="-3" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="600" fontFamily="sans-serif">Pickup (1h)</text>
        </g>

        {/* Fuel Badge Node */}
        <g transform="translate(360, 125)">
          <rect x="-24" y="-12" width="48" height="20" rx="10" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="0" y="2" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="700" fontFamily="sans-serif">⛽ FUEL</text>
        </g>

        {/* Rest Badge Node */}
        <g transform="translate(450, 95)">
          <rect x="-24" y="-12" width="48" height="20" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="0" y="2" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="700" fontFamily="sans-serif">🛌 10h REST</text>
        </g>

        {/* Waypoint 3: Dropoff (Los Angeles) */}
        <g transform="translate(540, 80)">
          <circle r="14" fill="#f43f5e" fillOpacity="0.2" />
          <circle r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="24" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">LOS ANGELES</text>
          <text x="0" y="36" textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="600" fontFamily="sans-serif">Dropoff (1h)</text>
        </g>

        {/* Semi Truck Icon graphic moving on route */}
        <g transform="translate(145, 90)">
          <rect x="-14" y="-8" width="22" height="12" rx="2" fill="#38bdf8" />
          <rect x="8" y="-4" width="8" height="8" rx="1" fill="#38bdf8" />
          <circle cx="-8" cy="5" r="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
          <circle cx="2" cy="5" r="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
          <circle cx="11" cy="5" r="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}

export function EmptyStateGraphic() {
  return (
    <div className="w-24 h-24 mx-auto flex items-center justify-center">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-cyan-400">
        <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="4" />
        <path d="M 30 70 L 50 30 L 70 70" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="30" r="6" fill="#10b981" />
        <circle cx="30" cy="70" r="5" fill="#38bdf8" />
        <circle cx="70" cy="70" r="5" fill="#f43f5e" />
      </svg>
    </div>
  );
}

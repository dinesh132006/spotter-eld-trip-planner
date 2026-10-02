import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Compass, Clock, MapPin } from 'lucide-react';

export default function RouteMap({ route, stops, summary }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([39.8283, -98.5795], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }


    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (!route || !route.full_coordinates || route.full_coordinates.length === 0) {
      return;
    }

    const polylineCoords = route.full_coordinates;

    const polyline = L.polyline(polylineCoords, {
      color: '#38bdf8',
      weight: 5,
      opacity: 0.95,
      lineJoin: 'round'
    }).addTo(layerGroup);

    try {
      const bounds = polyline.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      console.warn("Map bounds error:", e);
    }

    const createCustomIcon = (type) => {
      let bgColor = '#38bdf8';
      let iconSymbol = '📍';

      if (type === 'START') {
        bgColor = '#10b981'; // Green
        iconSymbol = '🚀';
      } else if (type === 'PICKUP') {
        bgColor = '#c084fc'; // Purple
        iconSymbol = '📦';
      } else if (type === 'DROPOFF') {
        bgColor = '#f43f5e'; // Red
        iconSymbol = '🏁';
      } else if (type === 'FUEL') {
        bgColor = '#fbbf24'; // Amber
        iconSymbol = '⛽';
      } else if (type === 'REST') {
        bgColor = '#3b82f6'; // Blue
        iconSymbol = '🛌';
      }

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bgColor};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            border: 2px solid #ffffff;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
      });
    };

    if (stops && stops.length > 0) {
      stops.forEach((s) => {
        if (s.coords && s.coords.length === 2 && s.coords[0] !== 0) {
          const marker = L.marker([s.coords[0], s.coords[1]], {
            icon: createCustomIcon(s.type)
          });

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; padding: 2px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #38bdf8;">${s.type} STOP</div>
              <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 2px;">${s.title}</div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 3px;">📍 ${s.location}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">⏰ Time: <strong>${s.time_display}</strong> (${s.duration || 'Arrival'})</div>
              <div style="font-size: 10px; color: #fbbf24; margin-top: 5px; background: rgba(251,191,36,0.1); padding: 3px 6px; border-radius: 4px;">
                💡 ${s.reason || 'Scheduled stop'}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          layerGroup.addLayer(marker);
        }
      });
    }

  }, [route, stops]);

  return (
    <div className="saas-panel p-4 h-full flex flex-col relative overflow-hidden">
      
      {/* Map Header Bar */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Interactive Route Geometry & Stop Map
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/> Start</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/> Pickup</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/> Fuel</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Rest</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/> Dropoff</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full flex-1 min-h-[480px] h-[520px] rounded-lg overflow-hidden relative border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Translucent Map Overlay Box */}
        {summary && (
          <div className="absolute top-3 right-3 z-20 bg-slate-950/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 space-y-1.5 shadow-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Distance: <strong className="text-white font-mono">{summary.total_distance_miles} mi</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Est Duration: <strong className="text-white font-mono">{summary.total_trip_duration_days} Days ({summary.total_trip_duration_hours}h)</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Stops: <strong className="text-white font-mono">{summary.fuel_stops_count + summary.rest_stops_count + 2} Total</strong></span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

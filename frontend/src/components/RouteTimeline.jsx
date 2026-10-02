import React from 'react';
import { Clock, MapPin, Truck, Fuel, Bed, PackageCheck, Package, RefreshCw } from 'lucide-react';

export default function RouteTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  const getEventIcon = (type) => {
    switch (type) {
      case 'START':
      case 'DRIVING':
        return <Truck className="w-4 h-4 text-cyan-400" />;
      case 'PICKUP':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'DROPOFF':
        return <PackageCheck className="w-4 h-4 text-rose-400" />;
      case 'FUELING':
        return <Fuel className="w-4 h-4 text-amber-400" />;
      case 'BREAK_30M':
      case 'REST_10H':
        return <Bed className="w-4 h-4 text-blue-400" />;
      case 'REST_34H_RESTART':
        return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRIVING':
        return <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">DRIVING</span>;
      case 'ON_DUTY_NOT_DRIVING':
        return <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">ON DUTY</span>;
      case 'OFF_DUTY':
        return <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">OFF DUTY</span>;
      case 'SLEEPER_BERTH':
        return <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">SLEEPER</span>;
      default:
        return null;
    }
  };

  const formatMinTo12h = (mins) => {
    const minInDay = mins % 1440;
    const hrs = Math.floor(minInDay / 60);
    const m = minInDay % 60;
    const period = hrs < 12 ? 'AM' : 'PM';
    const displayHr = hrs % 12 === 0 ? 12 : hrs % 12;
    const dayNum = Math.floor(mins / 1440) + 1;
    return {
      time: `${displayHr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`,
      day: `Day ${dayNum}`
    };
  };

  return (
    <div className="saas-panel p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Route & Duty Event Itinerary
          </h3>
          <p className="text-xs text-[var(--text-sub)] mt-0.5">
            Chronological sequence of driving legs, mandatory rests, 30m breaks, fuel stops, and loading activities.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          {timeline.length} Events Total
        </span>
      </div>

      {/* Timeline Connected Stream */}
      <div className="relative pl-6 border-l-2 border-slate-800 space-y-3.5">
        {timeline.map((ev, i) => {
          const startFormat = formatMinTo12h(ev.start_minute);
          const endFormat = formatMinTo12h(ev.end_minute);
          const hrs = Math.floor(ev.duration_minutes / 60);
          const mins = ev.duration_minutes % 60;
          const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

          return (
            <div key={i} className="relative group">
              {/* Connected Node Bullet */}
              <div className="absolute -left-[32px] top-2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-cyan-400 flex items-center justify-center transition-colors shadow-sm">
                {getEventIcon(ev.type)}
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      {startFormat.day} • {startFormat.time} - {endFormat.time}
                    </span>
                    {getStatusBadge(ev.status)}
                  </div>
                  <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {ev.location}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-slate-200">
                    Duration: <strong>{durationStr}</strong>
                  </div>
                  {ev.distance_miles > 0 && (
                    <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                      +{ev.distance_miles} mi
                    </div>
                  )}
                  {ev.type === 'FUELING' && (
                    <div className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
                      ⛽ 1,000-Mi Threshold
                    </div>
                  )}
                  {ev.type === 'REST_10H' && (
                    <div className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 mt-1">
                      🛌 HOS Rest Reset
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

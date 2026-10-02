import React from 'react';
import { Compass, Clock, Fuel, Bed, Activity, ShieldCheck } from 'lucide-react';

export default function TripSummaryCards({ summary }) {
  if (!summary) return null;

  const cycleRemaining = summary.remaining_cycle_hours;
  const cyclePercent = Math.min(100, Math.max(0, (summary.final_cycle_used_hours / 70.0) * 100));

  return (
    <div className="saas-panel p-4 overflow-hidden">
      
      {/* Single Metrics Strip Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 gap-y-3 sm:gap-y-0">
        
        {/* Metric 1: Distance */}
        <div className="px-3 py-1 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DISTANCE</span>
            <div className="text-base font-extrabold text-white font-mono">{summary.total_distance_miles} mi</div>
          </div>
        </div>

        {/* Metric 2: Driving Time */}
        <div className="px-3 py-1 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DRIVE TIME</span>
            <div className="text-base font-extrabold text-white font-mono">{summary.total_driving_formatted}</div>
          </div>
        </div>

        {/* Metric 3: Trip Duration */}
        <div className="px-3 py-1 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TRIP DURATION</span>
            <div className="text-base font-extrabold text-white font-mono">{summary.total_trip_duration_days} Days</div>
          </div>
        </div>

        {/* Metric 4: Fuel Stops */}
        <div className="px-3 py-1 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Fuel className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FUEL STOPS</span>
            <div className="text-base font-extrabold text-white font-mono">{summary.fuel_stops_count} Scheduled</div>
          </div>
        </div>

        {/* Metric 5: Rest Stops */}
        <div className="px-3 py-1 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Bed className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">REST STOPS</span>
            <div className="text-base font-extrabold text-white font-mono">{summary.rest_stops_count} Mandatory</div>
          </div>
        </div>

        {/* Metric 6: Cycle Progress Strip */}
        <div className="px-3 py-1 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="font-bold text-slate-400 uppercase">70H CYCLE</span>
            <span className="font-mono text-cyan-400 font-bold">{cycleRemaining}h left</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cyclePercent > 80 ? 'bg-rose-500' : cyclePercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${cyclePercent}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            {summary.final_cycle_used_hours}h used of 70.0h limit
          </div>
        </div>

      </div>

    </div>
  );
}

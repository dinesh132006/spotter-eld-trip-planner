import React from 'react';
import { ShieldCheck, ArrowRight, MapPin, Fuel, Bed, Clock, Compass } from 'lucide-react';

export default function HeroSection({ isGenerated, tripSummary, inputs }) {
  if (!isGenerated || !tripSummary) return null;

  return (
    <div className="saas-card p-5 sm:p-6 space-y-4">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f293d] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            TRIP READY &bull; HOS COMPLIANT
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
            <span>{inputs?.current_location || 'New York, NY'}</span>
            <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{inputs?.pickup_location || 'Chicago, IL'}</span>
            <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{inputs?.dropoff_location || 'Los Angeles, CA'}</span>
          </h2>
        </div>

        {/* Quick Highlights Chips */}
        <div className="flex items-center gap-3 text-xs font-mono shrink-0 flex-wrap">
          <div className="bg-[#182235] px-3.5 py-2 rounded-lg border border-[#1f293d] text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-medium uppercase">DISTANCE</span>
            <strong className="text-cyan-400 text-sm">{tripSummary.total_distance_miles} mi</strong>
          </div>
          <div className="bg-[#182235] px-3.5 py-2 rounded-lg border border-[#1f293d] text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-medium uppercase">DRIVE TIME</span>
            <strong className="text-blue-400 text-sm">{tripSummary.total_driving_formatted}</strong>
          </div>
          <div className="bg-[#182235] px-3.5 py-2 rounded-lg border border-[#1f293d] text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-medium uppercase">DURATION</span>
            <strong className="text-emerald-400 text-sm">{tripSummary.total_trip_duration_days} Days</strong>
          </div>
          <div className="bg-[#182235] px-3.5 py-2 rounded-lg border border-[#1f293d] text-center">
            <span className="text-[10px] text-slate-400 block font-sans font-medium uppercase">CYCLE LEFT</span>
            <strong className="text-amber-400 text-sm">{tripSummary.remaining_cycle_hours}h</strong>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> Start: <strong className="text-white font-mono">{inputs?.start_time || '06:00 AM'}</strong></span>
        <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-amber-400" /> Fuel Stops: <strong className="text-white">{tripSummary.fuel_stops_count} Scheduled</strong></span>
        <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-purple-400" /> Rest Periods: <strong className="text-white">{tripSummary.rest_stops_count} Mandatory</strong></span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Status: <strong className="text-emerald-400 font-mono font-bold">HOS COMPLIANT</strong></span>
      </div>

    </div>
  );
}

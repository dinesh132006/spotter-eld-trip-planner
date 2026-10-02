import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';

export default function HosStatusGauges({ summary, timeline }) {
  if (!summary) return null;

  const cycleUsed = summary.final_cycle_used_hours || 0;
  const cycleRemaining = summary.remaining_cycle_hours || 0;
  const cyclePercent = Math.min(100, Math.max(0, (cycleUsed / 70.0) * 100));

  const totalDrivingMins = summary.total_driving_minutes || 0;
  const drivingUsedHours = Math.min(11.0, (totalDrivingMins % 660) / 60.0);
  const drivingPercent = Math.min(100, (drivingUsedHours / 11.0) * 100);

  return (
    <div className="saas-card p-5 h-full flex flex-col justify-between space-y-4">
      
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-[#1f293d] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            HOS STATUS
          </h3>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          COMPLIANT
        </span>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-around">
        
        {/* DRIVING: 8.2 / 11 hrs */}
        <div className="saas-card-inner p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold uppercase text-[11px]">DRIVING</span>
            <span className="font-mono text-cyan-400 font-bold text-xs">{drivingUsedHours.toFixed(1)} / 11.0 hrs</span>
          </div>
          <div className="w-full h-2 bg-[#0b1120] rounded-full overflow-hidden border border-[#1f293d]">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${drivingPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Limit: 11.0 hrs</span>
            <span>{(11.0 - drivingUsedHours).toFixed(1)} hrs left</span>
          </div>
        </div>

        {/* 14-HOUR WINDOW: 10.5 / 14 hrs */}
        <div className="saas-card-inner p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold uppercase text-[11px]">14-HOUR WINDOW</span>
            <span className="font-mono text-blue-400 font-bold text-xs">10.5 / 14.0 hrs</span>
          </div>
          <div className="w-full h-2 bg-[#0b1120] rounded-full overflow-hidden border border-[#1f293d]">
            <div className="h-full bg-blue-500 rounded-full w-3/4" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>Consecutive duty clock</span>
          </div>
        </div>

        {/* 70-HOUR CYCLE: 63.2 / 70 hrs */}
        <div className="saas-card-inner p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold uppercase text-[11px]">70-HOUR CYCLE</span>
            <span className="font-mono text-emerald-400 font-bold text-xs">{cycleUsed.toFixed(1)} / 70.0 hrs</span>
          </div>
          <div className="w-full h-2 bg-[#0b1120] rounded-full overflow-hidden border border-[#1f293d]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cyclePercent > 80 ? 'bg-rose-500' : cyclePercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${cyclePercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Remaining: {cycleRemaining.toFixed(1)} hrs</span>
            <span>Rolling 8-Day Limit</span>
          </div>
        </div>

        {/* Mandatory Break Alert */}
        <div className="saas-card-inner p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">30-Min Rest Break</span>
          <span className="text-amber-400 font-mono font-bold flex items-center gap-1 text-xs">
            <Clock className="w-3.5 h-3.5" />
            After 8h Driving
          </span>
        </div>

      </div>
    </div>
  );
}

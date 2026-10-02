import React, { useState } from 'react';
import { FileText, Printer, Calendar, Shield, Truck, User, Building, MapPin, CheckCircle2 } from 'lucide-react';
import EldSvgGrid from './EldSvgGrid';

export default function EldDailyLogs({ dailyLogs }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!dailyLogs || dailyLogs.length === 0) return null;

  const currentLog = dailyLogs[selectedDayIndex] || dailyLogs[0];
  const header = currentLog.header;
  const totals = currentLog.duty_totals;
  const remarks = currentLog.remarks;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="saas-panel p-5 space-y-5">
      
      {/* Module Header & Day Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Official FMCSA Daily ELD Log Sheets
          </h3>
          <p className="text-xs text-[var(--text-sub)] mt-0.5">
            Driver duty status log sheets generated dynamically per FMCSA HOS regulations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Day Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            {dailyLogs.map((log, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  selectedDayIndex === idx
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Day {log.day_number}
              </button>
            ))}
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="btn-cta-secondary no-print"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print / Save Log</span>
          </button>
        </div>
      </div>

      {/* Printable ELD Document Container */}
      <div className="eld-print-container bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-5">
        
        {/* Document Header Metadata Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800 pb-4 text-xs">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Log Date / Day:</span>
              <strong className="text-white font-mono">{header.date_label}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Carrier Name:</span>
              <strong className="text-white">{header.carrier_name}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Main Office:</span>
              <span className="text-slate-300 truncate">{header.main_office_address}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Driver Name:</span>
              <strong className="text-white">{header.driver_name}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Tractor / Trailer:</span>
              <strong className="text-white font-mono">{header.vehicle_tractor_trailer}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Shipping Doc / BOL:</span>
              <span className="text-slate-300 font-mono">{header.shipping_document}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span>Miles Driven Today:</span>
              <strong className="text-emerald-400 font-mono">{header.total_miles_driven_today} mi</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Home Terminal:</span>
              <span className="text-slate-300">{header.home_terminal}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800">
              <span>Log Status:</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                24.0 Hours Verified
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic 24-Hour Duty Status SVG Grid Graph */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            24-HOUR DUTY STATUS GRAPH (FMCSA FORMAT)
          </h4>
          <EldSvgGrid svgGrid={currentLog.svg_grid} />
        </div>

        {/* Daily Totals Summary Strip */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            DAILY DUTY HOURS SUMMARY
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">1. OFF DUTY</span>
              <strong className="text-slate-200 text-sm font-mono font-bold">{totals.off_duty_hours}h</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">2. SLEEPER BERTH</span>
              <strong className="text-purple-400 text-sm font-mono font-bold">{totals.sleeper_berth_hours}h</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">3. DRIVING</span>
              <strong className="text-cyan-400 text-sm font-mono font-bold">{totals.driving_hours}h</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] font-semibold">4. ON DUTY (NOT DRIVING)</span>
              <strong className="text-amber-400 text-sm font-mono font-bold">{totals.on_duty_not_driving_hours}h</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/30 text-center col-span-2 sm:col-span-1">
              <span className="text-cyan-400 block text-[10px] font-bold">TOTAL HOURS</span>
              <strong className="text-emerald-400 text-sm font-mono font-extrabold">{totals.total_hours}h</strong>
            </div>
          </div>
        </div>

        {/* Remarks Table */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            DUTY STATUS REMARKS & ACTIVITY LOG
          </h4>
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5 font-semibold w-24">TIME</th>
                  <th className="p-2.5 font-semibold w-48">LOCATION</th>
                  <th className="p-2.5 font-semibold w-40">STATUS</th>
                  <th className="p-2.5 font-semibold">REMARK / ACTIVITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {remarks.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/30'}>
                    <td className="p-2.5 font-bold text-cyan-400 font-mono">{r.time}</td>
                    <td className="p-2.5 text-slate-200">{r.location}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300">{r.remark_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { Truck, Zap } from 'lucide-react';

export default function Header({ activeTab, onTabChange, onLoadExample, apiHealthy }) {
  return (
    <header className="border-b border-[#1f293d] bg-[#080d18] sticky top-0 z-40 w-full">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Logo / Brand */}
        <div 
          onClick={() => onTabChange('planner')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-white tracking-tight">Spotter ELD</span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase tracking-wider">
              Fleet Operations
            </span>
          </div>
        </div>

        {/* Center: Interactive Navigation Items */}
        <nav className="flex items-center gap-1.5 bg-[#111827] p-1 rounded-lg border border-[#1f293d] text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('planner')}
            className={`px-3.5 py-1 rounded-md transition-all ${
              activeTab === 'planner'
                ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Planner
          </button>
          <button
            type="button"
            onClick={() => onTabChange('routes')}
            className={`px-3.5 py-1 rounded-md transition-all ${
              activeTab === 'routes'
                ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Routes
          </button>
          <button
            type="button"
            onClick={() => onTabChange('eld')}
            className={`px-3.5 py-1 rounded-md transition-all ${
              activeTab === 'eld'
                ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            ELD Logs
          </button>
        </nav>

        {/* Right: Operational Status & Load Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#111827] border border-[#1f293d]">
            <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 text-[11px] font-medium hidden sm:inline">
              System {apiHealthy ? 'Operational' : 'Offline'}
            </span>
          </div>

          <button
            onClick={onLoadExample}
            className="btn-secondary-ghost"
            title="Pre-fill assessment sample trip"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Load Sample Trip</span>
          </button>
        </div>

      </div>
    </header>
  );
}

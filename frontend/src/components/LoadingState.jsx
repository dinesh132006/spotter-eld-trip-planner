import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, MapPin, Compass, FileText } from 'lucide-react';

export default function LoadingState() {
  const steps = [
    { title: 'Geocoding Locations', desc: 'Resolving coordinates for origin, pickup, and dropoff...', icon: MapPin },
    { title: 'Calculating Route', desc: 'Fetching road geometry & driving distance via OSRM...', icon: Compass },
    { title: 'Applying HOS Rules Engine', desc: 'Checking 11h driving, 14h window, 70h cycle & breaks...', icon: ShieldCheck },
    { title: 'Generating ELD Logs', desc: 'Building dynamic 24-hour SVG log sheets & remarks...', icon: FileText },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="glass-panel p-12 rounded-2xl border border-cyan-500/20 text-center space-y-6 max-w-xl mx-auto my-12 relative overflow-hidden">
      
      {/* Background Pulse Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-xl shadow-cyan-500/20 animate-pulse">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Calculating HOS Trip Plan</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Processing route distance and simulating FMCSA hours of service compliance.
        </p>
      </div>

      <div className="space-y-3 pt-2 text-left max-w-sm mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : isDone
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{s.title}</div>
                <div className="text-[11px] truncate opacity-80">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

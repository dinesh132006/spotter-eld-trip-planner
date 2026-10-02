import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="saas-card p-8 text-center space-y-3 max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center">
        <Compass className="w-6 h-6 text-cyan-400" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Plan Your Next Trip</h3>
        <p className="text-xs text-[var(--text-sub)] mt-1 max-w-sm mx-auto">
          Enter your current location, pickup location, dropoff location, and current cycle hours to generate an FMCSA HOS-compliant trip plan.
        </p>
      </div>
      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span>Calculates 11h driving, 14h window, 70h cycle & ELD logs</span>
      </div>
    </div>
  );
}

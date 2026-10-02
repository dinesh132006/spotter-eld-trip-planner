import React, { useState } from 'react';
import { Navigation, ArrowRight, RefreshCw, AlertCircle, MapPin, Clock, Package, Flag, ArrowDown } from 'lucide-react';

export default function TripForm({ onSubmit, loading, error, exampleData, onClearError }) {
  const [currentLocation, setCurrentLocation] = useState(exampleData?.current_location || 'New York, NY');
  const [pickupLocation, setPickupLocation] = useState(exampleData?.pickup_location || 'Chicago, IL');
  const [dropoffLocation, setDropoffLocation] = useState(exampleData?.dropoff_location || 'Los Angeles, CA');
  const [cycleUsed, setCycleUsed] = useState(exampleData?.cycle_used ?? 10);
  const [startTime, setStartTime] = useState('06:00');
  const [validationError, setValidationError] = useState('');

  const cycleNum = parseFloat(cycleUsed) || 0;
  const cycleRemaining = Math.max(0, 70 - cycleNum);
  const cyclePercent = Math.min(100, (cycleNum / 70.0) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();

    if (!currentLocation.trim()) {
      setValidationError('Please enter a valid current location.');
      return;
    }
    if (!pickupLocation.trim()) {
      setValidationError('Please enter a valid pickup location.');
      return;
    }
    if (!dropoffLocation.trim()) {
      setValidationError('Please enter a valid dropoff location.');
      return;
    }

    if (isNaN(cycleNum) || cycleNum < 0 || cycleNum > 70) {
      setValidationError('Cycle used must be between 0 and 70 hours.');
      return;
    }

    onSubmit({
      current_location: currentLocation.trim(),
      pickup_location: pickupLocation.trim(),
      dropoff_location: dropoffLocation.trim(),
      cycle_used: cycleNum,
      start_time: startTime
    });
  };

  const handleResetExample = () => {
    setCurrentLocation('New York, NY');
    setPickupLocation('Chicago, IL');
    setDropoffLocation('Los Angeles, CA');
    setCycleUsed(10);
    setStartTime('06:00');
    setValidationError('');
    if (onClearError) onClearError();
  };

  return (
    <div className="space-y-6">
      
      {/* HERO SECTION */}
      <div className="saas-card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HOS COMPLIANT PLANNING
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Plan your next trip
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Build a driver-ready route with HOS-compliant schedules and daily ELD log sheets.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetExample}
            className="btn-secondary-ghost self-start md:self-center shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Trip</span>
          </button>
        </div>
      </div>

      {/* Input Warning / Error Notification */}
      {(validationError || error) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-rose-200 block">Notice:</strong>
            <span className="text-rose-300/90">{validationError || error}</span>
          </div>
        </div>
      )}

      {/* PLANNER CARD */}
      <div className="saas-card p-6 sm:p-7 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* TRIP ROUTE INPUTS (8 Columns) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  TRIP ROUTE
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">3 Required Locations</span>
              </div>

              <div className="saas-card-inner p-4 sm:p-5 space-y-4 relative">
                
                {/* ① Current Location */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px]">①</span>
                    <span>Current Location</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      placeholder="e.g. New York, NY"
                      className="saas-input-field !pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Direction Arrow Down Connector */}
                <div className="flex justify-center py-0.5 text-cyan-400/60">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* ② Pickup Location */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-[10px]">②</span>
                      <span>Pickup</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold">+1 hr duty</span>
                  </div>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Chicago, IL"
                      className="saas-input-field !pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Direction Arrow Down Connector */}
                <div className="flex justify-center py-0.5 text-cyan-400/60">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* ③ Dropoff Location */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-[10px]">③</span>
                      <span>Dropoff</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold">+1 hr duty</span>
                  </div>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      placeholder="e.g. Los Angeles, CA"
                      className="saas-input-field !pl-11"
                      required
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* DRIVER STATUS & SUBMIT CTA (4 Columns) */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="border-b border-[#1f293d] pb-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    DRIVER STATUS
                  </h3>
                </div>

                <div className="saas-card-inner p-4 sm:p-5 space-y-4">
                  
                  {/* Current Cycle Used Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      Current Cycle Used
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="70"
                        value={cycleUsed}
                        onChange={(e) => setCycleUsed(e.target.value)}
                        placeholder="10.0"
                        className="saas-input-field font-mono font-bold text-lg text-white"
                        required
                      />
                      <span className="absolute right-3 top-3 text-xs text-slate-400 font-mono">hrs</span>
                    </div>
                  </div>

                  {/* 70 hr Cycle Progress Meter */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">70 hr cycle</span>
                      <strong className="text-cyan-400 font-mono text-xs">{cycleRemaining.toFixed(1)} hrs remaining</strong>
                    </div>
                    <div className="w-full h-2.5 bg-[#0b1120] rounded-full overflow-hidden border border-[#1f293d]">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${cyclePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Start Time Config */}
                  <div className="pt-2 border-t border-[#1f293d] flex justify-between items-center text-xs">
                    <span className="text-slate-400">Departure Time</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[#0b1120] border border-[#1f293d] rounded px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>

                </div>
              </div>

              {/* Dominant Primary CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-dominant w-full group mt-4"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Calculating Route & HOS...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Trip Plan</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>

            </div>

          </div>

        </form>
      </div>

      {/* STEP 4: VISUAL ROUTE PREVIEW */}
      <div className="saas-card p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
          <span>ROUTE PREVIEW</span>
          <span className="text-cyan-400 font-mono font-normal text-[11px]">HOS & ELD Compliant Path</span>
        </div>

        <div className="saas-card-inner p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Node 1: Current Location */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block uppercase">START</span>
              <strong className="text-xs sm:text-sm text-white block truncate">{currentLocation || 'New York, NY'}</strong>
            </div>
          </div>

          {/* Connector Line 1 */}
          <div className="hidden sm:block flex-1 h-0.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 relative mx-2">
            <div className="absolute left-1/2 -top-1.5 w-3 h-3 rounded-full bg-purple-500/40 border border-purple-400 -translate-x-1/2" />
          </div>

          {/* Node 2: Pickup */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-400 ring-4 ring-purple-500/20 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-purple-400 block uppercase">PICKUP (+1 HR)</span>
              <strong className="text-xs sm:text-sm text-white block truncate">{pickupLocation || 'Chicago, IL'}</strong>
            </div>
          </div>

          {/* Connector Line 2 */}
          <div className="hidden sm:block flex-1 h-0.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-rose-400 relative mx-2">
            <div className="absolute left-1/2 -top-1.5 w-3 h-3 rounded-full bg-rose-500/40 border border-rose-400 -translate-x-1/2" />
          </div>

          {/* Node 3: Dropoff */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-400 ring-4 ring-rose-500/20 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-rose-400 block uppercase">DROPOFF (+1 HR)</span>
              <strong className="text-xs sm:text-sm text-white block truncate">{dropoffLocation || 'Los Angeles, CA'}</strong>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

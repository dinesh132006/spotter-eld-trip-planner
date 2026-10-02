import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TripForm from './components/TripForm';
import HosStatusGauges from './components/HosStatusGauges';
import RouteMap from './components/RouteMap';
import RouteTimeline from './components/RouteTimeline';
import EldDailyLogs from './components/EldDailyLogs';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import { planTrip, checkHealth } from './services/api';
import { Compass, FileText, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'routes' | 'eld'
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [lastInputs, setLastInputs] = useState(null);

  // Auto-check API health & calculate default trip on mount
  useEffect(() => {
    async function initApp() {
      const isOk = await checkHealth();
      setApiHealthy(isOk);

      const defaultInputs = {
        current_location: 'New York, NY',
        pickup_location: 'Chicago, IL',
        dropoff_location: 'Los Angeles, CA',
        cycle_used: 10,
        start_time: '06:00'
      };
      setLastInputs(defaultInputs);
      handleGenerateTrip(defaultInputs);
    }
    initApp();
  }, []);

  const handleGenerateTrip = async (formData) => {
    setLoading(true);
    setError(null);
    setLastInputs(formData);
    try {
      const result = await planTrip(formData);
      setTripPlan(result);
    } catch (err) {
      console.error("Trip planning error:", err);
      setError(err.message || 'Failed to calculate trip plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-[#f9fafb] flex flex-col font-sans">
      
      {/* 1. HEADER WITH INTERACTIVE TABS */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLoadExample={() => {
          const sampleInputs = {
            current_location: 'New York, NY',
            pickup_location: 'Chicago, IL',
            dropoff_location: 'Los Angeles, CA',
            cycle_used: 10,
            start_time: '06:00'
          };
          setLastInputs(sampleInputs);
          handleGenerateTrip(sampleInputs);
          setActiveTab('planner');
        }}
        apiHealthy={apiHealthy}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* LOADING INDICATOR */}
        {loading && <LoadingState />}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: PLANNER TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'planner' && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* TRIP PLANNER FORM & ROUTE PREVIEW */}
            <TripForm
              onSubmit={handleGenerateTrip}
              loading={loading}
              error={error}
              onClearError={() => setError(null)}
              exampleData={{
                current_location: 'New York, NY',
                pickup_location: 'Chicago, IL',
                dropoff_location: 'Los Angeles, CA',
                cycle_used: 10
              }}
            />

            {/* EMPTY STATE IF NO TRIP GENERATED */}
            {!tripPlan && !error && <EmptyState />}

            {/* GENERATED RESULTS QUICK VIEW IN PLANNER */}
            {tripPlan && (
              <div className="space-y-6 pt-4 border-t border-[#1f293d]">
                
                {/* TOP RESULTS HEADER */}
                <HeroSection
                  isGenerated={true}
                  tripSummary={tripPlan.trip_summary}
                  inputs={lastInputs}
                />

                {/* TAB SHORTCUT BUTTONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-4 rounded-xl border border-[#1f293d]">
                  <div className="text-xs text-slate-300">
                    <strong className="text-white font-bold block text-sm">Trip Plan Generated Successfully!</strong>
                    <span>Use the navigation tabs above or click below to inspect detailed route geometry or daily ELD log sheets.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('routes')}
                      className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <Compass className="w-4 h-4" />
                      <span>View Route & Map &rarr;</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('eld')}
                      className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs hover:bg-purple-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View ELD Logs &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* MAIN MAP & HOS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[420px]">
                  <div className="lg:col-span-8 min-h-[400px]">
                    <RouteMap route={tripPlan.route} stops={tripPlan.stops} />
                  </div>
                  <div className="lg:col-span-4 min-h-[400px]">
                    <HosStatusGauges summary={tripPlan.trip_summary} timeline={tripPlan.timeline} />
                  </div>
                </div>

                {/* ROUTE TIMELINE */}
                <RouteTimeline timeline={tripPlan.timeline} />

                {/* ELD DAILY LOGS */}
                <EldDailyLogs dailyLogs={tripPlan.daily_logs} />

              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ROUTES TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'routes' && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {tripPlan ? (
              <div className="space-y-6">
                {/* TOP RESULTS HEADER */}
                <HeroSection
                  isGenerated={true}
                  tripSummary={tripPlan.trip_summary}
                  inputs={lastInputs}
                />

                {/* MAIN GRID: MAP (68%) + HOS PANEL (32%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[420px]">
                  <div className="lg:col-span-8 min-h-[400px]">
                    <RouteMap route={tripPlan.route} stops={tripPlan.stops} />
                  </div>
                  <div className="lg:col-span-4 min-h-[400px]">
                    <HosStatusGauges summary={tripPlan.trip_summary} timeline={tripPlan.timeline} />
                  </div>
                </div>

                {/* DRIVER TIMELINE */}
                <RouteTimeline timeline={tripPlan.timeline} />
              </div>
            ) : (
              /* EMPTY STATE WHEN NO TRIP PLAN YET */
              <div className="saas-card p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                  <Compass className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white">No Generated Route Found</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Please enter your trip origin, pickup, dropoff, and cycle hours in the Planner to generate route geometry and stop metrics.
                </p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="btn-primary-dominant inline-flex items-center gap-2 mt-2"
                >
                  <span>Go to Trip Planner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ELD LOGS TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'eld' && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {tripPlan ? (
              <div className="space-y-6">
                {/* DAILY ELD LOGS MODULE */}
                <EldDailyLogs dailyLogs={tripPlan.daily_logs} />
              </div>
            ) : (
              /* EMPTY STATE WHEN NO TRIP PLAN YET */
              <div className="saas-card p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white">No Daily ELD Logs Generated</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Generate a HOS-compliant trip plan to view official 24-hour driver daily log sheets and FMCSA remarks.
                </p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="btn-primary-dominant inline-flex items-center gap-2 mt-2"
                >
                  <span>Go to Trip Planner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1f293d] bg-[#080d18] py-4 text-center text-xs text-slate-400 no-print w-full">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Spotter ELD Trip Planner</strong> &mdash; FMCSA HOS Compliance Operations
          </div>
          <div>
            Django REST API &bull; React Vite Frontend &bull; Leaflet Map Routing
          </div>
        </div>
      </footer>

    </div>
  );
}

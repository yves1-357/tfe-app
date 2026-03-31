'use client';

import { useState } from 'react';
import MapContainer from '@/components/MapContainer';
import BottomPanel from '@/components/BottomPanel';
import StopList from '@/components/StopList';
import AddStopInput from '@/components/AddStopInput';
import { Stop } from '@/types';

export default function Home() {
  const [stops, setStops] = useState<Stop[]>([]);

  const handleAddStop = (address: string) => {
    const newStop: Stop = {
      id: Date.now().toString(),
      address,
      order: stops.length + 1,
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const handleOptimize = () => {
    // TODO: Call backend API to optimize route
    alert('🚀 Route optimization will be implemented in the next phase!');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0f1117]">
      {/* Map - full viewport background */}
      <MapContainer />

      {/* Centered UI shell */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="relative w-full max-w-[480px] h-full pointer-events-auto">
          {/* App Title - Top Center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="bg-[#1c1f2e]/90 backdrop-blur-md px-5 py-2.5 rounded-xl border border-gray-700/30 shadow-lg shadow-black/20">
              <span className="text-white text-sm font-semibold tracking-tight">Route</span>
              <span className="text-blue-400 text-sm font-semibold tracking-tight"> App</span>
            </div>
          </div>

          {/* Map floating controls - inside centered shell */}
          <div className="absolute bottom-52 right-4 z-10 flex flex-col gap-3">
            <button
              type="button"
              aria-label="Center map on location"
              className="press-effect w-11 h-11 bg-[#1c1f2e]/90 backdrop-blur-md rounded-xl shadow-lg shadow-black/20 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#252838] transition-colors border border-gray-700/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="My location"
              className="press-effect w-11 h-11 bg-[#1c1f2e]/90 backdrop-blur-md rounded-xl shadow-lg shadow-black/20 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#252838] transition-colors border border-gray-700/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
              </svg>
            </button>
          </div>

          {/* Bottom Panel with Stops */}
          <BottomPanel stopsCount={stops.length} onOptimize={handleOptimize}>
            <AddStopInput onAddStop={handleAddStop} />
            <StopList stops={stops} onRemoveStop={handleRemoveStop} />
          </BottomPanel>
        </div>
      </div>
    </div>
  );
}


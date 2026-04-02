'use client';

import { useState } from 'react';
import MapContainer from '@/components/MapContainer';
import BottomPanel from '@/components/BottomPanel';
import StopList from '@/components/StopList';
import AddStopInput from '@/components/AddStopInput';
import SideMenu from '@/components/SideMenu';
import { Stop } from '@/types';

export default function Home() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* Hamburger Menu Button - Fixed Top Left */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 left-4 z-30 w-10 h-10 bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-xl shadow-lg flex items-center justify-center text-white hover:bg-gray-800/60 transition"
        aria-label="Open menu"
        style={{
          background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.4), rgba(17, 24, 39, 0.6))',
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Side Menu */}
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Bottom Panel - Next to Hamburger */}
      <div className="fixed top-4 left-20 z-20 w-[400px] max-w-[calc(100vw-6rem)]">
        <BottomPanel stopsCount={stops.length} onOptimize={handleOptimize}>
          <AddStopInput onAddStop={handleAddStop} />
          <StopList stops={stops} onRemoveStop={handleRemoveStop} />
        </BottomPanel>
      </div>

      {/* Centered UI shell */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="relative w-full max-w-[480px] h-full pointer-events-auto">

          {/* App Title - Top Center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="  px-5 py-2.5   border-gray-700/30 ">
              <span className="text-white text-sm font-semibold tracking-tight">Next</span>
              <span className="text-blue-400 text-sm font-semibold tracking-tight">Stop</span>
            </div>
          </div>

          {/* Map floating controls - inside centered shell */}
          <div className="absolute bottom-52 right-4 z-10 flex flex-col gap-3">
         
          
          </div>
        </div>
      </div>
    </div>
  );
}


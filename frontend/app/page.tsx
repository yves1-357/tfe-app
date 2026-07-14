'use client';

import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapContainer from '@/components/MapContainer';
import BottomPanel from '@/components/BottomPanel';
import StopList from '@/components/StopList';
import AddStopInput from '@/components/AddStopInput';
import SideMenu from '@/components/SideMenu';
import { Stop } from '@/types';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [stops, setStops] = useState<Stop[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAddStop = (place: { address: string; lat: number; lng: number; placeId: string }) => {
    const newStop: Stop = {
      id: Date.now().toString(),
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      placeId: place.placeId,
      order: stops.length + 1,
    };
    setStops(prev => [...prev, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(prev =>
      prev.filter(stop => stop.id !== id)
          .map((stop, index) => ({ ...stop, order: index + 1 }))
    );
  };

  // TODO: Implement optimize route / a revoir plu tard 
  const handleOptimize = () => {
    // TODO: Call backend API to optimize route
    alert('🚀 Route optimization will be implemented in the next phase!');
  };

  if (!apiKey) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500">
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY manquante dans frontend 
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map - full viewport background */}
      <MapContainer stops={stops} />

      {/* Hamburger Menu Button - Fixed Top Left */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="press-effect glass hover-surface fixed top-4 left-4 z-30 w-11 h-11 rounded-2xl flex items-center justify-center text-1"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Brand - Top Center (frameless) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="px-2 py-1">
          <span className="lg-text text-1 text-base font-bold tracking-tight">Next</span>
          <span className="lg-text text-blue-400 text-base font-bold tracking-tight">Stop</span>
        </div>
      </div>

      {/* Side Menu */}
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Floating panel - top-left on desktop, bottom sheet on mobile */}
      <div className="fixed z-20 left-1/2 -translate-x-1/2 bottom-4 w-[calc(100vw-1.5rem)] max-w-[420px] sm:left-20 sm:translate-x-0 sm:top-4 sm:bottom-auto">
        <BottomPanel stopsCount={stops.length} onOptimize={handleOptimize}>
          <AddStopInput onAddStop={handleAddStop} />
          <StopList stops={stops} onRemoveStop={handleRemoveStop} />
        </BottomPanel>
      </div>
    </div>
    </APIProvider>
  );
}


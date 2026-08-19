'use client';

import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapContainer from '@/components/MapContainer';
import BottomPanel from '@/components/BottomPanel';
import StopList from '@/components/StopList';
import AddStopInput from '@/components/AddStopInput';
import SideMenu from '@/components/SideMenu';
import TripMode from '@/components/TripMode';
import SaveRouteDialog from '@/components/SaveRouteDialog';
import { Stop, OptimizeResponse } from '@/types';
import type { SavedRouteItem } from '@/types';
import { optimizeRoute, saveRoute } from '@/lib/api';
import { hasAuthToken } from '@/lib/auth';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [stops, setStops] = useState<Stop[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResponse | null>(null);
  const [startedFromGPS, setStartedFromGPS] = useState(false);
  const [isTripMode, setIsTripMode] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
    setOptimizeResult(null);
    setStartedFromGPS(false);
    setIsTripMode(false);
    setCurrentStopIndex(0);
  };

  const handleRemoveStop = (id: string) => {
    setStops(prev =>
      prev.filter(stop => stop.id !== id)
          .map((stop, index) => ({ ...stop, order: index + 1 }))
    );
    setOptimizeResult(null);
    setStartedFromGPS(false);
    setIsTripMode(false);
    setCurrentStopIndex(0);
  };

  const handleStartTrip = () => {
    setCurrentStopIndex(0);
    setIsTripMode(true);
  };

  const handleNextStop = () => {
    setCurrentStopIndex(prev => Math.min(prev + 1, stops.length - 1));
  };

  const handleStopTrip = () => {
    setIsTripMode(false);
    setCurrentStopIndex(0);
    // Si l'utilisateur est connecté et qu'une optimisation existe, proposer la sauvegarde
    if (hasAuthToken() && optimizeResult) {
      setShowSaveDialog(true);
    } else {
      resetAfterTrip();
    }
  };

  const resetAfterTrip = () => {
    setStops([]);
    setOptimizeResult(null);
    setStartedFromGPS(false);
    setShowSaveDialog(false);
  };

  const handleLoadRoute = (route: SavedRouteItem) => {
    const restoredStops: Stop[] = [...route.stops_json]
      .sort((a, b) => a.order - b.order)
      .map((s, idx) => ({
        id: `loaded-${route.id}-${idx}`,
        address: s.address,
        order: idx + 1,
        lat: s.lat ?? undefined,
        lng: s.lng ?? undefined,
      }));

    setStops(restoredStops);

    if (route.total_duration_sec != null && route.total_distance_m != null) {
      // Recuperer les  metrics; polyline not stored so re-optimize to get it back
      const order = route.optimized_order.length > 0
        ? route.optimized_order
        : restoredStops.map((_, i) => i);
      setOptimizeResult({
        optimal_order: order,
        total_duration_sec: route.total_duration_sec,
        total_distance_m: route.total_distance_m,
        polyline_encoded: null,
      });
    } else {
      setOptimizeResult(null);
    }

    setIsTripMode(false);
    setCurrentStopIndex(0);
    setStartedFromGPS(false);
    setOptimizeError(null);
    setShowSaveDialog(false);
  };

  const handleSaveRoute = async (name: string) => {
    if (!optimizeResult) return;
    await saveRoute({
      name,
      stops,
      optimized_order: optimizeResult.optimal_order,
      total_duration_sec: optimizeResult.total_duration_sec,
      total_distance_m: optimizeResult.total_distance_m,
    });
    resetAfterTrip();
  };

  const handleOptimize = async () => {
    if (stops.length < 2 || isOptimizing) return;
    setIsOptimizing(true);
    setOptimizeError(null);
    try {
      // Tente de récupérer la position GPS en cache (instantané, déjà demandée par MapContainer)
      let gpsStart: { lat: number; lng: number } | null = null;
      if (stops.length < 15 && typeof navigator !== 'undefined' && navigator.geolocation) {
        gpsStart = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { maximumAge: 60_000, timeout: 3_000, enableHighAccuracy: false }
          );
        });
      }

      // Prépend la position GPS comme noeud 0 (dépôt OR-Tools)
      const stopsForApi: Stop[] = gpsStart
        ? [{ id: '__gps__', address: 'Votre position', order: 0, lat: gpsStart.lat, lng: gpsStart.lng }, ...stops]
        : stops;

      const result = await optimizeRoute(stopsForApi);

      // Si GPS prépendé : optimal_order[0] = 0 (dépôt), on l'exclut et on décale les indices
      const offset = gpsStart ? 1 : 0;
      const reorderedStops = result.optimal_order
        .filter((idx) => idx >= offset)
        .map((idx, newOrder) => ({
          ...stops[idx - offset],
          order: newOrder + 1,
        }));

      setStops(reorderedStops);
      setOptimizeResult(result);
      setStartedFromGPS(!!gpsStart);
      setUserLocation(gpsStart);
    } catch (e) {
      setOptimizeError(e instanceof Error ? e.message : "Erreur lors de l'optimisation");
    } finally {
      setIsOptimizing(false);
    }
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
    <div className="relative h-dvh w-screen overflow-hidden">
      {/* Map - full viewport background */}
      <MapContainer stops={stops} polyline={optimizeResult?.polyline_encoded ?? null} currentStopIndex={isTripMode ? currentStopIndex : -1} />

      {/* Hamburger Menu Button - Fixed Top Left */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="press-effect glass hover-surface fixed top-safe left-4 z-30 w-11 h-11 rounded-2xl flex items-center justify-center text-1"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Brand - Top Center (frameless) */}
      <div className="fixed top-safe left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="px-2 py-1">
          <span className="lg-text text-1 text-base font-bold tracking-tight">Next</span>
          <span className="lg-text text-blue-400 text-base font-bold tracking-tight">Stop</span>
        </div>
      </div>

      {/* Side Menu */}
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLoadRoute={handleLoadRoute} />

      {/* Save route dialog — shown after trip ends if user is logged in */}
      {showSaveDialog && optimizeResult && (
        <SaveRouteDialog
          isOpen={showSaveDialog}
          stops={stops}
          optimizeResult={optimizeResult}
          onSave={handleSaveRoute}
          onSkip={resetAfterTrip}
        />
      )}

      {/* Floating panel */}
      <div className="fixed z-20 left-1/2 -translate-x-1/2 bottom-0 w-[calc(100vw-1.5rem)] max-w-[420px] sm:left-20 sm:translate-x-0 sm:top-4 sm:bottom-auto">
        {/* TripMode visible uniquement pendant le trajet */}
        {isTripMode && (
          <TripMode
            stops={stops}
            currentIndex={currentStopIndex}
            userLocation={userLocation}
            onNext={handleNextStop}
            onStop={handleStopTrip}
          />
        )}
        {/* BottomPanel reste toujours monté pour préserver l'autocomplete */}
        <div className={isTripMode ? 'hidden' : ''}>
          <BottomPanel stopsCount={stops.length} stops={stops} onOptimize={handleOptimize} isOptimizing={isOptimizing} routeResult={optimizeResult} optimizeError={optimizeError} startedFromGPS={startedFromGPS} onStartTrip={handleStartTrip}>
            <AddStopInput onAddStop={handleAddStop} />
            <StopList stops={stops} onRemoveStop={handleRemoveStop} />
          </BottomPanel>
        </div>
      </div>
    </div>
    </APIProvider>
  );
}


'use client';

import { Stop } from '@/types';
import { buildPointToPointUrl, buildWazeUrl } from '@/lib/deep-links';

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface TripModeProps {
  stops: Stop[];
  currentIndex: number;
  userLocation: { lat: number; lng: number } | null; // GPS au début du trajet
  onNext: () => void;
  onStop: () => void;
}

export default function TripMode({ stops, currentIndex, userLocation, onNext, onStop }: TripModeProps) {
  const current = stops[currentIndex];
  const next = stops[currentIndex + 1] ?? null;
  const isLast = currentIndex === stops.length - 1;
  const progress = currentIndex + 1;
  const total = stops.length;

  // Origine : GPS pour le 1er stop, stop précédent pour les suivants
  const origin: { lat: number; lng: number } | null =
    currentIndex === 0
      ? userLocation
      : stops[currentIndex - 1].lat != null
        ? { lat: stops[currentIndex - 1].lat!, lng: stops[currentIndex - 1].lng! }
        : null;

  const dest = current.lat != null
    ? { lat: current.lat!, lng: current.lng! }
    : null;

  if (!current) return null;

  return (
    <div className="relative w-full z-10">
      {/* Backdrop glass */}
      <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

      <div className="relative px-4 pt-4 pb-5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-2 uppercase tracking-wider">Trip in progress</span>
          </div>
          <span className="text-xs text-2 glass-soft px-2.5 py-1 rounded-full">
            {progress} / {total}
          </span>
        </div>

        {/* Stop courant */}
        <div className="glass-soft rounded-2xl px-4 py-3.5 border border-blue-400/30">
          <p className="text-[11px] text-blue-300 font-semibold tracking-wider mb-1">
            {getOrdinal(progress)} stop
          </p>
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md shadow-blue-900/40">
              {progress}
            </span>
            <p className="text-[15px] font-semibold text-1 leading-snug">{current.address}</p>
          </div>
        </div>

        {/* Prochain stop */}
        {next && (
          <div className="px-4 py-2.5 rounded-2xl bg-white/5 flex items-center gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 text-2 text-[10px] font-bold flex items-center justify-center">
              {progress + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-2">Up next</p>
              <p className="text-[13px] text-1 truncate">{next.address.split(',')[0]}</p>
            </div>
          </div>
        )}

        {/* Deep-links point-à-point : origine → stop courant uniquement */}
        <div className="flex gap-2">
          <a
            href={origin && dest ? buildPointToPointUrl(origin, dest) : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="press-effect flex-1 py-2.5 glass-soft hover:bg-white/10 rounded-2xl transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-1"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Google Maps
          </a>
          <a
            href={buildWazeUrl(current)}
            target="_blank"
            rel="noopener noreferrer"
            className="press-effect flex-1 py-2.5 glass-soft hover:bg-white/10 rounded-2xl transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-300"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
              <path d="M20.54 6.63C19.07 3.24 15.69 1 12 1 8.31 1 4.93 3.24 3.46 6.63A5.5 5.5 0 0 0 5.5 17h1v4h11v-4h1a5.5 5.5 0 0 0 2.04-10.37zM9.5 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
            Waze
          </a>
        </div>

        {/* Actions */}
        {isLast ? (
          <button
            type="button"
            onClick={onStop}
            className="press-effect w-full py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Trip completed!
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onNext}
              className="press-effect flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Arrived
            </button>
            <button
              type="button"
              onClick={onStop}
              className="press-effect px-4 py-4 glass-soft hover:bg-white/10 text-2 rounded-2xl transition-colors text-sm"
              aria-label="Stop trip"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

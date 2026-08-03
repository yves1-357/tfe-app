'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { OptimizeResponse, Stop } from '@/types';
import { buildGoogleMapsUrl, buildWazeUrl } from '@/lib/deep-links';

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

interface BottomPanelProps {
  children: ReactNode;
  stopsCount: number;
  stops?: Stop[];
  onOptimize: () => void;
  isOptimizing?: boolean;
  routeResult?: OptimizeResponse | null;
  optimizeError?: string | null;
  startedFromGPS?: boolean;
  onStartTrip?: () => void;
}

export default function BottomPanel({ children, stopsCount, stops = [], onOptimize, isOptimizing = false, routeResult = null, optimizeError = null, startedFromGPS = false, onStartTrip }: BottomPanelProps) {
  const [isExpandedState, setIsExpanded] = useState(false);
  const [showInputState, setShowInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const dragOffset = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Derived state - no useEffect needed
  const showInput = stopsCount > 0 ? true : showInputState;
  const isExpanded = stopsCount === 0 ? false : isExpandedState;

  const applyTransform = useCallback((y: number) => {
    if (panelRef.current) {
      panelRef.current.style.transform = y === 0 ? '' : `translateY(${y}px)`;
    }
  }, []);

  const handleDragStart = useCallback((clientY: number) => {
    startY.current = clientY;
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    const delta = clientY - startY.current;
    dragOffset.current = delta;
    // Rubber-band resistance
    applyTransform(delta * 0.6);
  }, [applyTransform]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (dragOffset.current < -50) {
      setIsExpanded(true);
    } else if (dragOffset.current > 50) {
      setIsExpanded(false);
    }
    dragOffset.current = 0;
    applyTransform(0);
  }, [applyTransform]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientY);
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      ref={panelRef}
      className={`relative w-full z-10 ${isDragging ? '' : 'spring'} ${
        isExpanded ? 'max-h-[82dvh]' : 'max-h-[78dvh]'
      }`}
    >
      {/* Liquid-glass backdrop (extends beyond content & feathers into the map) */}
      <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

      {/* Content layer (no clipping, no own background) */}
      <div className="relative pb-safe">
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3.5 pb-2 cursor-grab active:cursor-grabbing select-none touch-none"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        >
          <div className="drag-handle w-10 h-1.5 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pt-1.5 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="lg-text text-[22px] leading-tight font-semibold text-1 tracking-tight">
                {dayName}
              </h2>
              <p className="text-[13px] text-2 mt-1">
                {dateStr} &middot; {stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}
              </p>
            </div>
            {stopsCount > 0 && (
              <div className="flex items-center justify-center min-w-9 h-9 px-3 rounded-full bg-blue-500/15 border border-blue-400/25 flex-shrink-0">
                <span className="text-sm font-semibold text-blue-300">{stopsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Empty state CTA */}
        {!showInput && stopsCount === 0 && (
          <div className="px-4 pb-5 animate-fade-in-up">
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="press-effect w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add stops</span>
            </button>
          </div>
        )}

        {/* Scrollable content */}
        {(showInput || stopsCount > 0) && (
          <div
            className={`px-4 overflow-y-auto overscroll-contain ${
              isExpanded ? 'pb-6 max-h-[58dvh]' : 'pb-3 max-h-[40dvh]'
            }`}
          >
            {children}
          </div>
        )}

        {/* Optimize button */}
        {stopsCount > 1 && (
          <div className="px-4 pt-2 pb-3 animate-fade-in-up">
            <button
              type="button"
              onClick={onOptimize}
              disabled={isOptimizing}
              className={`press-effect w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 ${
                isOptimizing ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isOptimizing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              <span>{isOptimizing ? 'Optimisation...' : 'Optimize Route'}</span>
            </button>

            {/* Erreur */}
            {optimizeError && (
              <p className="mt-2 text-xs text-red-400 text-center">{optimizeError}</p>
            )}

            {/* Résultat : durée + distance + deep-links */}
            {routeResult && !isOptimizing && (
              <div className="mt-3 animate-fade-in-up space-y-2">
                {/* Point de départ : position GPS ou premier stop */}
                {startedFromGPS ? (
                  <div className="glass-soft rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="white"><circle cx="12" cy="12" r="4"/></svg>
                    </span>
                    <p className="text-xs text-2">Depuis <span className="font-semibold text-1">votre position</span> → {stops[0]?.address.split(',')[0]}</p>
                  </div>
                ) : stops[0] ? (
                  <div className="glass-soft rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    <p className="text-xs text-1 truncate">
                      <span className="text-2">Commencer par&nbsp;</span>
                      <span className="font-semibold">{stops[0].address.split(',')[0]}</span>
                    </p>
                  </div>
                ) : null}

                {/* Bouton Start Route */}
                {onStartTrip && (
                  <button
                    type="button"
                    onClick={onStartTrip}
                    className="press-effect w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Route
                  </button>
                )}

                {/* Durée + Distance */}
                <div className="glass-soft rounded-2xl px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-[11px] text-2 mb-0.5">Durée</p>
                    <p className="text-sm font-semibold text-1">{formatDuration(routeResult.total_duration_sec)}</p>
                  </div>
                  <div className="w-px h-7 bg-white/10" />
                  <div className="flex-1 text-center">
                    <p className="text-[11px] text-2 mb-0.5">Distance</p>
                    <p className="text-sm font-semibold text-1">{formatDistance(routeResult.total_distance_m)}</p>
                  </div>
                </div>

                {/* Deep-links */}
                {stops.length >= 2 && stops[0].lat && (
                  <div className="flex gap-2">
                    <a
                      href={buildGoogleMapsUrl(stops)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press-effect flex-1 py-2.5 glass-soft hover:bg-white/10 rounded-2xl transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      Google Maps
                    </a>
                    <a
                      href={buildWazeUrl(stops[0])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press-effect flex-1 py-2.5 glass-soft hover:bg-white/10 rounded-2xl transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-300"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2a9.93 9.93 0 0 0-7.07 2.93C3.09 6.77 2 9.29 2 12a10 10 0 0 0 10 10c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.5 14.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5-5.5c0 1.1-.9 2-2 2H11c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2z"/></svg>
                      Waze
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

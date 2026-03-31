'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';

interface BottomPanelProps {
  children: ReactNode;
  stopsCount: number;
  onOptimize: () => void;
}

export default function BottomPanel({ children, stopsCount, onOptimize }: BottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((clientY: number) => {
    startY.current = clientY;
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - startY.current;
    setDragOffset(delta);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -60) {
      setIsExpanded(true);
    } else if (dragOffset > 60) {
      setIsExpanded(false);
    }
    setDragOffset(0);
  }, [isDragging, dragOffset]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientY);
    const handleTouchEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      ref={panelRef}
      className={`absolute bottom-0 left-0 right-0 bottom-panel-gradient rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.4)] z-10 ${
        !isDragging ? 'bottom-sheet-transition' : ''
      } ${isExpanded ? 'h-[85vh]' : 'h-auto'}`}
      style={{
        transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
      }}
    >
      {/* Drag Handle */}
      <div
        className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
      >
        <div className="w-9 h-1 bg-gray-600/60 rounded-full" />
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="press-effect w-full flex items-center gap-3 px-4 py-3.5 bg-[#1e2130] hover:bg-[#252838] rounded-2xl transition-colors text-left border border-gray-700/20"
        >
          <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-500 text-sm">Tap to add stops</span>
          <div className="ml-auto flex items-center gap-2.5 text-gray-500">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div className="w-px h-4 bg-gray-700/40" />
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-5 border-t border-gray-700/20" />

      {/* Header */}
      <div className="px-5 pb-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">{dayName}</h2>
            <p className="text-xs text-gray-500 mt-1.5">{dateStr} &middot; {stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}</p>
          </div>
          {stopsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-blue-400">{stopsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content - shown when expanded */}
      {isExpanded && (
        <div className="px-4 pb-8 pt-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 260px)' }}>
          {children}
        </div>
      )}

      {/* Empty state when collapsed */}
      {!isExpanded && stopsCount === 0 && (
        <div className="px-4 pb-6 pt-3">
          <div className="py-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 border border-dashed border-gray-700/60 rounded-2xl flex items-center justify-center bg-gray-800/30">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 max-w-[240px] mx-auto leading-relaxed">
              Add your first stops to start planning your route
            </p>
          </div>
        </div>
      )}

      {/* Optimize Route button - always visible at bottom */}
      <div className="px-4 pb-7 pt-4">
        <button
          type="button"
          onClick={stopsCount > 1 ? onOptimize : () => setIsExpanded(true)}
          className="press-effect w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{stopsCount > 1 ? 'Optimize Route' : 'Add Stops'}</span>
        </button>
      </div>
    </div>
  );
}

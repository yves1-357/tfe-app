'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';

interface BottomPanelProps {
  children: ReactNode;
  stopsCount: number;
  onOptimize: () => void;
}

export default function BottomPanel({ children, stopsCount, onOptimize }: BottomPanelProps) {
  const [isExpandedState, setIsExpanded] = useState(false);
  const [showInputState, setShowInput] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Derived state - no useEffect needed
  const showInput = stopsCount > 0 ? true : showInputState;
  const isExpanded = stopsCount === 0 ? false : isExpandedState;

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
      className={`relative w-full bg-blur-900/50 backdrop-blur-10xl rounded-2xl shadow-lg z-10 transition-all duration-300 ${
        stopsCount === 0 && !showInput ? 'h-auto' : stopsCount > 0 || showInput ? `h-[${160 + (showInput ? 90 : 0) + (stopsCount * 50) + 80}px]` : 'h-auto'
      } ${isExpanded ? '!h-[600px]' : ''}`}
      style={{
        transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
        maxHeight: '85vh',
        background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.4), rgba(17, 24, 39, 0.6))',
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

      {/* Header */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white tracking-tight">{dayName}</h2>
            <p className="text-xs text-gray-500 mt-1.5">{dateStr} &middot; {stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}</p>
          </div>
          {stopsCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm  flex-shrink-0 border border-blue-400/20">
              <span className="text-sm font-semibold text-blue-400">{stopsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Stops Button - shown when no input visible */}
      {!showInput && stopsCount === 0 && (
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span>
            <span>Add stops</span>
          </button>
        </div>
      )}

      {/* Content - shown when input is visible or there are stops */}
      {(showInput || stopsCount > 0) && !isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}

      {/* Content - shown when expanded */}
      {isExpanded && (
        <div className="px-4 pb-8 pt-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {children}
        </div>
      )}

      {/* Optimize button - shown when there are multiple stops */}
      {!isExpanded && stopsCount > 1 && (
        <div className="px-4 pb-6 pt-2">
          <button
            type="button"
            onClick={onOptimize}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Optimize Route</span>
          </button>
        </div>
      )}
    </div>
  );
}

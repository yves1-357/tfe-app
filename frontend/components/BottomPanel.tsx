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
        isExpanded ? 'max-h-[82vh]' : 'max-h-[78vh]'
      }`}
    >
      {/* Liquid-glass backdrop (extends beyond content & feathers into the map) */}
      <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

      {/* Content layer (no clipping, no own background) */}
      <div className="relative">
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
              isExpanded ? 'pb-6 max-h-[58vh]' : 'pb-3 max-h-[40vh]'
            }`}
          >
            {children}
          </div>
        )}

        {/* Optimize button */}
        {stopsCount > 1 && (
          <div className="px-4 pt-2 pb-5 animate-fade-in-up">
            <button
              type="button"
              onClick={onOptimize}
              className="press-effect w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Optimize Route</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

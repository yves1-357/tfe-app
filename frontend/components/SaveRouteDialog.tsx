'use client';

import { useEffect, useRef, useState } from 'react';
import { OptimizeResponse, Stop } from '@/types';

interface SaveRouteDialogProps {
  isOpen: boolean;
  stops: Stop[];
  optimizeResult: OptimizeResponse;
  onSave: (name: string) => Promise<void>;
  onSkip: () => void;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

function defaultName(): string {
  return new Date().toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SaveRouteDialog({ isOpen, stops, optimizeResult, onSave, onSkip }: SaveRouteDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(defaultName());
    setError(null);
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onSkip(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onSkip]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSave(name.trim() || defaultName());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onSkip} aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

        <div className="auth-modal-shell relative rounded-[28px] px-5 pt-5 pb-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <h2 className="lg-text text-base font-bold text-1">Trip completed!</h2>
              <p className="text-[12px] text-2">Would you like to save this optimized route?</p>
            </div>
          </div>

          {/* Route summary */}
          <div className="glass-soft rounded-2xl px-4 py-3 flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-2 mb-0.5">Stops</p>
              <p className="text-sm font-semibold text-1">{stops.length}</p>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="flex-1 text-center">
              <p className="text-[10px] text-2 mb-0.5">Duration</p>
              <p className="text-sm font-semibold text-1">{formatDuration(optimizeResult.total_duration_sec)}</p>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="flex-1 text-center">
              <p className="text-[10px] text-2 mb-0.5">Distance</p>
              <p className="text-sm font-semibold text-1">{formatDistance(optimizeResult.total_distance_m)}</p>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label htmlFor="route-name-input" className="block text-[12px] text-2 mb-1.5">
              Route name
            </label>
            <input
              id="route-name-input"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="no-autofill w-full rounded-xl px-3.5 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-blue-500/50"
              maxLength={80}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onSkip}
              className="press-effect flex-1 py-3 rounded-xl glass-soft hover:bg-white/10 text-sm font-semibold text-2 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className={`press-effect flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${
                loading ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

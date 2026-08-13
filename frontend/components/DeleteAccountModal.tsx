'use client';

import { useEffect, useRef, useState } from 'react';

const CONFIRMATION_WORD = 'DELETETHISACCOUNT';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMatch = input === CONFIRMATION_WORD;

  useEffect(() => {
    if (!isOpen) return;
    setInput('');
    setError(null);
    // Focus the input after the animation frame
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!isMatch || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

        <div className="auth-modal-shell relative rounded-[28px] px-5 pt-5 pb-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </span>
              <h2 className="lg-text text-base font-bold text-1">Delete account</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hover-surface press-effect w-8 h-8 flex items-center justify-center rounded-xl text-2"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Warning text */}
          <p className="text-[13px] text-2 leading-relaxed">
            This action is <span className="font-semibold text-red-400">irreversible</span>. All your data will be permanently deleted (routes, account).
          </p>

          {/* Confirmation input */}
          <div>
            <label htmlFor="delete-confirm-input" className="block text-[12px] text-2 mb-1.5">
              Type <span className="font-mono font-semibold text-red-400">{CONFIRMATION_WORD}</span> to confirm
            </label>
            <input
              id="delete-confirm-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              className="no-autofill w-full rounded-xl px-3.5 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-red-500/40 font-mono tracking-wide"
              placeholder={CONFIRMATION_WORD}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="press-effect flex-1 py-2.5 rounded-xl glass-soft hover:bg-white/10 text-sm font-semibold text-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isMatch || loading}
              className={`press-effect flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
                isMatch && !loading
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-red-600/30 text-red-400/60 cursor-not-allowed'
              }`}
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

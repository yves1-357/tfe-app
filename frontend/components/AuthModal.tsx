'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AuthUser } from '@/types';
import { getCurrentUser, loginUser, registerUser } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, mode, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const title = useMemo(() => (mode === 'login' ? 'Login' : 'Register'), [mode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setName('');
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setError(null);

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser(name.trim(), email.trim(), password);
      }

      await loginUser(email.trim(), password);
      const user = await getCurrentUser();
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

        <div className="auth-modal-shell relative rounded-[28px] px-5 pt-5 pb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="lg-text text-xl font-bold text-1">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="hover-surface press-effect w-9 h-9 flex items-center justify-center rounded-xl text-2"
              aria-label="Close authentication panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">

            {mode === 'register' && (
                    <div>
      <label htmlFor="auth-name" className="block text-xs text-2 mb-1.5">
        Name
      </label>
      <input
        id="auth-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="no-autofill w-full rounded-xl px-3.5 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-blue-500/50"
        placeholder=""
        autoComplete="name"
        required
      />
    </div>)}
            
            <div>
              <label htmlFor="auth-email" className="block text-xs text-2 mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="no-autofill w-full rounded-xl px-3.5 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder=""
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs text-2 mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="no-autofill w-full rounded-xl px-3.5 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder=""
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {mode === 'register' && (
                
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs text-2 mb-1.5">
                  Confirm password
                </label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="no-autofill w-full rounded-xl px-3.5 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder=""
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`press-effect w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors ${
                loading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {loading ? 'Please wait...' : title}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

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

/** Icône œil / œil barré, utilisée pour basculer la visibilité d'un mot de passe. */
function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    // Œil barré : le mot de passe est actuellement visible, cliquer le masque.
    return (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
      </svg>
    );
  }
  // Œil ouvert : le mot de passe est actuellement masqué, cliquer le révèle.
  return (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/** Champ mot de passe avec bouton  pour basculer sa visibilité. */
function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs text-2 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="no-autofill w-full rounded-xl pl-3.5 pr-11 py-2.5 text-sm text-1 input-surface outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder=""
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-2 hover:text-1 transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          tabIndex={-1}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </div>
  );
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

            <PasswordField
              id="auth-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {mode === 'register' && (
              <PasswordField
                id="auth-confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
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

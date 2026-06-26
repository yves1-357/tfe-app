'use client';

import { useState } from 'react';

interface AddStopInputProps {
  onAddStop: (address: string) => void;
}

export default function AddStopInput({ onAddStop }: AddStopInputProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAddStop(address.trim());
      setAddress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="flex gap-2">
        <div className="input-surface flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-2xl focus-within:ring-1 focus-within:ring-white/15 transition">
          <svg className="flex-shrink-0 w-[18px] h-[18px] text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address or place"
            className="no-autofill flex-1 min-w-0 bg-transparent text-1 text-[15px] placeholder-gray-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!address.trim()}
          className="press-effect px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold rounded-2xl transition-colors"
        >
          Add
        </button>
      </div>
    </form>
  );
}

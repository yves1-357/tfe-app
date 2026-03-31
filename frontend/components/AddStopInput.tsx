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
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address or place"
            className="w-full pl-10 pr-4 py-3 bg-[#1e2130] border border-gray-700/30 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition"
          />
        </div>
        <button
          type="submit"
          className="press-effect px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-sm shadow-blue-600/20"
        >
          Add
        </button>
      </div>
    </form>
  );
}

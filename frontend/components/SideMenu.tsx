'use client';

import { useState } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <>
      {/* Backdrop - fixed to cover full viewport */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Menu */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-80 max-w-[85%] backdrop-blur-2xl border-r z-50 transform transition-all duration-300 ease-in-out shadow-[8px_0_40px_rgba(0,0,0,0.6)] ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        } ${
          isDarkMode 
            ? 'bg-gray-900/50 border-white/10' 
            : 'bg-white/90 border-gray-300'
        }`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(to right, rgba(17, 24, 39, 0.5), rgba(17, 24, 39, 0.6))' 
            : 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.98))',
        }}
      >
        <div className="flex flex-col h-full py-12 px-8">
          {/* App Title - Large */}
          <div className="mb-48 pl-4">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Next</span>
              <span className="text-blue-500">Stop</span>
            </h1>
          </div>

          {/* Hamburger Button */}
          <button
            type="button"
            onClick={onClose}
            className={`flex items-center gap-5 w-full p-4 rounded-lg transition-colors mb-48 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
            aria-label="Close menu"
          >
            <svg className={`w-7 h-20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu</span>
          </button>

          {/* User Section */}
          <div className="mb-48">
            <button
              type="button"
              onClick={() => setUserPanelOpen(!userPanelOpen)}
              className={`flex items-center gap-5 w-full p-4 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <svg className={`w-7 h-20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User</span>
            </button>
            
            {/* User Panel Expansion */}
            {userPanelOpen && (
              <div className={`mt-4 ml-12 p-4 rounded-lg border ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="mb-3">
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>John Doe</p>
                </div>
                <div>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plan</p>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free</p>
                </div>
              </div>
            )}
          </div>

          {/* Saved */}
          <button
            type="button"
            className={`flex items-center gap-5 w-full p-4 rounded-lg transition-colors mb-48 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <svg className={`w-7 h-20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Saved</span>
          </button>

          {/* Recents */}
          <button
            type="button"
            className={`flex items-center gap-5 w-full p-4 rounded-lg transition-colors mb-48 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <svg className={`w-7 h-20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recents</span>
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center justify-between w-full p-4 rounded-lg transition-colors mb-48 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-5">
              {isDarkMode ? (
                <svg className={`w-7 h-20 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className={`w-7 h-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-400'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform m-0.5 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Get App Button */}
          <button
            type="button"
            className={`flex items-center justify-center gap-4 w-full p-4 rounded-lg transition-colors border ${
              isDarkMode 
                ? 'border-white/10 hover:bg-white/10' 
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Get App</span>
          </button>
        </div>
      </div>
    </>
  );
}

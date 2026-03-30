'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [apiMessage, setApiMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => {
        setApiMessage(data.message);
        setLoading(false);
      })
      .catch(err => {
        setApiMessage('Erreur de connexion au backend');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 TFE Route App
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300">
              Application Début - Next.js + FastAPI
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Frontend Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform transition hover:scale-105">
              <div className="text-5xl mb-4">⚛️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Frontend
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Next.js + React + TypeScript
              </p>
              <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-semibold">
                ✓ Actif
              </div>
            </div>

            {/* Backend Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform transition hover:scale-105">
              <div className="text-5xl mb-4">🐍</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Backend
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                FastAPI + Python
              </p>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${
                loading 
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                  : apiMessage.includes('Erreur')
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {loading ? '⏳ Connexion...' : apiMessage.includes('Erreur') ? '✗ Erreur' : '✓ Actif'}
              </div>
            </div>
          </div>

          {/* API Response */}
          {!loading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📡 Réponse du Backend
              </h3>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 font-mono text-left">
                <code className="text-gray-800 dark:text-gray-200">
                  {JSON.stringify({ message: apiMessage }, null, 2)}
                </code>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              🎉 Lapplication est lancée !
            </h3>
            <div className="text-left text-blue-800 dark:text-blue-200 space-y-2">
              <p>✓ Frontend: <span className="font-mono">http://localhost:3000</span></p>
              <p>✓ Backend API: <span className="font-mono">http://localhost:8000</span></p>
              <p>✓ API Docs: <span className="font-mono">http://localhost:8000/docs</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

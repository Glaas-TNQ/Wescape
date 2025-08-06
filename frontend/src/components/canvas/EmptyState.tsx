import React from 'react';
import { useCanvasStore } from '../../stores/canvasStore';

const EmptyState: React.FC = () => {
  const { loadSampleData } = useCanvasStore();

  const handleLoadSample = () => {
    loadSampleData();
    // Show toast
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Dati di esempio caricati!', type: 'success' } 
    }));
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-md mx-auto pointer-events-auto">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Canvas Icon */}
            <div className="w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-600/20 rounded-2xl border-2 border-dashed border-gray-600/50 flex items-center justify-center">
              <div className="text-4xl opacity-40">🎨</div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-sm animate-bounce" style={{ animationDelay: '0s' }}>
              📍
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-sm animate-bounce" style={{ animationDelay: '0.5s' }}>
              🎯
            </div>
            <div className="absolute top-1/2 -left-4 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center text-xs animate-bounce" style={{ animationDelay: '1s' }}>
              🍽️
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Il tuo canvas è vuoto
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Inizia a creare il tuo itinerario di viaggio aggiungendo destinazioni, attività, ristoranti e hotel. 
          Usa la toolbar a sinistra per aggiungere elementi.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleLoadSample}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all transform hover:scale-105"
          >
            📋 Carica Esempio
          </button>
          
          <button
            onClick={() => {
              // Trigger add destination
              window.dispatchEvent(new CustomEvent('showToast', { 
                detail: { message: 'Usa la toolbar a sinistra per aggiungere nodi!', type: 'info' } 
              }));
            }}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white font-medium transition-all"
          >
            📍 Inizia da Qui
          </button>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <span>🖱️</span>
              <span>Trascina per spostare</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔗</span>
              <span>Connetti i nodi</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✏️</span>
              <span>Doppio click per modificare</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
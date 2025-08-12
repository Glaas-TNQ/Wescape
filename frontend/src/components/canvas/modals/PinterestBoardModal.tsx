import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { PinterestBoardNodeData } from '../nodes/PinterestBoardNode';

interface PinterestBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardData: PinterestBoardNodeData | null;
  nodeId: string | null;
}

const PinterestBoardModal: React.FC<PinterestBoardModalProps> = ({ 
  isOpen, 
  onClose, 
  boardData,
  nodeId
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const { isDark } = useTheme();

  const handleImageError = (pinId: string) => {
    setImageErrors(prev => new Set([...prev, pinId]));
  };

  const handlePinClick = (pin: any) => {
    setSelectedPin(selectedPin?.id === pin.id ? null : pin);
  };

  const openPinterestUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen || !boardData) return null;

  const allPins = boardData.previewPins || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl flex flex-col
        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-red-600 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📌</span>
            <div>
              <h2 className="text-xl font-semibold">{boardData.boardName}</h2>
              <p className="text-sm opacity-90">
                {boardData.pinCount || allPins.length} pin{(boardData.pinCount || allPins.length) !== 1 ? 's' : ''} • Pinterest Collection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-light"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Description */}
          {boardData.description && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {boardData.description}
              </p>
            </div>
          )}

          {/* Pins Grid */}
          <div className="p-6">
            {allPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📌</div>
                <h3 className="text-lg font-medium mb-2">Nessuna pin disponibile</h3>
                <p className="text-sm text-center">
                  Questa board non ha pin da mostrare o non sono state caricate.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allPins.map((pin, index) => (
                  <div 
                    key={pin.id}
                    className={`
                      relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden 
                      aspect-[3/4] group cursor-pointer transition-all duration-200
                      ${selectedPin?.id === pin.id ? 'ring-2 ring-red-500 scale-105' : 'hover:scale-105'}
                    `}
                    onClick={() => handlePinClick(pin)}
                  >
                    {/* Pin number */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10">
                      #{index + 1}
                    </div>

                    {/* Image */}
                    {imageErrors.has(pin.id) ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <span className="text-3xl block mb-2">📷</span>
                          <span className="text-xs">Immagine non disponibile</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={pin.imageUrl}
                        alt={pin.title || 'Pinterest pin'}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(pin.id)}
                        loading="lazy"
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-2">
                          <span className="text-lg font-bold text-red-600">📌</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    {pin.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3">
                        <div className="text-sm font-medium line-clamp-2">
                          {pin.title}
                        </div>
                      </div>
                    )}

                    {/* Selected indicator */}
                    {selectedPin?.id === pin.id && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Selected Pin Details - Inside scrollable area */}
            {selectedPin && (
              <div className="mt-6 border-t-4 border-red-500 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 shadow-inner rounded-lg">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400">Pin Selezionata</h3>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 shadow-md border-2 border-red-200 dark:border-red-800">
                      {!imageErrors.has(selectedPin.id) ? (
                        <img
                          src={selectedPin.imageUrl}
                          alt={selectedPin.title || 'Pinterest pin'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <span className="text-2xl">📷</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">
                        {selectedPin.title || 'Pinterest Pin'}
                      </h4>
                      
                      {selectedPin.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-base mb-4 leading-relaxed">
                          {selectedPin.description}
                        </p>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => openPinterestUrl(selectedPin.url)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <span className="text-lg">📌</span>
                          Visualizza su Pinterest
                        </button>
                        
                        <button
                          onClick={() => setSelectedPin(null)}
                          className="inline-flex items-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200"
                        >
                          <span>✕</span>
                          Deseleziona
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-red-100 dark:border-red-900 bg-white dark:bg-gray-800">
          <div className="text-base font-medium text-gray-700 dark:text-gray-300">
            {allPins.length} pin{allPins.length !== 1 ? 's' : ''} in questa collection
          </div>
          <div className="flex gap-3">
            {boardData.boardUrl && (
              <button
                onClick={() => openPinterestUrl(boardData.boardUrl)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="text-lg">📌</span>
                Apri Board su Pinterest
              </button>
            )}
            <button
              onClick={onClose}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg
                ${isDark
                  ? 'bg-white text-gray-800 hover:bg-gray-100'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
                }
              `}
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinterestBoardModal;
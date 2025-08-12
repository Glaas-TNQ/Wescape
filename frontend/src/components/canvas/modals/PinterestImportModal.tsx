import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { usePinterest } from '../../../hooks/usePinterest';
import { PinterestService } from '../../../services/pinterestService';

interface PinterestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

const PinterestImportModal: React.FC<PinterestImportModalProps> = ({ 
  isOpen, 
  onClose, 
  position = { x: 100, y: 100 }
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlInfo, setUrlInfo] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { isDark } = useTheme();
  const { importFromUrl, validateUrl, parseUrl, importSamplePin, importSampleBoard } = usePinterest();

  // Validate URL as user types
  useEffect(() => {
    if (url) {
      const parsed = parseUrl(url);
      setUrlInfo(parsed);
      setShowPreview(parsed?.isValid || false);
    } else {
      setUrlInfo(null);
      setShowPreview(false);
    }
  }, [url, parseUrl]);

  const handleImport = async () => {
    if (!url || !validateUrl(url)) {
      return;
    }

    setIsLoading(true);
    try {
      await importFromUrl(url, position);
      setUrl('');
      setShowPreview(false);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSamplePin = async () => {
    setIsLoading(true);
    try {
      await importSamplePin(position);
      onClose();
    } catch (error) {
      console.error('Sample pin import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleBoard = async () => {
    setIsLoading(true);
    try {
      await importSampleBoard(position);
      onClose();
    } catch (error) {
      console.error('Sample board import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && PinterestService.isPinterestUrl(text)) {
        setUrl(text);
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        w-full max-w-md mx-4 rounded-lg shadow-xl
        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📌</span>
            <h2 className="text-xl font-semibold">Importa da Pinterest</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* URL Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                URL Pinterest
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://pinterest.com/pin/..."
                  className={`
                    flex-1 px-3 py-2 border rounded-lg
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    focus:ring-2 focus:ring-red-500 focus:border-red-500
                  `}
                />
                <button
                  onClick={handlePaste}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium
                    ${isDark
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  Incolla
                </button>
              </div>
            </div>

            {/* URL Validation Feedback */}
            {url && (
              <div className={`text-sm ${
                urlInfo?.isValid 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {urlInfo?.isValid ? (
                  <span>✓ URL Pinterest valido ({urlInfo.type})</span>
                ) : (
                  <span>✗ URL Pinterest non valido</span>
                )}
              </div>
            )}

            {/* Preview */}
            {showPreview && urlInfo && (
              <div className={`
                p-3 rounded-lg border
                ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
              `}>
                <h3 className="font-medium text-sm mb-2">Anteprima Importazione</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Tipo:</strong> {urlInfo.type === 'pin' ? 'Pin singolo' : 'Board/Collezione'}</p>
                  <p><strong>ID:</strong> {urlInfo.id}</p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
              <span className="px-3 text-sm text-gray-500">oppure</span>
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            </div>

            {/* Sample Data Options */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Importa Esempi di Test</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleSamplePin}
                  disabled={isLoading}
                  className={`
                    flex-1 px-4 py-3 rounded-lg text-sm font-medium
                    ${isDark
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white'
                    }
                    disabled:cursor-not-allowed transition-colors
                  `}
                >
                  📌 Pin Esempio
                </button>
                <button
                  onClick={handleSampleBoard}
                  disabled={isLoading}
                  className={`
                    flex-1 px-4 py-3 rounded-lg text-sm font-medium
                    ${isDark
                      ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white'
                    }
                    disabled:cursor-not-allowed transition-colors
                  `}
                >
                  📋 Board Esempio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium
              ${isDark
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
              disabled:cursor-not-allowed
            `}
          >
            Annulla
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !url || !urlInfo?.isValid}
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium
              bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white
              disabled:cursor-not-allowed transition-colors
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Importazione...
              </span>
            ) : (
              'Importa'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinterestImportModal;
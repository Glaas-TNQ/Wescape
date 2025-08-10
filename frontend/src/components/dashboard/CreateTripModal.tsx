import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
  loading?: boolean;
}

const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { isDark } = useTheme();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    await onSubmit(name.trim(), description.trim() || undefined);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className={`
        w-full max-w-md p-6 rounded-xl border backdrop-blur-sm
        transition-all duration-300 scale-100
        ${isDark
          ? 'bg-gray-900/90 border-white/10'
          : 'bg-white/95 border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`
            text-xl font-bold
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Crea nuovo trip
          </h2>
          
          <button
            onClick={onClose}
            disabled={loading}
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isDark
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Nome del trip *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Viaggio in Giappone, Weekend a Parigi..."
              disabled={loading}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Descrizione (opzionale)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi dettagli sul tuo trip: destinazioni, durata, tipo di viaggio..."
              disabled={loading}
              rows={3}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              maxLength={300}
            />
            <div className={`
              text-xs mt-1 text-right
              ${isDark ? 'text-white/50' : 'text-gray-500'}
            `}>
              {description.length}/300
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isDark
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Annulla
            </button>
            
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creazione...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 Crea trip
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripModal;
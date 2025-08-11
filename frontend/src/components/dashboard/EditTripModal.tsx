import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastContext } from '../../contexts/ToastContext';
import type { Trip } from '../../hooks/useTrips';

interface EditTripModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tripId: string, title: string, description?: string) => Promise<void>;
  loading?: boolean;
}

const EditTripModal: React.FC<EditTripModalProps> = ({
  trip,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isDark } = useTheme();
  const { showToast } = useToastContext();

  // Reset form when trip changes or modal opens
  useEffect(() => {
    if (isOpen && trip) {
      setName(trip.title || '');
      setDescription(trip.description || '');
    }
  }, [isOpen, trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;
    
    if (!name.trim()) {
      showToast('Il nome del trip è obbligatorio', 'error');
      return;
    }

    if (name.trim().length > 100) {
      showToast('Il nome del trip non può superare i 100 caratteri', 'error');
      return;
    }

    if (description && description.length > 500) {
      showToast('La descrizione non può superare i 500 caratteri', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trip.id, name.trim(), description.trim() || undefined);
      showToast('Trip aggiornato con successo!', 'success');
      onClose();
    } catch (error) {
      showToast('Errore nell\'aggiornamento del trip', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          w-full max-w-md rounded-2xl p-6 space-y-6 border
          ${isDark 
            ? 'bg-black border-white/10' 
            : 'bg-white border-gray-200'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className={`
            text-xl font-bold
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Modifica Trip
          </h2>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting || loading}
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              ${isDark 
                ? 'text-white/60 hover:text-white hover:bg-white/10' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
              ${(isSubmitting || loading) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip Name */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Nome Trip
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Weekend a Parigi"
              maxLength={100}
              disabled={isSubmitting || loading}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${(isSubmitting || loading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`
                text-xs
                ${isDark ? 'text-white/50' : 'text-gray-400'}
              `}>
                {(name || '').length}/100 caratteri
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Descrizione (opzionale)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi il tuo trip..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting || loading}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${(isSubmitting || loading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`
                text-xs
                ${isDark ? 'text-white/50' : 'text-gray-400'}
              `}>
                {(description || '').length}/500 caratteri
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || loading}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium transition-all
                border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/50
                ${isDark
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }
                ${(isSubmitting || loading) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Annulla
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || loading || !name.trim()}
              className={`
                flex-1 px-4 py-3 rounded-lg font-medium transition-all
                hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                flex items-center justify-center gap-2
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
                ${(isSubmitting || loading || !name.trim()) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
                }
              `}
            >
              {(isSubmitting || loading) && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {isSubmitting || loading ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTripModal;
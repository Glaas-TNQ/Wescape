import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Trip } from '../../hooks/useTrips';

interface DeleteTripConfirmationProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tripId: string) => Promise<void>;
  loading?: boolean;
}

const DeleteTripConfirmation: React.FC<DeleteTripConfirmationProps> = ({
  trip,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { isDark } = useTheme();

  const handleConfirm = async () => {
    if (!trip) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(trip.id);
      onClose();
    } catch (error) {
      // Error handling is managed by the parent component/hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && !loading) {
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
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${isDark ? 'bg-red-500/20' : 'bg-red-100'}
            `}>
              <span className="text-2xl">🗑️</span>
            </div>
            <h2 className={`
              text-xl font-bold
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Elimina Trip
            </h2>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isDeleting || loading}
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              ${isDark 
                ? 'text-white/60 hover:text-white hover:bg-white/10' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
              ${(isDeleting || loading) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg border
            ${isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-gray-50 border-gray-200'
            }
          `}>
            <h3 className={`
              font-semibold mb-2
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              {trip.name || 'Trip senza nome'}
            </h3>
            {trip.description && (
              <p className={`
                text-sm
                ${isDark ? 'text-white/70' : 'text-gray-600'}
              `}>
                {trip.description}
              </p>
            )}
            <div className={`
              text-xs mt-2 flex items-center gap-2
              ${isDark ? 'text-white/50' : 'text-gray-400'}
            `}>
              <span>🗓️</span>
              <span>
                Creato il {new Date(trip.created_at).toLocaleDateString('it-IT')}
              </span>
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border-l-4 border-red-500
            ${isDark 
              ? 'bg-red-500/10 border-red-500/20' 
              : 'bg-red-50 border-red-500'
            }
          `}>
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <div>
                <h4 className={`
                  font-medium mb-1
                  ${isDark ? 'text-red-400' : 'text-red-700'}
                `}>
                  Attenzione
                </h4>
                <p className={`
                  text-sm
                  ${isDark ? 'text-red-300' : 'text-red-600'}
                `}>
                  Questa azione non può essere annullata. Tutti i dati del trip, inclusi i canvas e le pianificazioni, verranno eliminati permanentemente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting || loading}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/50
              ${isDark
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }
              ${(isDeleting || loading) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Annulla
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting || loading}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50
              flex items-center justify-center gap-2
              ${isDark
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
              ${(isDeleting || loading) 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
              }
            `}
          >
            {(isDeleting || loading) && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {isDeleting || loading ? 'Eliminazione...' : 'Elimina Definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTripConfirmation;
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Trip } from '../../hooks/useTrips';

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick, onEdit, onDelete }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button[data-action]')) {
      return;
    }
    onClick(trip);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative p-6 rounded-xl border backdrop-blur-sm cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${isDark
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 shadow-sm'
        }
      `}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {onEdit && (
          <button
            data-action="edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trip);
            }}
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              ${isDark
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }
            `}
            title="Modifica trip"
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            data-action="delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip);
            }}
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              ${isDark
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                : 'bg-red-100 hover:bg-red-200 text-red-600'
              }
            `}
            title="Elimina trip"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Trip content */}
      <div className="space-y-3">
        <div className="flex items-start justify-between pr-16">
          <h3 className={`
            text-xl font-bold line-clamp-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            {trip.name}
          </h3>
        </div>

        {trip.description && (
          <p className={`
            text-sm line-clamp-3
            ${isDark ? 'text-white/70' : 'text-gray-600'}
          `}>
            {trip.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className={`
            text-xs px-2 py-1 rounded-full
            ${isDark
              ? 'bg-green-500/20 text-green-300'
              : 'bg-green-100 text-green-600'
            }
          `}>
            🗺️ Trip
          </div>

          <div className={`
            text-xs
            ${isDark ? 'text-white/50' : 'text-gray-500'}
          `}>
            {formatDate(trip.updated_at)}
          </div>
        </div>

        {/* Visual indicator for interactive element */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r
          from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100
          transition-opacity rounded-b-xl
        `} />
      </div>
    </div>
  );
};

export default TripCard;
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Trip } from '../../hooks/useTrips';
import TripCard from './TripCard';

interface TripsListProps {
  trips: Trip[];
  loading: boolean;
  onTripClick: (trip: Trip) => void;
  onTripEdit?: (trip: Trip) => void;
  onTripDelete?: (trip: Trip) => void;
  onCreateTrip: () => void;
}

const TripsList: React.FC<TripsListProps> = ({
  trips,
  loading,
  onTripClick,
  onTripEdit,
  onTripDelete,
  onCreateTrip,
}) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Caricamento dei tuoi trip...
        </p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        {/* Empty state illustration */}
        <div className={`
          w-24 h-24 rounded-full flex items-center justify-center text-4xl
          ${isDark ? 'bg-white/5' : 'bg-gray-100'}
        `}>
          🗺️
        </div>

        <div className="text-center space-y-2">
          <h3 className={`
            text-xl font-semibold
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Nessun trip ancora
          </h3>
          <p className={`
            text-sm max-w-md
            ${isDark ? 'text-white/60' : 'text-gray-600'}
          `}>
            Crea il tuo primo trip per iniziare a pianificare avventure incredibili con l'aiuto dell'IA.
          </p>
        </div>

        <button
          onClick={onCreateTrip}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            ${isDark
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          🚀 Crea il tuo primo trip
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`
            text-2xl font-bold
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            I tuoi trip
          </h2>
          <p className={`
            text-sm mt-1
            ${isDark ? 'text-white/60' : 'text-gray-600'}
          `}>
            {trips.length} trip{trips.length !== 1 ? 's' : ''} creato{trips.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={onCreateTrip}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all hover:scale-105
            flex items-center gap-2 border
            ${isDark
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
            }
          `}
        >
          <span className="text-lg">+</span>
          Nuovo trip
        </button>
      </div>

      {/* Trips grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onClick={onTripClick}
            onEdit={onTripEdit}
            onDelete={onTripDelete}
          />
        ))}
      </div>

      {/* Show create button at the end if there are trips */}
      {trips.length > 0 && trips.length % 4 === 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onCreateTrip}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all hover:scale-105
              border-2 border-dashed flex items-center gap-3
              ${isDark
                ? 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
              }
            `}
          >
            <span className="text-2xl">+</span>
            <span>Crea un nuovo trip</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TripsList;
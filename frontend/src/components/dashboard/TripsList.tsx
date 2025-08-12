import React from 'react';
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-2 border-wescape-brand/30 border-t-wescape-brand rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-wescape-muted">
          Caricamento dei tuoi trip...
        </p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        {/* Empty state illustration */}
        <div className="w-24 h-24 rounded-full glass-effect flex items-center justify-center text-4xl">
          🗺️
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-wescape-text">
            Nessun trip ancora
          </h3>
          <p className="text-sm max-w-md text-wescape-muted">
            Crea il tuo primo trip per iniziare a pianificare avventure incredibili con l'aiuto dell'IA.
          </p>
        </div>

        <button
          onClick={onCreateTrip}
          className="px-6 py-3 rounded-wescape font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 glass-effect-strong text-wescape-text hover:text-white wescape-hover"
          style={{ background: 'linear-gradient(180deg, var(--wescape-brand), var(--wescape-brand-quiet))' }}
        >
          <span className="flex items-center gap-2">
            🚀 Crea il tuo primo trip
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wescape-text tracking-wide">
            I tuoi trip
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-wescape-success" 
                  style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)' }}></span>
            <p className="text-sm text-wescape-muted">
              {trips.length} trip{trips.length !== 1 ? 's' : ''} creato{trips.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={onCreateTrip}
          className="px-4 py-2 rounded-wescape font-medium transition-all hover:scale-105 flex items-center gap-2 glass-effect-strong text-wescape-text hover:text-white wescape-hover"
          style={{ background: 'linear-gradient(180deg, var(--wescape-brand), var(--wescape-brand-quiet))' }}
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
            className="px-6 py-3 rounded-wescape font-medium transition-all hover:scale-105 border-2 border-dashed flex items-center gap-3 border-wescape-border text-wescape-muted hover:border-wescape-brand/40 hover:text-wescape-text glass-effect"
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
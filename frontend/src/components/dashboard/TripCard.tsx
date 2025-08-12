import React from 'react';
import type { Trip } from '../../hooks/useTrips';

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick, onEdit, onDelete }) => {
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
    <article
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-wescape cursor-pointer glass-effect wescape-hover min-h-[180px] stagger-animation"
      style={{ padding: '18px' }}
    >
      {/* Cover Image */}
      {trip.cover_image && (
        <div className="absolute inset-0 z-0">
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-20">
        {onEdit && (
          <button
            data-action="edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trip);
            }}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 glass-effect-strong text-wescape-text hover:text-white"
            title="Modifica trip"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            data-action="delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip);
            }}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 glass-effect-strong text-red-400 hover:text-red-300"
            title="Elimina trip"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Selection indicator */}
      <div className="absolute top-3 left-3 w-6 h-6 rounded-full border border-wescape-border bg-black/35 hidden group-hover:grid place-items-center transition-all duration-300 z-10"
           style={{ boxShadow: 'var(--wescape-shadow)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="m5 13 4 4 10-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Card content */}
      <div className="relative z-10 flex flex-col gap-3 h-full">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-wescape-success shadow-sm pulse-glow"
               style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)' }}></div>
          <span className="text-xs text-wescape-muted font-medium">Attivo</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-wescape-text line-clamp-2 mb-1 leading-tight">
          {trip.title}
        </h3>

        {/* Description */}
        {trip.description && (
          <p className="text-sm text-wescape-muted line-clamp-3 leading-relaxed">
            {trip.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" 
                  style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)' }}></span>
            <span className="text-xs text-wescape-muted">
              {formatDate(trip.updated_at)}
            </span>
          </div>
          
          <button 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded-lg hover:bg-wescape-panel-strong text-wescape-muted hover:text-wescape-text"
            title="Opzioni"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="5" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Hover gradient indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-wescape-brand to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-wescape"></div>
      </div>
    </article>
  );
};

export default TripCard;
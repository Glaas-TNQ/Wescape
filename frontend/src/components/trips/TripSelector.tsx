import React, { useState } from 'react';
import { useUserTrips } from '../../hooks/useTripData';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import EditableText from '../ui/EditableText';

interface TripSelectorProps {
  currentTripId?: string;
  onTripSelect: (tripId: string) => void;
  onNewTrip: () => void;
}

const TripSelector: React.FC<TripSelectorProps> = ({
  currentTripId,
  onTripSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const { trips, isLoading, createTrip, updateTrip } = useUserTrips();
  const { toast } = useToast();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark);

  const currentTrip = trips?.find(trip => trip.id === currentTripId);

  const handleCreateTrip = async () => {
    try {
      const newTrip = await createTrip({
        title: 'New Trip',
        description: 'Plan your next adventure',
        currency: 'EUR',
        visibility: 'private',
      });
      
      if (newTrip) {
        onTripSelect(newTrip.id);
      }
      setIsOpen(false);
      toast.success('New trip created!');
    } catch (error) {
      toast.error('Failed to create trip');
    }
  };

  const handleTripTitleUpdate = async (tripId: string, newTitle: string) => {
    try {
      await updateTrip({
        tripId,
        tripData: { title: newTitle }
      });
      toast.success('Trip title updated!');
      setEditingTripId(null);
    } catch (error) {
      toast.error('Failed to update trip title');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span style={{ color: themeColors.text.secondary }}>Loading trips...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:scale-105"
        style={{
          backgroundColor: themeColors.interactive.hover,
          borderColor: themeColors.border.secondary,
          color: themeColors.text.primary,
        }}
      >
        <span className="text-lg">🗺️</span>
        <span className="font-medium">
          {currentTrip?.title || 'Select Trip'}
        </span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-full left-0 mt-2 w-80 rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50"
            style={{
              backgroundColor: themeColors.surface.primary,
              borderColor: themeColors.border.primary,
            }}
          >
            <div className="p-3 border-b" style={{ borderColor: themeColors.border.secondary }}>
              <button
                onClick={handleCreateTrip}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: themeColors.text.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-xl">➕</span>
                <div className="text-left">
                  <div className="font-medium">Create New Trip</div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Start planning your next adventure
                  </div>
                </div>
              </button>
            </div>

            <div className="p-2">
              {trips && trips.length > 0 ? (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className={`w-full rounded-lg transition-colors ${
                      trip.id === currentTripId ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    style={{
                      backgroundColor: trip.id === currentTripId 
                        ? themeColors.interactive.active 
                        : 'transparent',
                      color: themeColors.text.primary,
                    }}
                    onMouseEnter={(e) => {
                      if (trip.id !== currentTripId) {
                        e.currentTarget.style.backgroundColor = themeColors.interactive.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (trip.id !== currentTripId) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 px-3 py-3">
                      <button
                        onClick={() => {
                          onTripSelect(trip.id);
                          setIsOpen(false);
                        }}
                        className="flex items-start gap-3 flex-1 text-left"
                        style={{ color: themeColors.text.primary }}
                      >
                        <span className="text-xl mt-0.5">
                          {trip.destination ? '🏛️' : '🗺️'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {editingTripId === trip.id ? (
                              <EditableText
                                value={trip.title}
                                onSave={(newTitle) => handleTripTitleUpdate(trip.id, newTitle)}
                                className="font-medium"
                                placeholder="Trip Name"
                                isEditing={true}
                                onEditingChange={(isEditing) => {
                                  if (!isEditing) setEditingTripId(null);
                                }}
                              />
                            ) : (
                              trip.title
                            )}
                          </div>
                          <div 
                            className="text-sm truncate mt-0.5" 
                            style={{ color: themeColors.text.secondary }}
                          >
                            {trip.destination || trip.description || 'No description'}
                          </div>
                          <div 
                            className="text-xs mt-1" 
                            style={{ color: themeColors.text.tertiary }}
                          >
                            Updated {new Date(trip.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                      {editingTripId !== trip.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTripId(trip.id);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: themeColors.text.secondary,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = themeColors.interactive.hover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Rename trip"
                        >
                          <span className="text-sm">✏️</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  className="text-center py-6" 
                  style={{ color: themeColors.text.secondary }}
                >
                  <div className="text-4xl mb-2">🏔️</div>
                  <div className="font-medium">No trips yet</div>
                  <div className="text-sm">Create your first trip to get started</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TripSelector;
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrips } from '../hooks/useTrips';
import type { Trip } from '../hooks/useTrips';
import ThemeToggle from './ui/ThemeToggle';
import TripsList from './dashboard/TripsList';
import CreateTripModal from './dashboard/CreateTripModal';
import TripCanvas from './canvas/TripCanvas';

const Dashboard: React.FC = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const { trips, loading, createTrip } = useTrips();
  
  // Mock data for testing (when no trips exist)
  const mockTrips: Trip[] = user ? [
    {
      id: 'mock-1',
      user_id: user.id,
      name: 'Viaggio in Giappone',
      description: 'Un\'avventura di 2 settimane tra Tokyo, Kyoto e Osaka',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z',
    },
    {
      id: 'mock-2', 
      user_id: user.id,
      name: 'Weekend a Parigi',
      description: 'Escapade romantica nella città dell\'amore',
      created_at: '2024-02-01T09:00:00Z',
      updated_at: '2024-02-01T09:00:00Z',
    },
    {
      id: 'mock-3',
      user_id: user.id,
      name: 'Trekking in Patagonia',
      description: null,
      created_at: '2024-03-10T14:00:00Z',
      updated_at: '2024-03-12T11:00:00Z',
    }
  ] : [];

  const displayTrips = trips.length > 0 ? trips : mockTrips;

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleBackToDashboard = () => {
    setSelectedTrip(null);
  };

  const handleCreateTrip = async (name: string, description?: string) => {
    setCreateLoading(true);
    try {
      const newTrip = await createTrip(name, description);
      if (newTrip) {
        setShowCreateModal(false);
        // Optionally open the newly created trip
        // setSelectedTrip(newTrip);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTripEdit = (trip: Trip) => {
    // TODO: Implement trip editing modal
    console.log('Edit trip:', trip);
  };

  const handleTripDelete = (trip: Trip) => {
    // TODO: Implement trip deletion confirmation
    console.log('Delete trip:', trip);
  };

  // If a trip is selected, show the canvas
  if (selectedTrip) {
    return (
      <div className={`
        min-h-screen w-full transition-colors
        ${isDark ? 'bg-black' : 'bg-gray-50'}
      `}>
        {/* Canvas Header */}
        <header className={`
          flex items-center justify-between p-6 border-b
          ${isDark ? 'border-white/10' : 'border-gray-200'}
        `}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className={`
                p-2 rounded-lg transition-all hover:scale-110
                ${isDark 
                  ? 'text-white/60 hover:text-white hover:bg-white/10' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
              title="Torna alla dashboard"
            >
              ← 
            </button>
            <h1 className={`
              text-2xl font-bold
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              {selectedTrip.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`
              text-sm px-3 py-1 rounded-full
              ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}
            `}>
              {user?.email}
            </span>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 border
                ${isDark 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Canvas */}
        <main className="h-[calc(100vh-88px)] w-full">
          <TripCanvas />
        </main>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className={`
      min-h-screen w-full transition-colors
      ${isDark ? 'bg-black' : 'bg-gray-50'}
    `}>
      {/* Header */}
      <header className={`
        flex items-center justify-between p-6 border-b
        ${isDark ? 'border-white/10' : 'border-gray-200'}
      `}>
        <div className="flex items-center gap-4">
          <h1 className={`
            text-2xl font-bold
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            🗺️ WeScape
          </h1>
          <span className={`
            text-sm px-3 py-1 rounded-full
            ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}
          `}>
            {user?.email}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 border
              ${isDark 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <TripsList
            trips={displayTrips}
            loading={loading}
            onTripClick={handleTripClick}
            onTripEdit={handleTripEdit}
            onTripDelete={handleTripDelete}
            onCreateTrip={() => setShowCreateModal(true)}
          />
        </div>
      </main>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTrip}
        loading={createLoading}
      />
    </div>
  );
};

export default Dashboard;
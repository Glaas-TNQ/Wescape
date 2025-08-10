import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrips } from '../hooks/useTrips';
import type { Trip } from '../hooks/useTrips';
import { useCanvasStore } from '../stores/canvasStore';
import ThemeToggle from './ui/ThemeToggle';
import TripsList from './dashboard/TripsList';
import CreateTripModal from './dashboard/CreateTripModal';
import EditTripModal from './dashboard/EditTripModal';
import DeleteTripConfirmation from './dashboard/DeleteTripConfirmation';
import TripCanvas from './canvas/TripCanvas';

const Dashboard: React.FC = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();
  const { loadTripCanvas, saveTripCanvas, setCurrentTrip } = useCanvasStore();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTripClick = async (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentTrip(trip.id);
    await loadTripCanvas(trip.id);
  };

  const handleBackToDashboard = async () => {
    // Save current canvas state before returning to dashboard
    if (selectedTrip) {
      try {
        await saveTripCanvas(selectedTrip.id);
      } catch (error) {
        console.error('Error saving canvas before returning to dashboard:', error);
      }
    }
    setSelectedTrip(null);
    setCurrentTrip(null);
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
    setEditingTrip(trip);
    setShowEditModal(true);
  };

  const handleTripDelete = (trip: Trip) => {
    setDeletingTrip(trip);
    setShowDeleteModal(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId);
    setShowDeleteModal(false);
    setDeletingTrip(null);
  };

  const handleEditTrip = async (tripId: string, name: string, description?: string) => {
    const updatedTrip = await updateTrip(tripId, { name, description });
    if (updatedTrip) {
      setShowEditModal(false);
      setEditingTrip(null);
    }
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
            trips={trips}
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

      {/* Edit Trip Modal */}
      <EditTripModal
        trip={editingTrip}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTrip(null);
        }}
        onSubmit={handleEditTrip}
      />

      {/* Delete Trip Confirmation */}
      <DeleteTripConfirmation
        trip={deletingTrip}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingTrip(null);
        }}
        onConfirm={handleDeleteTrip}
      />
    </div>
  );
};

export default Dashboard;
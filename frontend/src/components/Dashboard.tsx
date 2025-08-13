import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrips } from '../hooks/useTrips';
import type { Trip } from '../hooks/useTrips';
import { useCanvasStore } from '../stores/canvasStore';
import ThemeToggle from './ui/ThemeToggle';
import VideoBackground from './ui/VideoBackground';
import TripsList from './dashboard/TripsList';
import CreateTripModal from './dashboard/CreateTripModal';
import EditTripModal from './dashboard/EditTripModal';
import DeleteTripConfirmation from './dashboard/DeleteTripConfirmation';
import TripCanvas from './canvas/TripCanvas';
import UserSettings from './settings/UserSettings';

const Dashboard: React.FC = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showSettings, setShowSettings] = useState(false);
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
        console.log('Canvas saved successfully');
      } catch (error) {
        console.error('Error saving canvas before returning to dashboard:', error);
      }
    }
    setSelectedTrip(null);
    setCurrentTrip(null);
    setShowSettings(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setSelectedTrip(null);
    setCurrentTrip(null);
  };

  const handleBackFromSettings = () => {
    setShowSettings(false);
  };

  const handleCreateTrip = async (title: string, description?: string, coverImage?: string) => {
    setCreateLoading(true);
    try {
      const newTrip = await createTrip(title, description, coverImage);
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

  const handleEditTrip = async (tripId: string, title: string, description?: string) => {
    const updatedTrip = await updateTrip(tripId, { title, description });
    if (updatedTrip) {
      setShowEditModal(false);
      setEditingTrip(null);
    }
  };

  // If settings is selected, show the settings page
  if (showSettings) {
    return <UserSettings onBack={handleBackFromSettings} />;
  }

  // If a trip is selected, show the canvas
  if (selectedTrip) {
    return (
      <TripCanvas 
        key={`trip-canvas-${selectedTrip.id}`} // Force re-mount when trip changes
        tripTitle={selectedTrip.title}
        onBackToDashboard={handleBackToDashboard}
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen w-full relative">
      {/* Video Background */}
      <VideoBackground />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b glass-effect-strong" style={{ borderColor: 'var(--wescape-border)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo_transparent.png" 
              alt="Triptify" 
              className="w-8 h-8 floating"
            />
            <h1 className="text-2xl font-bold text-wescape-text tracking-wide">
              Triptify
            </h1>
          </div>
          <div className="glass-effect px-3 py-1 rounded-full text-sm text-wescape-muted flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>{user?.email}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleShowSettings}
            className="p-2 rounded-lg transition-all hover:scale-110 text-wescape-muted hover:text-wescape-text glass-effect hover:glass-effect-strong"
            title="Impostazioni"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m16.5-3.5L19 7l-1.5-1.5M5 7 3.5 5.5M19 17l-1.5 1.5M5 17l1.5 1.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 glass-effect-strong text-wescape-text hover:text-white wescape-hover"
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
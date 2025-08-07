import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import TripCanvas from './components/canvas/TripCanvas';
import LoginModal from './components/auth/LoginModal';
import { useTripData } from './hooks/useTripData';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Main App Component (inside providers)
const AppContent = () => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | undefined>();

  // Use trip data hook
  const { tripData, isLoading: isTripLoading } = useTripData(currentTripId);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-6">✈️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            WeScape
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Your intelligent trip planning companion
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
          >
            Get Started
          </button>
        </div>
        
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <TripCanvas 
        currentTripId={currentTripId}
        onTripChange={setCurrentTripId}
        tripData={tripData}
        isTripLoading={isTripLoading}
      />
    </div>
  );
};

// App with all providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

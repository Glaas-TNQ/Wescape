import { useEffect } from 'react';
import TripCanvas from './components/canvas/TripCanvas';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  useEffect(() => {
    // Placeholder: could load env checks or future initialization
  }, []);

  return (
    <ThemeProvider>
      <div className="h-screen w-screen overflow-hidden">
        <TripCanvas />
      </div>
    </ThemeProvider>
  );
}

export default App;

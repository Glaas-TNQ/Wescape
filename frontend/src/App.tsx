import { useEffect } from 'react';
import TripCanvas from './components/canvas/TripCanvas';

function App() {
  useEffect(() => {
    // Placeholder: could load env checks or future initialization
  }, []);

  return (
    <div className="h-screen w-screen bg-black">
      <TripCanvas />
    </div>
  );
}

export default App;

import { useEffect } from 'react';
import CanvasMWP from './components/canvas/CanvasMWP';

function App() {
  useEffect(() => {
    // Placeholder: could load env checks or future initialization
  }, []);

  return (
    <div className="h-screen w-screen">
      <CanvasMWP />
    </div>
  );
}

export default App;

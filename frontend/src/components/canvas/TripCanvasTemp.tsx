import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const TripCanvasTemp: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`
      w-full h-full flex items-center justify-center
      ${isDark ? 'bg-gray-900' : 'bg-gray-100'}
    `}>
      <div className={`
        text-center p-8 rounded-lg border
        ${isDark ? 'bg-black border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}
      `}>
        <h2 className="text-2xl font-bold mb-4">Canvas Temporaneamente Disabilitato</h2>
        <p className="text-lg mb-4">
          Il canvas è temporaneamente disabilitato per testare le altre funzionalità.
        </p>
        <div className="text-sm opacity-60">
          ReactFlow export issue - risolveremo dopo il testing
        </div>
      </div>
    </div>
  );
};

export default TripCanvasTemp;
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-105 border
        ${isDark 
          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
          : 'bg-gray-800/10 border-gray-300 text-gray-800 hover:bg-gray-800/20'
        }
      `}
      title={`Cambia a ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <span className="flex items-center gap-2">
          ☀️ Light Mode
        </span>
      ) : (
        <span className="flex items-center gap-2">
          🌙 Dark Mode
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
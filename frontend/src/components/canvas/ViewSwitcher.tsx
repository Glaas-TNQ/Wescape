import React, { useState } from 'react';

type ViewMode = 'canvas' | 'timeline' | 'map' | 'budget';

interface ViewOption {
  key: ViewMode;
  icon: string;
  label: string;
  available: boolean;
}

const ViewSwitcher: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('canvas');

  const views: ViewOption[] = [
    { key: 'canvas', icon: '🎨', label: 'Canvas', available: true },
    { key: 'timeline', icon: '📅', label: 'Timeline', available: false },
    { key: 'map', icon: '🗺️', label: 'Mappa', available: false },
    { key: 'budget', icon: '💰', label: 'Budget', available: false },
  ];

  const handleViewChange = (viewKey: ViewMode) => {
    if (!views.find(v => v.key === viewKey)?.available) {
      // Show toast notification for unavailable views
      const viewLabel = views.find(v => v.key === viewKey)?.label;
      console.log(`${viewLabel} view coming soon!`);
      return;
    }
    
    setActiveView(viewKey);
  };

  return (
    <div className="flex gap-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10">
      {views.map(({ key, icon, label, available }) => (
        <button
          key={key}
          onClick={() => handleViewChange(key)}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
            ${activeView === key && available
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : available
              ? 'text-gray-300 hover:bg-white/10 hover:text-white'
              : 'text-gray-500 cursor-not-allowed opacity-60'
            }
          `}
          disabled={!available}
        >
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
          {!available && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
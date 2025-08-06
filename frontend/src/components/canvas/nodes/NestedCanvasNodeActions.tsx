import React, { useState } from 'react';

interface NestedCanvasNodeActionsProps {
  nodeId: string;
  nodeType: string;
  onOpenCanvas: () => void;
  currentColor?: string | null;
  onColorClick?: (position: { x: number; y: number }) => void;
}

const NestedCanvasNodeActions: React.FC<NestedCanvasNodeActionsProps> = ({ 
  nodeId, 
  nodeType, 
  onOpenCanvas,
  currentColor,
  onColorClick
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    // Per i nodi canvas annidato, edit significa aprire il canvas
    onOpenCanvas();
  };

  const handleDelete = () => {
    if (window.confirm(`Sei sicuro di voler eliminare questo ${nodeType.toLowerCase()}?`)) {
      window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId } }));
    }
  };

  const handleColorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onColorClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      onColorClick({
        x: rect.left,
        y: rect.bottom + 5,
      });
    }
  };

  return (
    <div
      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-1">
        {/* Color picker button */}
        {onColorClick && (
          <button 
            onClick={handleColorClick}
            className="w-8 h-8 bg-gray-900/90 hover:bg-purple-600 rounded-full border border-white/20 flex items-center justify-center text-sm transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
            title="Cambia colore"
          >
            🎨
          </button>
        )}
        
        {/* Edit button - opens nested canvas instead of edit modal */}
        <button
          onClick={handleEdit}
          className="w-8 h-8 bg-purple-600/90 hover:bg-purple-500 border border-purple-400/50 rounded-lg text-white flex items-center justify-center text-sm transition-all duration-200 hover:scale-110 shadow-lg"
          title="Apri Canvas Annidato"
        >
          🖼️
        </button>
        
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="w-8 h-8 bg-red-600/90 hover:bg-red-500 border border-red-400/50 rounded-lg text-white flex items-center justify-center text-sm transition-all duration-200 hover:scale-110 shadow-lg"
          title="Elimina Nodo"
        >
          🗑️
        </button>
      </div>
      
      {/* Tooltip */}
      {showActions && (
        <div className="absolute top-10 right-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap pointer-events-none z-50">
          🎨 Colore • 🖼️ Apri Canvas • 🗑️ Elimina
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default NestedCanvasNodeActions;
import React from 'react';

interface NodeActionsProps {
  nodeId: string;
  nodeType: string;
  currentColor?: string | null;
  onColorClick?: (position: { x: number; y: number }) => void;
}

const NodeActions: React.FC<NodeActionsProps> = ({ nodeId, nodeType, currentColor: _currentColor, onColorClick }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('editNode', { detail: { nodeId } }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
      {onColorClick && (
        <button 
          onClick={handleColorClick}
          className="w-7 h-7 bg-gray-900/90 hover:bg-purple-600 rounded-lg border border-white/20 flex items-center justify-center text-xs transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
          title="Cambia colore"
        >
          🎨
        </button>
      )}
      <button 
        onClick={handleEdit}
        className="w-7 h-7 bg-gray-900/90 hover:bg-indigo-600 rounded-lg border border-white/20 flex items-center justify-center text-xs transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
        title="Modifica nodo"
      >
        ✏️
      </button>
      <button 
        onClick={handleDelete}
        className="w-7 h-7 bg-gray-900/90 hover:bg-red-500 rounded-lg border border-white/20 flex items-center justify-center text-xs transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
        title="Elimina nodo"
      >
        🗑️
      </button>
    </div>
  );
};

export default NodeActions;
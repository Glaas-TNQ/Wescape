import React from 'react';

interface NodeActionsProps {
  nodeId: string;
  nodeType: string;
}

const NodeActions: React.FC<NodeActionsProps> = ({ nodeId, nodeType }) => {
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

  return (
    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
      <button 
        onClick={handleEdit}
        className="w-8 h-8 bg-gray-900/90 hover:bg-indigo-600 rounded-full border border-white/20 flex items-center justify-center text-sm transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
        title="Modifica nodo"
      >
        ✏️
      </button>
      <button 
        onClick={handleDelete}
        className="w-8 h-8 bg-gray-900/90 hover:bg-red-500 rounded-full border border-white/20 flex items-center justify-center text-sm transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
        title="Elimina nodo"
      >
        🗑️
      </button>
    </div>
  );
};

export default NodeActions;
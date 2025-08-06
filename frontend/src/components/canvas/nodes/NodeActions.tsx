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
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={handleEdit}
        className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded border border-white/20 flex items-center justify-center text-xs transition-colors"
      >
        ✏️
      </button>
      <button 
        onClick={handleDelete}
        className="w-6 h-6 bg-white/10 hover:bg-red-500/30 rounded border border-white/20 flex items-center justify-center text-xs transition-colors"
      >
        🗑️
      </button>
    </div>
  );
};

export default NodeActions;
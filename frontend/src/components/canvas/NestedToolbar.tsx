import React, { useState } from 'react';
import { type NodeType } from './nodes';

interface ToolButtonProps {
  type: NodeType;
  icon: string;
  label: string;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ type, icon, label, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="relative">
      <button
        className="w-11 h-11 bg-gray-800/90 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        draggable
        onDragStart={(event) => onDragStart(event, type)}
      >
        {icon}
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none z-50">
          {label}
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

interface NestedToolbarProps {
  onAddNode: (type: NodeType) => void;
  onAutoLayout: () => void;
  onClearCanvas: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const NestedToolbar: React.FC<NestedToolbarProps> = ({ 
  onAddNode, 
  onAutoLayout, 
  onClearCanvas,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}) => {
  
  const getNodeTypeName = (type: NodeType) => {
    const names = {
      destination: 'Destinazione',
      activity: 'Attività',
      restaurant: 'Ristorante',
      hotel: 'Hotel',
      transport: 'Trasporto',
      note: 'Nota',
      dayDivider: 'Divisore Giorno',
      nestedCanvas: 'Canvas Annidato',
    };
    return names[type] || 'Nodo';
  };

  const addNodeToCanvas = (type: NodeType) => {
    onAddNode(type);
    
    // Show success toast for nested canvas
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: `${getNodeTypeName(type)} aggiunto al canvas annidato`, type: 'success' } 
    }));
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-xl p-2 rounded-xl border border-purple-500/20 shadow-xl">
      {/* Node Tools - Two columns */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <ToolButton
          type="destination"
          icon="📍"
          label="Aggiungi Destinazione"
          onClick={() => addNodeToCanvas('destination')}
        />
        
        <ToolButton
          type="activity"
          icon="🎯"
          label="Aggiungi Attività"
          onClick={() => addNodeToCanvas('activity')}
        />
        
        <ToolButton
          type="restaurant"
          icon="🍽️"
          label="Aggiungi Ristorante"
          onClick={() => addNodeToCanvas('restaurant')}
        />
        
        <ToolButton
          type="hotel"
          icon="🏨"
          label="Aggiungi Hotel"
          onClick={() => addNodeToCanvas('hotel')}
        />
        
        <ToolButton
          type="transport"
          icon="🚗"
          label="Aggiungi Trasporto"
          onClick={() => addNodeToCanvas('transport')}
        />
        
        <ToolButton
          type="note"
          icon="📝"
          label="Aggiungi Nota"
          onClick={() => addNodeToCanvas('note')}
        />
        
        <ToolButton
          type="nestedCanvas"
          icon="🔗"
          label="Canvas Annidato"
          onClick={() => addNodeToCanvas('nestedCanvas')}
        />
        
        <div className="col-span-1 flex justify-center">
          <ToolButton
            type="dayDivider"
            icon="📅"
            label="Divisore Giorno"
            onClick={() => addNodeToCanvas('dayDivider')}
          />
        </div>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-purple-500/20 mx-1 mb-2"></div>
      
      {/* Action Tools - Two columns */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative group">
          <button
            className="w-11 h-11 bg-gray-800/90 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
            onClick={onAutoLayout}
          >
            ✨
          </button>
          <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Auto Layout
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
          </div>
        </div>
        
        {onUndo && (
          <div className="relative group">
            <button
              className={`w-11 h-11 bg-gray-800/90 border border-white/10 rounded-lg text-white flex items-center justify-center text-xl transition-all duration-200 ${
                canUndo 
                  ? 'hover:bg-purple-600/30 hover:border-purple-400/50 hover:scale-105 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={onUndo}
              disabled={!canUndo}
            >
              ↶
            </button>
            <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Annulla
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
            </div>
          </div>
        )}
        
        {onRedo && (
          <div className="relative group">
            <button
              className={`w-11 h-11 bg-gray-800/90 border border-white/10 rounded-lg text-white flex items-center justify-center text-xl transition-all duration-200 ${
                canRedo 
                  ? 'hover:bg-purple-600/30 hover:border-purple-400/50 hover:scale-105 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={onRedo}
              disabled={!canRedo}
            >
              ↷
            </button>
            <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Ripeti
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
            </div>
          </div>
        )}

        <div className="col-span-2 flex justify-center">
          <div className="relative group">
            <button
              className="w-11 h-11 bg-gray-800/90 hover:bg-red-600/30 border border-white/10 hover:border-red-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
              onClick={() => {
                if (window.confirm('Sei sicuro di voler cancellare tutto il canvas annidato?')) {
                  onClearCanvas();
                }
              }}
            >
              🗑️
            </button>
            <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Cancella Tutto
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NestedToolbar;
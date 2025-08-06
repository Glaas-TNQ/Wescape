import React, { useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
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
        className="w-11 h-11 bg-gray-800/90 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
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

const Toolbar: React.FC = () => {
  const { addNode, autoLayout, clearCanvas, undo, redo, history, historyIndex, loadSampleData } = useCanvasStore();
  
  const addNodeToCanvas = (type: NodeType) => {
    // Add node at a random position near center
    const position = {
      x: 200 + Math.random() * 400,
      y: 200 + Math.random() * 300,
    };
    addNode(type, position);
    
    // Show success toast
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: `${getNodeTypeName(type)} aggiunto al canvas`, type: 'success' } 
    }));
  };

  const getNodeTypeName = (type: NodeType) => {
    const names = {
      destination: 'Destinazione',
      activity: 'Attività',
      restaurant: 'Ristorante',
      hotel: 'Hotel',
      transport: 'Trasporto',
      note: 'Nota',
      dayDivider: 'Divisore Giorno',
    };
    return names[type] || 'Nodo';
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col gap-2 bg-gray-900/90 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-xl">
      {/* Node Tools */}
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
        type="dayDivider"
        icon="📅"
        label="Aggiungi Divisore Giorno"
        onClick={() => addNodeToCanvas('dayDivider')}
      />
      
      {/* Divider */}
      <div className="h-px bg-white/20 mx-1 my-1"></div>
      
      {/* Action Tools */}
      <div className="relative group">
        <button
          className="w-11 h-11 bg-gray-800/90 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
          onClick={autoLayout}
        >
          ✨
        </button>
        <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          Auto Layout
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
        </div>
      </div>
      
      {/* Undo/Redo */}
      <div className="relative group">
        <button
          className={`w-11 h-11 bg-gray-800/90 border border-white/10 rounded-lg text-white flex items-center justify-center text-xl transition-all duration-200 ${
            canUndo 
              ? 'hover:bg-blue-600/30 hover:border-blue-400/50 hover:scale-105 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={undo}
          disabled={!canUndo}
        >
          ↶
        </button>
        <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          Annulla (Ctrl+Z)
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
        </div>
      </div>
      
      <div className="relative group">
        <button
          className={`w-11 h-11 bg-gray-800/90 border border-white/10 rounded-lg text-white flex items-center justify-center text-xl transition-all duration-200 ${
            canRedo 
              ? 'hover:bg-blue-600/30 hover:border-blue-400/50 hover:scale-105 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={redo}
          disabled={!canRedo}
        >
          ↷
        </button>
        <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          Ripeti (Ctrl+Y)
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
        </div>
      </div>
      
      {/* Load Sample Data */}
      <div className="relative group">
        <button
          className="w-11 h-11 bg-gray-800/90 hover:bg-green-600/30 border border-white/10 hover:border-green-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
          onClick={loadSampleData}
        >
          📋
        </button>
        <div className="absolute left-14 top-0 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
          Carica Esempio
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-t border-white/20 rotate-45"></div>
        </div>
      </div>

      {/* Clear Canvas */}
      <div className="relative group">
        <button
          className="w-11 h-11 bg-gray-800/90 hover:bg-red-600/30 border border-white/10 hover:border-red-400/50 rounded-lg text-white cursor-pointer flex items-center justify-center text-xl transition-all duration-200 hover:scale-105"
          onClick={() => {
            if (window.confirm('Sei sicuro di voler cancellare tutto il canvas?')) {
              clearCanvas();
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
  );
};

export default Toolbar;
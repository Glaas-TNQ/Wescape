import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface TransportNodeData {
  title: string;
  description: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  type?: 'car' | 'train' | 'plane' | 'bus' | 'boat' | 'other';
}

interface TransportNodeProps extends NodeProps<TransportNodeData> {
  id: string;
}

const TransportNode = ({ data, selected, id }: TransportNodeProps) => {
  const getTypeIcon = () => {
    switch (data.type) {
      case 'car': return '🚗';
      case 'train': return '🚂';
      case 'plane': return '✈️';
      case 'bus': return '🚌';
      case 'boat': return '⛵';
      default: return '🚗';
    }
  };

  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [isHoveredCenter, setIsHoveredCenter] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const borderThreshold = 35; // pixels from edge
    
    const isNearBorder = 
      x < borderThreshold || 
      y < borderThreshold || 
      x > rect.width - borderThreshold || 
      y > rect.height - borderThreshold;
      
    setIsHoveredBorder(isNearBorder);
    setIsHoveredCenter(!isNearBorder);
  };

  const handleMouseLeave = () => {
    setIsHoveredBorder(false);
    setIsHoveredCenter(false);
  };
  
  return (
    <>
      <NodeResizer 
        color="rgb(239, 68, 68)" 
        isVisible={selected || isHoveredBorder}
        minWidth={180}
        minHeight={100}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          backgroundColor: 'rgb(239, 68, 68)',
          border: '2px solid rgba(239, 68, 68, 0.8)',
        }}
        lineStyle={{
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: '2px',
        }}
      />
      <div 
        className={`
          w-full h-full p-4 rounded-xl border-2 relative group
          transition-all duration-300 backdrop-blur-md overflow-hidden
          ${isHoveredCenter ? 'cursor-move' : 'cursor-default'}
          ${selected 
            ? 'border-red-400 shadow-2xl shadow-red-500/40 ring-4 ring-red-400/30 bg-gradient-to-br from-red-900/40 to-pink-800/30' 
            : 'border-red-600 hover:border-red-400 bg-gradient-to-br from-red-900/20 to-pink-800/10 hover:from-red-900/30 hover:to-pink-800/20'
          }
        `}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={() => {
          window.dispatchEvent(new CustomEvent('editNode', { detail: { nodeId: id } }));
        }}
      >
      {/* Handles - Top, Right, Bottom, Left */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        className="w-4 h-4 !bg-red-500 !border-2 !border-red-300 hover:!bg-red-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 !bg-red-500 !border-2 !border-red-300 hover:!bg-red-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 !bg-red-500 !border-2 !border-red-300 hover:!bg-red-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 !bg-red-500 !border-2 !border-red-300 hover:!bg-red-400 hover:!scale-125 transition-all duration-200" 
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 !bg-red-400 !border-2 !border-red-300 hover:!bg-red-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 !bg-red-400 !border-2 !border-red-300 hover:!bg-red-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 !bg-red-400 !border-2 !border-red-300 hover:!bg-red-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 !bg-red-400 !border-2 !border-red-300 hover:!bg-red-300 hover:!scale-125 transition-all duration-200" 
      />
      
      <NodeActions nodeId={id} nodeType="Trasporto" />
      
      <div className="flex items-center gap-2 mb-2 overflow-hidden">
        <span className="text-2xl flex-shrink-0">{getTypeIcon()}</span>
        <h3 className="font-bold text-white text-lg truncate">{data.title}</h3>
      </div>
      
      <div className="text-xs text-red-300 mb-2 space-y-1 overflow-hidden">
        {data.departure && (
          <div className="truncate">Partenza: {data.departure}</div>
        )}
        {data.arrival && (
          <div className="truncate">Arrivo: {data.arrival}</div>
        )}
        {data.duration && (
          <div className="flex items-center gap-1 truncate">
            <span>⏱️</span>
            <span>{data.duration}</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <p className="text-sm text-gray-300 leading-relaxed break-words overflow-hidden text-ellipsis line-clamp-3">
          {data.description}
        </p>
      </div>
      
      </div>
    </>
  );
};

export default TransportNode;
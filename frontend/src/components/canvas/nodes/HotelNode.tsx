import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface HotelNodeData {
  title: string;
  description: string;
  checkIn?: string;
  checkOut?: string;
  stars?: number;
  amenities?: string[];
}

interface HotelNodeProps extends NodeProps<HotelNodeData> {
  id: string;
}

const HotelNode = ({ data, selected, id }: HotelNodeProps) => {
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
        color="rgb(16, 185, 129)" 
        isVisible={selected || isHoveredBorder}
        minWidth={180}
        minHeight={100}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          backgroundColor: 'rgb(16, 185, 129)',
          border: '2px solid rgba(16, 185, 129, 0.8)',
        }}
        lineStyle={{
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: '2px',
        }}
      />
      <div 
        className={`
          w-full h-full p-4 rounded-xl border-2 relative group
          transition-all duration-300 backdrop-blur-md overflow-hidden
          ${isHoveredCenter ? 'cursor-move' : 'cursor-default'}
          ${selected 
            ? 'border-emerald-400 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-400/30 bg-gradient-to-br from-emerald-900/40 to-green-800/30' 
            : 'border-emerald-600 hover:border-emerald-400 bg-gradient-to-br from-emerald-900/20 to-green-800/10 hover:from-emerald-900/30 hover:to-green-800/20'
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
        className="w-4 h-4 !bg-emerald-500 !border-2 !border-emerald-300 hover:!bg-emerald-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 !bg-emerald-500 !border-2 !border-emerald-300 hover:!bg-emerald-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 !bg-emerald-500 !border-2 !border-emerald-300 hover:!bg-emerald-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 !bg-emerald-500 !border-2 !border-emerald-300 hover:!bg-emerald-400 hover:!scale-125 transition-all duration-200" 
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 !bg-emerald-400 !border-2 !border-emerald-300 hover:!bg-emerald-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 !bg-emerald-400 !border-2 !border-emerald-300 hover:!bg-emerald-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 !bg-emerald-400 !border-2 !border-emerald-300 hover:!bg-emerald-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 !bg-emerald-400 !border-2 !border-emerald-300 hover:!bg-emerald-300 hover:!scale-125 transition-all duration-200" 
      />
      
      <NodeActions nodeId={id} nodeType="Hotel" />
      
      <div className="flex items-center gap-2 mb-2 overflow-hidden">
        <span className="text-2xl flex-shrink-0">🏨</span>
        <h3 className="font-bold text-white text-lg truncate">{data.title}</h3>
      </div>
      
      <div className="text-xs text-emerald-300 mb-2 space-y-1 overflow-hidden">
        {data.checkIn && (
          <div className="truncate">Check-in: {data.checkIn}</div>
        )}
        {data.checkOut && (
          <div className="truncate">Check-out: {data.checkOut}</div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <p className="text-sm text-gray-300 leading-relaxed break-words overflow-hidden text-ellipsis line-clamp-3">
          {data.description}
        </p>
      </div>
      
      {data.stars && (
        <div className="mt-2 flex items-center gap-1">
          {'⭐'.repeat(data.stars)}
          <span className="text-xs text-emerald-400 ml-1">{data.stars} stelle</span>
        </div>
      )}
      
      </div>
    </>
  );
};

export default HotelNode;
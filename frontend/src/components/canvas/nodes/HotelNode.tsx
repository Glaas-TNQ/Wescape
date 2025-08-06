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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <NodeResizer 
        color="rgb(16, 185, 129)" 
        isVisible={selected || isHovered}
        minWidth={180}
        minHeight={100}
      />
      <div 
        className={`
          min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
          transition-all duration-300 backdrop-blur-md w-full h-full
          ${selected 
            ? 'border-emerald-400 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-400/30 bg-gradient-to-br from-emerald-900/40 to-green-800/30' 
            : 'border-emerald-600 hover:border-emerald-400 bg-gradient-to-br from-emerald-900/20 to-green-800/10 hover:from-emerald-900/30 hover:to-green-800/20'
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🏨</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      <div className="text-xs text-emerald-300 mb-2 space-y-1">
        {data.checkIn && (
          <div>Check-in: {data.checkIn}</div>
        )}
        {data.checkOut && (
          <div>Check-out: {data.checkOut}</div>
        )}
      </div>
      
      <p className="text-sm text-gray-300 leading-relaxed overflow-hidden text-ellipsis line-clamp-3">
        {data.description}
      </p>
      
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
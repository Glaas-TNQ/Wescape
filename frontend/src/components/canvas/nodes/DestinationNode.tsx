import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface DestinationNodeData {
  title: string;
  description: string;
  date?: string;
  location?: string;
}

interface DestinationNodeProps extends NodeProps<DestinationNodeData> {
  id: string;
}

const DestinationNode = ({ data, selected, id }: DestinationNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <NodeResizer 
        color="rgb(168, 85, 247)" 
        isVisible={selected || isHovered}
        minWidth={180}
        minHeight={100}
      />
      <div 
        className={`
          min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
          transition-all duration-300 backdrop-blur-md w-full h-full
          ${selected 
            ? 'border-purple-400 shadow-2xl shadow-purple-500/40 ring-4 ring-purple-400/30 bg-gradient-to-br from-purple-900/40 to-purple-800/30' 
            : 'border-purple-600 hover:border-purple-400 bg-gradient-to-br from-purple-900/20 to-purple-800/10 hover:from-purple-900/30 hover:to-purple-800/20'
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
        className="w-4 h-4 !bg-purple-500 !border-2 !border-purple-300 hover:!bg-purple-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 !bg-purple-500 !border-2 !border-purple-300 hover:!bg-purple-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 !bg-purple-500 !border-2 !border-purple-300 hover:!bg-purple-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 !bg-purple-500 !border-2 !border-purple-300 hover:!bg-purple-400 hover:!scale-125 transition-all duration-200" 
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 !bg-purple-400 !border-2 !border-purple-300 hover:!bg-purple-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 !bg-purple-400 !border-2 !border-purple-300 hover:!bg-purple-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 !bg-purple-400 !border-2 !border-purple-300 hover:!bg-purple-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 !bg-purple-400 !border-2 !border-purple-300 hover:!bg-purple-300 hover:!scale-125 transition-all duration-200" 
      />
      
      <NodeActions nodeId={id} nodeType="Destinazione" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📍</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      {data.date && (
        <p className="text-xs text-purple-300 mb-1">{data.date}</p>
      )}
      
      <p className="text-sm text-gray-300 leading-relaxed overflow-hidden text-ellipsis line-clamp-3">
        {data.description}
      </p>
      </div>
    </>
  );
};

export default DestinationNode;
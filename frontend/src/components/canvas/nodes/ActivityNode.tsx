import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface ActivityNodeData {
  title: string;
  description: string;
  time?: string;
  duration?: string;
  category?: string;
}

interface ActivityNodeProps extends NodeProps<ActivityNodeData> {
  id: string;
}

const ActivityNode = ({ data, selected, id }: ActivityNodeProps) => {
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
        color="rgb(6, 182, 212)" 
        isVisible={selected || isHoveredBorder}
        minWidth={180}
        minHeight={100}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          backgroundColor: 'rgb(6, 182, 212)',
          border: '2px solid rgba(6, 182, 212, 0.8)',
        }}
        lineStyle={{
          borderColor: 'rgb(6, 182, 212)',
          borderWidth: '2px',
        }}
      />
      <div 
        className={`
          w-full h-full p-4 rounded-xl border-2 relative group
          transition-all duration-300 backdrop-blur-md overflow-hidden
          ${isHoveredCenter ? 'cursor-move' : 'cursor-default'}
          ${selected 
            ? 'border-cyan-400 shadow-2xl shadow-cyan-500/40 ring-4 ring-cyan-400/30 bg-gradient-to-br from-cyan-900/40 to-blue-800/30' 
            : 'border-cyan-600 hover:border-cyan-400 bg-gradient-to-br from-cyan-900/20 to-blue-800/10 hover:from-cyan-900/30 hover:to-blue-800/20'
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
        className="w-4 h-4 !bg-cyan-500 !border-2 !border-cyan-300 hover:!bg-cyan-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 !bg-cyan-500 !border-2 !border-cyan-300 hover:!bg-cyan-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 !bg-cyan-500 !border-2 !border-cyan-300 hover:!bg-cyan-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 !bg-cyan-500 !border-2 !border-cyan-300 hover:!bg-cyan-400 hover:!scale-125 transition-all duration-200" 
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 !bg-cyan-400 !border-2 !border-cyan-300 hover:!bg-cyan-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 !bg-cyan-400 !border-2 !border-cyan-300 hover:!bg-cyan-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 !bg-cyan-400 !border-2 !border-cyan-300 hover:!bg-cyan-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 !bg-cyan-400 !border-2 !border-cyan-300 hover:!bg-cyan-300 hover:!scale-125 transition-all duration-200" 
      />
      
      <NodeActions nodeId={id} nodeType="Attività" />
      
      <div className="flex items-center gap-2 mb-2 overflow-hidden">
        <span className="text-2xl flex-shrink-0">🎯</span>
        <h3 className="font-bold text-white text-lg truncate">{data.title}</h3>
      </div>
      
      {data.time && (
        <p className="text-xs text-cyan-300 mb-1 truncate">{data.time}</p>
      )}
      
      <div className="flex-1 overflow-hidden">
        <p className="text-sm text-gray-300 leading-relaxed break-words overflow-hidden text-ellipsis line-clamp-3">
          {data.description}
        </p>
      </div>
      
      {data.duration && (
        <div className="mt-2 text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
          ⏱️ {data.duration}
        </div>
      )}
      </div>
    </>
  );
};

export default ActivityNode;
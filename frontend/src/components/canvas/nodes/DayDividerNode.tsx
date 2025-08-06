import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface DayDividerNodeData {
  day: number;
  date: string;
  title?: string;
}

interface DayDividerNodeProps extends NodeProps<DayDividerNodeData> {
  id: string;
}

const DayDividerNode = ({ data, selected, id }: DayDividerNodeProps) => {
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
        color="rgb(99, 102, 241)" 
        isVisible={selected || isHoveredBorder}
        minWidth={250}
        minHeight={120}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          backgroundColor: 'rgb(99, 102, 241)',
          border: '2px solid rgba(99, 102, 241, 0.8)',
        }}
        lineStyle={{
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: '2px',
        }}
      />
      <div 
        className={`
          w-full h-full p-6 rounded-xl border-2 relative group
          transition-all duration-300 backdrop-blur-md text-center overflow-hidden
          ${isHoveredCenter ? 'cursor-move' : 'cursor-default'}
          ${selected 
            ? 'border-indigo-400 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-400/30 bg-gradient-to-r from-indigo-900/40 to-purple-900/40' 
            : 'border-indigo-600 hover:border-indigo-400 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 hover:from-indigo-900/40 hover:to-purple-900/40'
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
        className="w-4 h-4 !bg-indigo-500 !border-2 !border-indigo-300 hover:!bg-indigo-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 !bg-indigo-500 !border-2 !border-indigo-300 hover:!bg-indigo-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 !bg-indigo-500 !border-2 !border-indigo-300 hover:!bg-indigo-400 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 !bg-indigo-500 !border-2 !border-indigo-300 hover:!bg-indigo-400 hover:!scale-125 transition-all duration-200" 
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 !bg-indigo-400 !border-2 !border-indigo-300 hover:!bg-indigo-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 !bg-indigo-400 !border-2 !border-indigo-300 hover:!bg-indigo-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 !bg-indigo-400 !border-2 !border-indigo-300 hover:!bg-indigo-300 hover:!scale-125 transition-all duration-200" 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 !bg-indigo-400 !border-2 !border-indigo-300 hover:!bg-indigo-300 hover:!scale-125 transition-all duration-200" 
      />
      
      <NodeActions nodeId={id} nodeType="Divisore Giorno" />
      
      {/* Day Badge */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-3">
        <span className="text-2xl font-bold text-white">{data.day}</span>
      </div>
      
      <h2 className="text-xl font-bold text-white mb-1">
        {data.title || `Giorno ${data.day}`}
      </h2>
      
      <p className="text-indigo-300 text-sm">{data.date}</p>
      
      {/* Decorative line */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
      
      </div>
    </>
  );
};

export default DayDividerNode;
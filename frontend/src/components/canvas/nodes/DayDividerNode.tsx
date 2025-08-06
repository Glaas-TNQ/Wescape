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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <NodeResizer 
        color="rgb(99, 102, 241)" 
        isVisible={selected || isHovered}
        minWidth={250}
        minHeight={120}
      />
      <div 
        className={`
          min-w-[300px] p-6 rounded-xl border-2 relative cursor-move group
          transition-all duration-300 backdrop-blur-md text-center w-full h-full
          ${selected 
            ? 'border-indigo-400 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-400/30 bg-gradient-to-r from-indigo-900/40 to-purple-900/40' 
            : 'border-indigo-600 hover:border-indigo-400 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 hover:from-indigo-900/40 hover:to-purple-900/40'
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
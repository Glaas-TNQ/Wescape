import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface NoteNodeData {
  title: string;
  content: string;
  color?: 'yellow' | 'blue' | 'green' | 'pink';
}

interface NoteNodeProps extends NodeProps<NoteNodeData> {
  id: string;
}

const NoteNode = ({ data, selected, id }: NoteNodeProps) => {
  const getColorClasses = () => {
    switch (data.color) {
      case 'blue':
        return {
          border: selected ? 'border-blue-400 shadow-2xl shadow-blue-500/40 ring-4 ring-blue-400/30' : 'border-blue-500 hover:border-blue-400',
          bg: selected ? 'from-blue-500/40 to-blue-600/30' : 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30',
          handle: '!bg-blue-500 !border-blue-300',
          handleHover: 'hover:!bg-blue-400 hover:!scale-125',
          sourceHandle: '!bg-blue-400 !border-blue-300 hover:!bg-blue-300',
          text: 'text-blue-300'
        };
      case 'green':
        return {
          border: selected ? 'border-green-400 shadow-2xl shadow-green-500/40 ring-4 ring-green-400/30' : 'border-green-500 hover:border-green-400',
          bg: selected ? 'from-green-500/40 to-green-600/30' : 'from-green-500/20 to-green-600/10 hover:from-green-500/30',
          handle: '!bg-green-500 !border-green-300',
          handleHover: 'hover:!bg-green-400 hover:!scale-125',
          sourceHandle: '!bg-green-400 !border-green-300 hover:!bg-green-300',
          text: 'text-green-300'
        };
      case 'pink':
        return {
          border: selected ? 'border-pink-400 shadow-2xl shadow-pink-500/40 ring-4 ring-pink-400/30' : 'border-pink-500 hover:border-pink-400',
          bg: selected ? 'from-pink-500/40 to-pink-600/30' : 'from-pink-500/20 to-pink-600/10 hover:from-pink-500/30',
          handle: '!bg-pink-500 !border-pink-300',
          handleHover: 'hover:!bg-pink-400 hover:!scale-125',
          sourceHandle: '!bg-pink-400 !border-pink-300 hover:!bg-pink-300',
          text: 'text-pink-300'
        };
      default: // yellow
        return {
          border: selected ? 'border-yellow-400 shadow-2xl shadow-yellow-500/40 ring-4 ring-yellow-400/30' : 'border-yellow-500 hover:border-yellow-400',
          bg: selected ? 'from-yellow-500/40 to-yellow-600/30' : 'from-yellow-500/20 to-yellow-600/10 hover:from-yellow-500/30',
          handle: '!bg-yellow-500 !border-yellow-300',
          handleHover: 'hover:!bg-yellow-400 hover:!scale-125',
          sourceHandle: '!bg-yellow-400 !border-yellow-300 hover:!bg-yellow-300',
          text: 'text-yellow-300'
        };
    }
  };

  const colors = getColorClasses();

  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <NodeResizer 
        color="rgb(234, 179, 8)" 
        isVisible={selected || isHovered}
        minWidth={180}
        minHeight={100}
      />
      <div 
        className={`
          min-w-[200px] max-w-[300px] p-4 rounded-xl border-2 relative cursor-move group
          transition-all duration-300 backdrop-blur-md w-full h-full
          ${colors.border}
          bg-gradient-to-br ${colors.bg}
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
        className={`w-4 h-4 ${colors.handle} ${colors.handleHover} transition-all duration-200`}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className={`w-4 h-4 ${colors.handle} ${colors.handleHover} transition-all duration-200`}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className={`w-4 h-4 ${colors.handle} ${colors.handleHover} transition-all duration-200`}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className={`w-4 h-4 ${colors.handle} ${colors.handleHover} transition-all duration-200`}
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className={`w-4 h-4 ${colors.sourceHandle} hover:!scale-125 transition-all duration-200`}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className={`w-4 h-4 ${colors.sourceHandle} hover:!scale-125 transition-all duration-200`}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className={`w-4 h-4 ${colors.sourceHandle} hover:!scale-125 transition-all duration-200`}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className={`w-4 h-4 ${colors.sourceHandle} hover:!scale-125 transition-all duration-200`}
      />
      
      <NodeActions nodeId={id} nodeType="Nota" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📝</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap overflow-hidden text-ellipsis line-clamp-4">
        {data.content}
      </div>
      
      </div>
    </>
  );
};

export default NoteNode;
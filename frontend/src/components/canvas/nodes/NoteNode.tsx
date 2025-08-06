import { Handle, Position, type NodeProps } from 'reactflow';
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
          border: selected ? 'border-blue-400' : 'border-blue-500 hover:border-blue-400',
          bg: 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30',
          handle: '!bg-blue-500 !border-blue-300',
          text: 'text-blue-300'
        };
      case 'green':
        return {
          border: selected ? 'border-green-400' : 'border-green-500 hover:border-green-400',
          bg: 'from-green-500/20 to-green-600/10 hover:from-green-500/30',
          handle: '!bg-green-500 !border-green-300',
          text: 'text-green-300'
        };
      case 'pink':
        return {
          border: selected ? 'border-pink-400' : 'border-pink-500 hover:border-pink-400',
          bg: 'from-pink-500/20 to-pink-600/10 hover:from-pink-500/30',
          handle: '!bg-pink-500 !border-pink-300',
          text: 'text-pink-300'
        };
      default: // yellow
        return {
          border: selected ? 'border-yellow-400' : 'border-yellow-500 hover:border-yellow-400',
          bg: 'from-yellow-500/20 to-yellow-600/10 hover:from-yellow-500/30',
          handle: '!bg-yellow-500 !border-yellow-300',
          text: 'text-yellow-300'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`
      min-w-[200px] max-w-[300px] p-4 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${colors.border}
      ${selected ? 'shadow-lg shadow-yellow-500/25 scale-105' : 'hover:scale-102'}
      bg-gradient-to-br ${colors.bg}
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`w-3 h-3 ${colors.handle}`}
      />
      
      <NodeActions nodeId={id} nodeType="Nota" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📝</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
        {data.content}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`w-3 h-3 ${colors.handle}`}
      />
    </div>
  );
};

export default NoteNode;
import { Handle, Position, type NodeProps } from 'reactflow';
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
  return (
    <div className={`
      min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${selected 
        ? 'border-purple-400 shadow-lg shadow-purple-500/25 scale-105' 
        : 'border-purple-600 hover:border-purple-400 hover:scale-102'
      }
      bg-gradient-to-br from-purple-900/20 to-purple-800/10
      hover:from-purple-900/30 hover:to-purple-800/20
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-purple-500 !border-2 !border-purple-300" 
      />
      
      <NodeActions nodeId={id} nodeType="Destinazione" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📍</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      {data.date && (
        <p className="text-xs text-purple-300 mb-1">{data.date}</p>
      )}
      
      <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-purple-500 !border-2 !border-purple-300" 
      />
    </div>
  );
};

export default DestinationNode;
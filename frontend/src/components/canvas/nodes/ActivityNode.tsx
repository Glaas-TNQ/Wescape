import { Handle, Position, type NodeProps } from 'reactflow';
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
  return (
    <div className={`
      min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${selected 
        ? 'border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105' 
        : 'border-cyan-600 hover:border-cyan-400 hover:scale-102'
      }
      bg-gradient-to-br from-cyan-900/20 to-blue-800/10
      hover:from-cyan-900/30 hover:to-blue-800/20
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-cyan-500 !border-2 !border-cyan-300" 
      />
      
      <NodeActions nodeId={id} nodeType="Attività" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🎯</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      {data.time && (
        <p className="text-xs text-cyan-300 mb-1">{data.time}</p>
      )}
      
      <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
      
      {data.duration && (
        <div className="mt-2 text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
          ⏱️ {data.duration}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-cyan-500 !border-2 !border-cyan-300" 
      />
    </div>
  );
};

export default ActivityNode;
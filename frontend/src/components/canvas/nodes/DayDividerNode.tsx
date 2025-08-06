import { Handle, Position, type NodeProps } from 'reactflow';
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
  return (
    <div className={`
      min-w-[300px] p-6 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${selected 
        ? 'border-indigo-400 shadow-lg shadow-indigo-500/25 scale-105' 
        : 'border-indigo-600 hover:border-indigo-400 hover:scale-102'
      }
      bg-gradient-to-r from-indigo-900/30 to-purple-900/30
      hover:from-indigo-900/40 hover:to-purple-900/40
      text-center
    `}>
      {/* Handles on both sides for day flow */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-indigo-500 !border-2 !border-indigo-300" 
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
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-indigo-500 !border-2 !border-indigo-300" 
      />
    </div>
  );
};

export default DayDividerNode;
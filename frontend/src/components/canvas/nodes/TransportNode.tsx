import { Handle, Position, type NodeProps } from 'reactflow';

export interface TransportNodeData {
  title: string;
  description: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  type?: 'car' | 'train' | 'plane' | 'bus' | 'boat' | 'other';
}

const TransportNode = ({ data, selected }: NodeProps<TransportNodeData>) => {
  const getTypeIcon = () => {
    switch (data.type) {
      case 'car': return '🚗';
      case 'train': return '🚂';
      case 'plane': return '✈️';
      case 'bus': return '🚌';
      case 'boat': return '⛵';
      default: return '🚗';
    }
  };

  return (
    <div className={`
      min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${selected 
        ? 'border-red-400 shadow-lg shadow-red-500/25 scale-105' 
        : 'border-red-600 hover:border-red-400 hover:scale-102'
      }
      bg-gradient-to-br from-red-900/20 to-pink-800/10
      hover:from-red-900/30 hover:to-pink-800/20
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-red-500 !border-2 !border-red-300" 
      />
      
      {/* Node Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded border border-white/20 flex items-center justify-center text-xs">
          ✏️
        </button>
        <button className="w-6 h-6 bg-white/10 hover:bg-red-500/30 rounded border border-white/20 flex items-center justify-center text-xs">
          🗑️
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{getTypeIcon()}</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      <div className="text-xs text-red-300 mb-2 space-y-1">
        {data.departure && (
          <div>Partenza: {data.departure}</div>
        )}
        {data.arrival && (
          <div>Arrivo: {data.arrival}</div>
        )}
        {data.duration && (
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{data.duration}</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-red-500 !border-2 !border-red-300" 
      />
    </div>
  );
};

export default TransportNode;
import { Handle, Position, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface HotelNodeData {
  title: string;
  description: string;
  checkIn?: string;
  checkOut?: string;
  stars?: number;
  amenities?: string[];
}

interface HotelNodeProps extends NodeProps<HotelNodeData> {
  id: string;
}

const HotelNode = ({ data, selected, id }: HotelNodeProps) => {
  return (
    <div className={`
      min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${selected 
        ? 'border-emerald-400 shadow-lg shadow-emerald-500/25 scale-105' 
        : 'border-emerald-600 hover:border-emerald-400 hover:scale-102'
      }
      bg-gradient-to-br from-emerald-900/20 to-green-800/10
      hover:from-emerald-900/30 hover:to-green-800/20
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-emerald-300" 
      />
      
      <NodeActions nodeId={id} nodeType="Hotel" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🏨</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      <div className="text-xs text-emerald-300 mb-2 space-y-1">
        {data.checkIn && (
          <div>Check-in: {data.checkIn}</div>
        )}
        {data.checkOut && (
          <div>Check-out: {data.checkOut}</div>
        )}
      </div>
      
      <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
      
      {data.stars && (
        <div className="mt-2 flex items-center gap-1">
          {'⭐'.repeat(data.stars)}
          <span className="text-xs text-emerald-400 ml-1">{data.stars} stelle</span>
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-emerald-300" 
      />
    </div>
  );
};

export default HotelNode;
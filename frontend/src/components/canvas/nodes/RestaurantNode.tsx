import { Handle, Position, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';

export interface RestaurantNodeData {
  title: string;
  description: string;
  time?: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
}

interface RestaurantNodeProps extends NodeProps<RestaurantNodeData> {
  id: string;
}

const RestaurantNode = ({ data, selected, id }: RestaurantNodeProps) => {
  return (
    <div className={`
      min-w-[200px] p-4 rounded-xl border-2 relative cursor-move group
      transition-all duration-200 backdrop-blur-md
      ${selected 
        ? 'border-amber-400 shadow-lg shadow-amber-500/25 scale-105' 
        : 'border-amber-600 hover:border-amber-400 hover:scale-102'
      }
      bg-gradient-to-br from-amber-900/20 to-orange-800/10
      hover:from-amber-900/30 hover:to-orange-800/20
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-amber-500 !border-2 !border-amber-300" 
      />
      
      <NodeActions nodeId={id} nodeType="Ristorante" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🍽️</span>
        <h3 className="font-bold text-white text-lg">{data.title}</h3>
      </div>
      
      {data.time && (
        <p className="text-xs text-amber-300 mb-1">{data.time}</p>
      )}
      
      <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
      
      <div className="flex gap-2 mt-2">
        {data.cuisine && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded">
            {data.cuisine}
          </span>
        )}
        {data.priceRange && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded">
            {data.priceRange}
          </span>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-amber-500 !border-2 !border-amber-300" 
      />
    </div>
  );
};

export default RestaurantNode;
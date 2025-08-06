import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface RestaurantNodeData {
  title: string;
  description: string;
  time?: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  customColor?: string | null;
}

interface RestaurantNodeProps extends NodeProps<RestaurantNodeData> {
  id: string;
}

const RestaurantNode = ({ data, selected, id }: RestaurantNodeProps) => {
  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [isHoveredCenter, setIsHoveredCenter] = useState(false);
  
  // Get dynamic colors based on node type and custom color
  const colors = getNodeColors('restaurant', data.customColor);
  
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
        color={colors.resizer}
        isVisible={selected || isHoveredBorder}
        minWidth={180}
        minHeight={100}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          backgroundColor: colors.base,
          border: `2px solid rgba(${colors.rgb}, 0.8)`,
        }}
        lineStyle={{
          borderColor: colors.border,
          borderWidth: '2px',
        }}
      />
      <div 
        className="w-full h-full p-4 rounded-xl border-2 relative group transition-all duration-300 backdrop-blur-md overflow-hidden"
        style={{
          cursor: isHoveredCenter ? 'move' : 'default',
          borderColor: selected ? colors.borderSelected : colors.border,
          backgroundColor: selected ? colors.backgroundSelected : colors.background,
          boxShadow: selected 
            ? `0 25px 50px -12px ${colors.shadow}, 0 0 0 4px ${colors.ring}` 
            : 'none'
        }}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.borderColor = colors.borderHover;
            e.currentTarget.style.backgroundColor = colors.backgroundHover;
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={(e) => {
          handleMouseLeave();
          if (!selected) {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.backgroundColor = colors.background;
          }
        }}
        onDoubleClick={() => {
          window.dispatchEvent(new CustomEvent('editNode', { detail: { nodeId: id } }));
        }}
      >
      {/* Handles - Top, Right, Bottom, Left */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: colors.handle, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: colors.handle, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: colors.handle, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: colors.handle, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: `rgba(${colors.rgb}, 0.8)`, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: `rgba(${colors.rgb}, 0.8)`, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: `rgba(${colors.rgb}, 0.8)`, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 !border-2 hover:!scale-125 transition-all duration-200"
        style={{ 
          backgroundColor: `rgba(${colors.rgb}, 0.8)`, 
          borderColor: `rgba(${colors.rgb}, 0.7)` 
        }}
      />
      
      <NodeActions 
        nodeId={id} 
        nodeType="Ristorante" 
        currentColor={data.customColor}
        onColorClick={(position) => {
          window.dispatchEvent(new CustomEvent('openColorPicker', { 
            detail: { 
              nodeId: id, 
              nodeType: 'restaurant',
              currentColor: data.customColor,
              position 
            } 
          }));
        }}
      />
      
      <div className="flex items-center gap-2 mb-2 overflow-hidden">
        <span className="text-2xl flex-shrink-0">🍽️</span>
        <h3 className="font-bold text-white text-lg truncate">{data.title}</h3>
      </div>
      
      {data.time && (
        <p className="text-xs mb-1 truncate" style={{ color: `rgba(${colors.rgb}, 0.8)` }}>
          {data.time}
        </p>
      )}
      
      <div className="flex-1 overflow-hidden">
        <p className="text-sm text-gray-300 leading-relaxed break-words overflow-hidden text-ellipsis line-clamp-3">
          {data.description}
        </p>
      </div>
      
      <div className="flex gap-2 mt-2">
        {data.cuisine && (
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: `rgba(${colors.rgb}, 0.1)`,
              color: `rgba(${colors.rgb}, 0.9)`
            }}
          >
            {data.cuisine}
          </span>
        )}
        {data.priceRange && (
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: `rgba(${colors.rgb}, 0.1)`,
              color: `rgba(${colors.rgb}, 0.9)`
            }}
          >
            {data.priceRange}
          </span>
        )}
      </div>
      
      </div>
    </>
  );
};

export default RestaurantNode;
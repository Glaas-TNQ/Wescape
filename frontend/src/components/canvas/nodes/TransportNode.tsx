import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface TransportNodeData {
  title: string;
  description: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  type?: 'car' | 'train' | 'plane' | 'bus' | 'boat' | 'other';
  customColor?: string | null;
}

interface TransportNodeProps extends NodeProps<TransportNodeData> {
  id: string;
}

const TransportNode = ({ data, selected, id }: TransportNodeProps) => {
  // Get dynamic colors based on node type and custom color
  const colors = getNodeColors('transport', data.customColor);

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

  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [isHoveredCenter, setIsHoveredCenter] = useState(false);
  
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
          border: `2px solid ${colors.rgb}`,
        }}
        lineStyle={{
          borderColor: colors.base,
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
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      
      {/* Source Handles */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source-top"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source-right"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-bottom"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="source-left"
        className="w-4 h-4 hover:!scale-125 transition-all duration-200"
        style={{
          backgroundColor: colors.handle,
          border: `2px solid ${colors.rgb}`,
        }}
      />
      
      <NodeActions 
        nodeId={id} 
        nodeType="Trasporto" 
        currentColor={data.customColor}
        onColorClick={(position) => {
          window.dispatchEvent(new CustomEvent('openColorPicker', { 
            detail: { 
              nodeId: id, 
              nodeType: 'transport',
              currentColor: data.customColor,
              position 
            } 
          }));
        }}
      />
      
      <div className="flex items-center gap-2 mb-2 overflow-hidden">
        <span className="text-2xl flex-shrink-0">{getTypeIcon()}</span>
        <h3 className="font-bold text-white text-lg truncate">{data.title}</h3>
      </div>
      
      <div className="text-xs mb-2 space-y-1 overflow-hidden" style={{ color: colors.textSecondary }}>
        {data.departure && (
          <div className="truncate">Partenza: {data.departure}</div>
        )}
        {data.arrival && (
          <div className="truncate">Arrivo: {data.arrival}</div>
        )}
        {data.duration && (
          <div className="flex items-center gap-1 truncate">
            <span>⏱️</span>
            <span>{data.duration}</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <p className="text-sm text-gray-300 leading-relaxed break-words overflow-hidden text-ellipsis line-clamp-3">
          {data.description}
        </p>
      </div>
      
      </div>
    </>
  );
};

export default TransportNode;
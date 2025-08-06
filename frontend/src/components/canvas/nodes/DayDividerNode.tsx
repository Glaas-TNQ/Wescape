import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NodeActions from './NodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface DayDividerNodeData {
  day: number;
  date: string;
  title?: string;
  customColor?: string | null;
}

interface DayDividerNodeProps extends NodeProps<DayDividerNodeData> {
  id: string;
}

const DayDividerNode = ({ data, selected, id }: DayDividerNodeProps) => {
  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [isHoveredCenter, setIsHoveredCenter] = useState(false);
  
  // Get dynamic colors based on node type and custom color
  const colors = getNodeColors('dayDivider', data.customColor);
  
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
        minWidth={250}
        minHeight={120}
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
        className="w-full h-full p-6 rounded-xl border-2 relative group transition-all duration-300 backdrop-blur-md text-center overflow-hidden"
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
        nodeType="Divisore Giorno" 
        currentColor={data.customColor}
        onColorClick={(position) => {
          window.dispatchEvent(new CustomEvent('openColorPicker', { 
            detail: { 
              nodeId: id, 
              nodeType: 'dayDivider',
              currentColor: data.customColor,
              position 
            } 
          }));
        }}
      />
      
      {/* Day Badge */}
      <div 
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
        style={{ 
          background: `linear-gradient(to bottom right, ${colors.base}, ${colors.secondary})` 
        }}
      >
        <span className="text-2xl font-bold text-white">{data.day}</span>
      </div>
      
      <h2 className="text-xl font-bold text-white mb-1">
        {data.title || `Giorno ${data.day}`}
      </h2>
      
      <p className="text-sm" style={{ color: colors.textSecondary }}>{data.date}</p>
      
      {/* Decorative line */}
      <div 
        className="mt-4 h-px"
        style={{ 
          background: `linear-gradient(to right, transparent, ${colors.base}, transparent)` 
        }}
      ></div>
      
      </div>
    </>
  );
};

export default DayDividerNode;
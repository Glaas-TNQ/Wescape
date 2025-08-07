import { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from 'reactflow';
import NestedCanvasNodeActions from './NestedCanvasNodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface NestedCanvasNodeData {
  title: string;
  description: string;
  childNodes?: any[];
  childEdges?: any[];
  isExpanded?: boolean;
  customColor?: string | null;
}

interface NestedCanvasNodeProps extends NodeProps<NestedCanvasNodeData> {
  id: string;
}

const NestedCanvasNode = ({ data, selected, id }: NestedCanvasNodeProps) => {
  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [isHoveredCenter, setIsHoveredCenter] = useState(false);
  
  // Get dynamic colors based on node type and custom color
  const colors = getNodeColors('nestedCanvas', data.customColor);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const borderThreshold = 35;
    
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

  const handleOpenNestedCanvas = () => {
    console.log('Opening nested canvas for node:', id, data);
    window.dispatchEvent(new CustomEvent('openNestedCanvas', { 
      detail: { 
        nodeId: id, 
        nodeData: data 
      } 
    }));
  };
  
  return (
    <>
      <NodeResizer 
        color={colors.resizer}
        isVisible={selected || isHoveredBorder}
        minWidth={220}
        minHeight={160}
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
        onDoubleClick={handleOpenNestedCanvas}
      >
        {/* Handles */}
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
        
        <NestedCanvasNodeActions 
          nodeId={id} 
          nodeType="Canvas Annidato" 
          onOpenCanvas={handleOpenNestedCanvas}
          currentColor={data.customColor}
          onColorClick={(position) => {
            window.dispatchEvent(new CustomEvent('openColorPicker', { 
              detail: { 
                nodeId: id, 
                nodeType: 'nestedCanvas',
                currentColor: data.customColor,
                position 
              } 
            }));
          }}
        />
        
        <div className="flex items-center gap-2 mb-3 overflow-hidden">
          <span className="text-2xl flex-shrink-0">🔗</span>
          <h3 className="font-bold text-white text-lg truncate">{data.title}</h3>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden mb-3">
          <p className="text-sm text-gray-300 leading-relaxed break-words flex-1 overflow-y-auto">
            {data.description}
          </p>
        </div>

        {/* Preview area showing nested elements count */}
        <div className="mt-auto space-y-2 flex-shrink-0">
          <div 
            className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
            style={{
              color: `rgba(${colors.rgb}, 0.8)`,
              backgroundColor: `rgba(${colors.rgb}, 0.1)`
            }}
          >
            <span className="flex items-center gap-1">
              📋 Elementi annidati: {data.childNodes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              🔗 {data.childEdges?.length || 0}
            </span>
          </div>
          
          <button
            onClick={handleOpenNestedCanvas}
            className="w-full py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: `rgba(${colors.rgb}, 0.2)`,
              borderColor: `rgba(${colors.rgb}, 0.3)`,
              color: `rgba(${colors.rgb}, 0.9)`,
              border: '1px solid'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(${colors.rgb}, 0.3)`;
              e.currentTarget.style.borderColor = `rgba(${colors.rgb}, 0.5)`;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(${colors.rgb}, 0.2)`;
              e.currentTarget.style.borderColor = `rgba(${colors.rgb}, 0.3)`;
              e.currentTarget.style.color = `rgba(${colors.rgb}, 0.9)`;
            }}
          >
            <span>🎨</span>
            Apri Canvas Annidato
            <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NestedCanvasNode;
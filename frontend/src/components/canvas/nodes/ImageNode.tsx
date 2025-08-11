import React, { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@/lib/reactflow-compat';
import { useTheme } from '../../../contexts/ThemeContext';
import NodeActions from './NodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface ImageNodeData {
  imageUrl: string;
  caption: string;
  title?: string; // New: Editable title/didascalia
  width?: number;
  height?: number;
  customColor?: string | null;
}

const ImageNode: React.FC<NodeProps<ImageNodeData>> = ({ data, selected, id }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [isHoveredCenter, setIsHoveredCenter] = useState(false);
  const { isDark } = useTheme();
  
  // Get dynamic colors based on node type and custom color
  const colors = getNodeColors('image', data.customColor);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };
  
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

  // Image now uses 100% of node dimensions - no fixed sizing

  const nodeStyle = {
    background: 'transparent', // Minimal background
    borderColor: data.customColor || (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'),
    borderWidth: '2px', // Minimal border as requested
    borderStyle: 'solid',
    borderRadius: '8px',
  };

  return (
    <>
      <NodeResizer 
        color={colors.resizer}
        isVisible={selected || isHoveredBorder}
      />
      <div 
        className={`
          relative transition-all duration-200 group overflow-hidden
          ${selected ? 'ring-2 ring-blue-500/50' : ''}
        `}
        style={nodeStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`
          w-3 h-3 border-2 transition-all
          ${isDark ? 'border-white bg-black' : 'border-gray-400 bg-white'}
          hover:scale-125
        `}
      />
      <Handle
        type="source" 
        position={Position.Right}
        className={`
          w-3 h-3 border-2 transition-all
          ${isDark ? 'border-white bg-black' : 'border-gray-400 bg-white'}
          hover:scale-125
        `}
      />

      {/* Image container - takes full node size */}
      <div className="relative">
        <div 
          className="relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 w-full h-full min-h-[100px]"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`
                w-6 h-6 border-2 border-t-transparent rounded-full animate-spin
                ${isDark ? 'border-white' : 'border-gray-600'}
              `}></div>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-xs text-center">
                Immagine non disponibile
              </div>
            </div>
          ) : (
            <img
              src={data.imageUrl}
              alt={data.caption || 'Immagine'}
              className={`
                w-full h-full object-cover transition-opacity duration-200
                ${isLoading ? 'opacity-0' : 'opacity-100'}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
            />
          )}
        </div>

        </div>
        
        {/* Editable Title/Caption as didascalia */}
        {(data.title || data.caption) && (
          <div className="mt-1 px-2 py-1 bg-black/70 backdrop-blur-sm">
            <p className={`
              text-xs font-medium leading-tight text-center
              text-white
            `}>
              {data.title || data.caption}
            </p>
          </div>
        )}
      </div>

      {/* Node actions */}
      <NodeActions 
        nodeId={id} 
        nodeType="image"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </>
  );
};

export default ImageNode;
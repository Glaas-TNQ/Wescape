import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@/lib/reactflow-compat';
import { useTheme } from '../../../contexts/ThemeContext';
import NodeActions from './NodeActions';

export interface ImageNodeData {
  imageUrl: string;
  caption: string;
  width?: number;
  height?: number;
  customColor?: string | null;
}

const ImageNode: React.FC<NodeProps<ImageNodeData>> = ({ data, selected, id }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isDark } = useTheme();

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Calculate responsive dimensions
  const maxWidth = 280;
  const maxHeight = 200;
  const imageWidth = Math.min(data.width || maxWidth, maxWidth);
  const imageHeight = Math.min(data.height || maxHeight, maxHeight);

  const nodeStyle = {
    background: data.customColor 
      ? (isDark ? `${data.customColor}20` : `${data.customColor}10`) 
      : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'),
    borderColor: data.customColor || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
    borderWidth: selected ? '2px' : '1px',
    borderStyle: 'solid',
  };

  return (
    <div 
      className={`
        relative rounded-lg shadow-lg transition-all duration-200 group overflow-hidden
        ${selected ? 'shadow-xl ring-2 ring-blue-500/50' : ''}
        ${isDark ? 'shadow-black/50' : 'shadow-gray-200'}
      `}
      style={nodeStyle}
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

      {/* Node content */}
      <div className="p-3">
        {/* Image container */}
        <div 
          className="relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800"
          style={{ width: imageWidth, height: imageHeight }}
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

        {/* Caption */}
        {data.caption && (
          <div className="mt-2">
            <p className={`
              text-xs font-medium leading-tight
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              {data.caption}
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

      {/* Resize indicator */}
      {selected && (
        <div className={`
          absolute bottom-1 right-1 w-3 h-3 
          border-r-2 border-b-2 opacity-50
          ${isDark ? 'border-white' : 'border-gray-600'}
        `} />
      )}
    </div>
  );
};

export default ImageNode;
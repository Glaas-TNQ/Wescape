import React, { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@/lib/reactflow-compat';
import { useTheme } from '../../../contexts/ThemeContext';
import NodeActions from './NodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface PinterestBoardNodeData {
  boardUrl: string;
  boardId?: string;
  boardName: string;
  pinCount?: number;
  description?: string;
  previewPins?: Array<{
    id: string;
    imageUrl: string;
    title?: string;
  }>;
  customColor?: string | null;
  displayMode: 'grid' | 'carousel' | 'compact';
  maxPreviews?: number;
}

const PinterestBoardNode: React.FC<NodeProps<PinterestBoardNodeData>> = ({ data, selected, id }) => {
  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { isDark } = useTheme();
  
  const colors = getNodeColors('image', data.customColor);
  const maxPreviews = data.maxPreviews || 6;
  const displayPins = data.previewPins?.slice(0, maxPreviews) || [];

  const handleImageError = (pinId: string) => {
    setImageErrors(prev => new Set([...prev, pinId]));
  };
  
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
  };

  const handleMouseLeave = () => {
    setIsHoveredBorder(false);
  };

  const handleDoubleClick = () => {
    // Emit event to open Pinterest Board modal
    window.dispatchEvent(new CustomEvent('openPinterestBoard', { 
      detail: { 
        nodeId: id,
        boardData: data
      } 
    }));
  };

  const nodeStyle = {
    background: 'transparent',
    borderColor: data.customColor || (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'),
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '8px',
  };

  const renderPreviewGrid = () => {
    if (displayPins.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
          <div className="text-4xl mb-2">📌</div>
          <div className="text-sm text-center font-medium">
            {data.boardName || 'Pinterest Board'}
          </div>
          <div className="text-xs text-center mt-1 opacity-70">
            Nessuna anteprima disponibile
          </div>
          <div className="text-xs text-center mt-2 opacity-50">
            Doppio click per aprire
          </div>
        </div>
      );
    }

    const gridClass = data.displayMode === 'compact' 
      ? 'grid-cols-2 gap-1' 
      : displayPins.length <= 4 
        ? 'grid-cols-2 gap-2' 
        : 'grid-cols-3 gap-2';

    return (
      <div className={`grid ${gridClass} h-full p-2`}>
        {displayPins.map((pin, index) => (
          <div 
            key={pin.id}
            className="relative bg-gray-200 dark:bg-gray-700 rounded overflow-hidden aspect-square group cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {imageErrors.has(pin.id) ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-lg">📷</span>
              </div>
            ) : (
              <img
                src={pin.imageUrl}
                alt={pin.title || 'Pinterest pin'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => handleImageError(pin.id)}
                loading="lazy"
              />
            )}
            
            {/* Pin overlay with hover effect */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-1">
                  <span className="text-xs font-bold text-red-600">📌</span>
                </div>
              </div>
            </div>
            
            {pin.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2">
                <div className="truncate font-medium">{pin.title}</div>
              </div>
            )}
            
            {/* Pin number indicator */}
            <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
              {index + 1}
            </div>
          </div>
        ))}
        
        {/* "View All" indicator for remaining pins */}
        {data.previewPins && data.previewPins.length > maxPreviews && (
          <div className="relative bg-gradient-to-br from-red-500 to-red-700 rounded overflow-hidden aspect-square flex items-center justify-center cursor-pointer group">
            <div className="text-center text-white">
              <div className="text-lg font-bold">+{data.previewPins.length - maxPreviews}</div>
              <div className="text-xs opacity-90">altre pin</div>
              <div className="text-xs opacity-70 mt-1">Doppio click</div>
            </div>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-200"></div>
          </div>
        )}
      </div>
    );
  };

  const renderCarouselMode = () => {
    if (displayPins.length === 0) return renderPreviewGrid();

    return (
      <div className="flex overflow-x-auto gap-2 p-2 h-full">
        {displayPins.map((pin) => (
          <div 
            key={pin.id}
            className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"
            style={{ width: '120px', height: '160px' }}
          >
            {imageErrors.has(pin.id) ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-lg">📷</span>
              </div>
            ) : (
              <img
                src={pin.imageUrl}
                alt={pin.title || 'Pinterest pin'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                onError={() => handleImageError(pin.id)}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBoardContent = () => {
    switch (data.displayMode) {
      case 'carousel':
        return renderCarouselMode();
      case 'compact':
      case 'grid':
      default:
        return renderPreviewGrid();
    }
  };

  return (
    <>
      <NodeResizer 
        color={colors.resizer}
        isVisible={selected || isHoveredBorder}
        minWidth={300}
        minHeight={250}
        maxWidth={700}
        maxHeight={600}
      />
      
      <div 
        className={`
          relative transition-all duration-200 group overflow-hidden
          ${selected ? 'ring-2 ring-blue-500/50' : ''}
        `}
        style={nodeStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
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

        {/* Pinterest board header */}
        <div className="flex items-center justify-between p-3 bg-red-600 text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <div>
              <h3 className="font-semibold text-sm truncate" style={{ maxWidth: '200px' }}>
                {data.boardName}
              </h3>
              {data.pinCount && (
                <p className="text-xs opacity-90">
                  {data.pinCount} pin{data.pinCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs">
            <span>Pinterest</span>
          </div>
        </div>

        {/* Board preview content */}
        <div className="relative bg-white dark:bg-gray-800" style={{ height: 'calc(100% - 60px)' }}>
          {renderBoardContent()}
        </div>

        {/* Description footer */}
        {data.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-2">
            <p className="text-xs leading-tight truncate">
              {data.description}
            </p>
          </div>
        )}

        {/* More pins indicator */}
        {data.previewPins && data.previewPins.length > maxPreviews && (
          <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            +{data.previewPins.length - maxPreviews}
          </div>
        )}
      </div>

      {/* Node actions */}
      <NodeActions 
        nodeId={id} 
        nodeType="pinterestBoard"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </>
  );
};

export default PinterestBoardNode;
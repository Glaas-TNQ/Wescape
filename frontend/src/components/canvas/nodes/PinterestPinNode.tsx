import React, { useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@/lib/reactflow-compat';
import { PinterestEmbed } from 'react-social-media-embed';
import { useTheme } from '../../../contexts/ThemeContext';
import NodeActions from './NodeActions';
import { getNodeColors } from '../../../utils/nodeColors';

export interface PinterestPinNodeData {
  pinUrl: string;
  pinId?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  boardName?: string;
  customColor?: string | null;
  embedMethod: 'iframe' | 'react-component' | 'api';
  width?: number;
  height?: number;
  isPinned?: boolean;
}

const PinterestPinNode: React.FC<NodeProps<PinterestPinNodeData>> = ({ data, selected, id }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHoveredBorder, setIsHoveredBorder] = useState(false);
  const { isDark } = useTheme();
  
  const colors = getNodeColors('image', data.customColor);

  const handleEmbedLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleEmbedError = () => {
    setIsLoading(false);
    setError(true);
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

  const nodeStyle = {
    background: 'transparent',
    borderColor: data.customColor || (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'),
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '8px',
  };

  const renderPinterestEmbed = () => {
    if (!data.pinUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <div className="text-4xl mb-2">📌</div>
          <div className="text-sm text-center">
            Pinterest Pin non configurato
          </div>
          <div className="text-xs text-center mt-1 opacity-70">
            Clicca per modificare
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-gray-500">
          <div className="text-3xl mb-2">📌❌</div>
          <div className="text-sm text-center">
            Errore caricamento Pinterest Pin
          </div>
          <div className="text-xs text-center mt-1 opacity-70">
            Verifica l'URL del pin
          </div>
        </div>
      );
    }

    switch (data.embedMethod) {
      case 'react-component':
        return (
          <div className="w-full h-full min-h-[200px]">
            <PinterestEmbed 
              url={data.pinUrl}
              width="100%"
              height="100%"
              onLoad={handleEmbedLoad}
              onError={handleEmbedError}
            />
          </div>
        );
      
      case 'iframe':
        const pinId = data.pinId || data.pinUrl.split('/').pop();
        return (
          <iframe
            src={`https://assets.pinterest.com/ext/embed.html?id=${pinId}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            style={{ minHeight: '200px' }}
            onLoad={handleEmbedLoad}
            onError={handleEmbedError}
          />
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center p-6 text-gray-500">
            <div className="text-3xl mb-2">📌</div>
            <div className="text-sm text-center">
              {data.title || 'Pinterest Pin'}
            </div>
            <div className="text-xs text-center mt-1 opacity-70">
              {data.description || 'Clicca per visualizzare'}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <NodeResizer 
        color={colors.resizer}
        isVisible={selected || isHoveredBorder}
        minWidth={250}
        minHeight={200}
        maxWidth={600}
        maxHeight={800}
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

        {/* Pinterest branding indicator */}
        <div className="absolute top-2 left-2 z-10">
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
            bg-red-600 text-white shadow-sm
          `}>
            <span>📌</span>
            <span>Pinterest</span>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
            <div className={`
              w-6 h-6 border-2 border-t-transparent rounded-full animate-spin
              ${isDark ? 'border-white' : 'border-gray-600'}
            `}></div>
          </div>
        )}

        {/* Pinterest embed container */}
        <div className="relative w-full h-full min-h-[200px] rounded-md overflow-hidden bg-white dark:bg-gray-800">
          {renderPinterestEmbed()}
        </div>

        {/* Pin title/caption */}
        {(data.title || data.boardName) && !isLoading && !error && (
          <div className="mt-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-b-md">
            <p className="text-xs font-medium leading-tight text-center text-white">
              {data.title || `Da: ${data.boardName}`}
            </p>
          </div>
        )}
      </div>

      {/* Node actions */}
      <NodeActions 
        nodeId={id} 
        nodeType="pinterestPin"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </>
  );
};

export default PinterestPinNode;
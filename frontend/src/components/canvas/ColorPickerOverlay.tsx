import React, { useState, useEffect } from 'react';
import { getNodeColors } from '../../utils/nodeColors';
import { type NodeType } from './nodes';

interface ColorPickerOverlayProps {
  isOpen: boolean;
  nodeId: string;
  nodeType: NodeType;
  currentColor: string | null;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (color: string | null) => void;
  onPreview?: (color: string | null) => void;
}

const ColorPickerOverlay: React.FC<ColorPickerOverlayProps> = ({
  isOpen,
  nodeId,
  nodeType,
  currentColor,
  position,
  onClose,
  onSave,
  onPreview,
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [customColor, setCustomColor] = useState(currentColor || '#6366f1');

  // Function to handle color selection with real-time preview
  const handleColorSelect = (color: string | null) => {
    setSelectedColor(color);
    if (onPreview) {
      onPreview(color);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(currentColor);
      setCustomColor(currentColor || '#6366f1');
    }
  }, [isOpen, currentColor]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.color-picker-overlay')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presetColors = [
    { name: 'Indaco', value: '#6366f1' },
    { name: 'Viola', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Blu', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Lime', value: '#65a30d' },
    { name: 'Giallo', value: '#eab308' },
    { name: 'Arancione', value: '#f59e0b' },
    { name: 'Rosso', value: '#ef4444' },
    { name: 'Grigio', value: '#6b7280' },
    { name: 'Nero', value: '#374151' },
  ];

  const handleSave = () => {
    onSave(selectedColor);
    onClose();
  };

  const handleCancel = () => {
    // Restore original color when canceling
    if (onPreview) {
      onPreview(currentColor);
    }
    onClose();
  };

  const previewColors = getNodeColors(nodeType, selectedColor);

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      <div
        className="color-picker-overlay absolute bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 pointer-events-auto"
        style={{
          left: Math.min(position.x, window.innerWidth - 320), // Keep within viewport
          top: Math.min(position.y, window.innerHeight - 400),
          width: '300px',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div 
            className="w-6 h-6 rounded-full border-2 border-white/40"
            style={{ backgroundColor: previewColors.base }}
          />
          <h3 className="text-white font-medium">Colore Nodo</h3>
        </div>

        {/* Reset to default */}
        <button
          type="button"
          onClick={() => handleColorSelect(null)}
          className={`w-full px-3 py-2 rounded-lg text-sm transition-colors mb-4 ${
            selectedColor === null 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
        >
          🔄 Usa colore di default
        </button>

        {/* Preset colors */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Colori predefiniti</p>
          <div className="grid grid-cols-6 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  handleColorSelect(color.value);
                  setCustomColor(color.value);
                }}
                className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 ${
                  selectedColor === color.value 
                    ? 'border-white shadow-lg scale-110' 
                    : 'border-white/20 hover:border-white/50'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Custom color picker */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Colore personalizzato</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                handleColorSelect(e.target.value);
              }}
              className="w-12 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                  handleColorSelect(e.target.value);
                }
              }}
              placeholder="#6366f1"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 text-sm"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors text-sm"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors text-sm"
          >
            Applica
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerOverlay;
import { type NodeType } from '../components/canvas/nodes';

// Default colors for each node type
const DEFAULT_NODE_COLORS = {
  destination: '#8b5cf6', // purple
  activity: '#06b6d4',    // cyan
  restaurant: '#f59e0b',  // amber
  hotel: '#10b981',       // emerald
  transport: '#ef4444',   // red
  note: '#eab308',        // yellow
  dayDivider: '#6366f1',  // indigo
  nestedCanvas: '#a855f7', // violet
};

// Convert hex to RGB values
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Generate color variations for borders, backgrounds, etc.
export const getNodeColors = (nodeType: NodeType, customColor?: string | null) => {
  const baseColor = customColor || DEFAULT_NODE_COLORS[nodeType];
  const rgb = hexToRgb(baseColor);
  
  if (!rgb) {
    // Fallback to default if color parsing fails
    const fallbackRgb = hexToRgb(DEFAULT_NODE_COLORS[nodeType]);
    if (!fallbackRgb) return getDefaultColors();
    return {
      base: DEFAULT_NODE_COLORS[nodeType],
      rgb: `${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}`,
      border: DEFAULT_NODE_COLORS[nodeType],
      borderHover: DEFAULT_NODE_COLORS[nodeType],
      borderSelected: DEFAULT_NODE_COLORS[nodeType],
      background: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.1)`,
      backgroundHover: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.2)`,
      backgroundSelected: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.3)`,
      shadow: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.4)`,
      ring: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.3)`,
      handle: DEFAULT_NODE_COLORS[nodeType],
      resizer: `rgb(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b})`,
      minimap: DEFAULT_NODE_COLORS[nodeType],
      secondary: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.6)`,
      textSecondary: `rgba(${fallbackRgb.r}, ${fallbackRgb.g}, ${fallbackRgb.b}, 0.8)`,
    };
  }

  return {
    base: baseColor,
    rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    border: baseColor,
    borderHover: baseColor,
    borderSelected: baseColor,
    background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    backgroundHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
    backgroundSelected: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    shadow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
    ring: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    handle: baseColor,
    resizer: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    minimap: baseColor,
    secondary: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
    textSecondary: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
  };
};

// Fallback colors in case of any errors
const getDefaultColors = () => ({
  base: '#6b7280',
  rgb: '107, 114, 128',
  border: '#6b7280',
  borderHover: '#6b7280',
  borderSelected: '#6b7280',
  background: 'rgba(107, 114, 128, 0.1)',
  backgroundHover: 'rgba(107, 114, 128, 0.2)',
  backgroundSelected: 'rgba(107, 114, 128, 0.3)',
  shadow: 'rgba(107, 114, 128, 0.4)',
  ring: 'rgba(107, 114, 128, 0.3)',
  secondary: 'rgba(107, 114, 128, 0.6)',
  textSecondary: 'rgba(107, 114, 128, 0.8)',
  handle: '#6b7280',
  resizer: 'rgb(107, 114, 128)',
  minimap: '#6b7280',
});

// Get color for minimap (used in canvas components)
export const getNodeMinimapColor = (nodeType: NodeType, customColor?: string | null) => {
  return getNodeColors(nodeType, customColor).minimap;
};
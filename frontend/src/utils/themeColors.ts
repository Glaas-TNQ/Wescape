// Theme-based color utilities
export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    canvas: string;
    modal: string;
    overlay: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  
  // Interactive elements
  interactive: {
    hover: string;
    active: string;
    disabled: string;
  };
  
  // Surface colors
  surface: {
    primary: string;
    secondary: string;
  };
  
  // Node specific
  node: {
    shadow: string;
    handle: string;
    selected: string;
  };
}

export const darkTheme: ThemeColors = {
  background: {
    primary: '#050505',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    canvas: '#050505',
    modal: 'rgba(17, 24, 39, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    inverse: '#000000',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.2)',
    focus: 'rgba(99, 102, 241, 0.6)',
  },
  interactive: {
    hover: 'rgba(255, 255, 255, 0.1)',
    active: 'rgba(255, 255, 255, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.05)',
  },
  surface: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
  },
  node: {
    shadow: 'rgba(0, 0, 0, 0.5)',
    handle: 'rgba(255, 255, 255, 0.1)',
    selected: 'rgba(99, 102, 241, 0.3)',
  },
};

export const lightTheme: ThemeColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    canvas: '#fafafa',
    modal: 'rgba(255, 255, 255, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    inverse: '#ffffff',
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.1)',
    secondary: 'rgba(0, 0, 0, 0.2)',
    focus: 'rgba(99, 102, 241, 0.6)',
  },
  interactive: {
    hover: 'rgba(0, 0, 0, 0.05)',
    active: 'rgba(0, 0, 0, 0.1)',
    disabled: 'rgba(0, 0, 0, 0.02)',
  },
  surface: {
    primary: '#ffffff',
    secondary: '#f9fafb',
  },
  node: {
    shadow: 'rgba(0, 0, 0, 0.15)',
    handle: 'rgba(0, 0, 0, 0.1)',
    selected: 'rgba(99, 102, 241, 0.2)',
  },
};

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark ? darkTheme : lightTheme;
};

// Canvas specific backgrounds
export const getCanvasBackground = (isDark: boolean) => {
  if (isDark) {
    return {
      background: '#050505',
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
      `,
    };
  } else {
    return {
      background: '#fafafa',
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)
      `,
    };
  }
};

// ReactFlow background colors
export const getReactFlowBackground = (isDark: boolean) => {
  return {
    gap: 30,
    size: 1,
    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };
};

// MiniMap colors
export const getMiniMapColors = (isDark: boolean) => {
  return {
    className: isDark ? '!bg-gray-900/90 !border-white/20' : '!bg-white/90 !border-gray-300',
    maskColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  };
};

// Controls colors
export const getControlsColors = (isDark: boolean) => {
  return {
    className: isDark ? '!bg-gray-900/90 !border-white/20' : '!bg-white/90 !border-gray-300',
  };
};
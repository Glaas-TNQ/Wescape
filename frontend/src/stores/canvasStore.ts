import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, type Node, type Edge, type Connection, type NodeChange, type EdgeChange, type XYPosition } from 'reactflow';
import { type NodeType } from '../components/canvas/nodes';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
}

export interface CanvasStore extends CanvasState {
  selectedNodes: string[];
  history: CanvasState[];
  historyIndex: number;
  
  // Node operations
  addNode: (type: NodeType, position: XYPosition, data?: any) => void;
  updateNode: (id: string, data: Partial<any>) => void;
  deleteNodes: (ids: string[]) => void;
  
  // Edge operations
  onConnect: (connection: Connection) => void;
  
  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  
  // Selection
  setSelectedNodes: (nodeIds: string[]) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Utility
  fitView: () => void;
  autoLayout: () => void;
  clearCanvas: () => void;
  loadSampleData: () => void;
}

// Default node data generators
const getDefaultNodeData = (type: NodeType) => {
  const defaults = {
    destination: {
      title: 'Nuova Destinazione',
      description: 'Clicca per aggiungere dettagli',
      date: '',
      customColor: null, // null means use default color
    },
    activity: {
      title: 'Nuova Attività',
      description: 'Clicca per aggiungere dettagli',
      time: '',
      duration: '',
      customColor: null,
    },
    restaurant: {
      title: 'Nuovo Ristorante',
      description: 'Clicca per aggiungere dettagli',
      time: '',
      cuisine: '',
      priceRange: '€€',
      customColor: null,
    },
    hotel: {
      title: 'Nuovo Hotel',
      description: 'Clicca per aggiungere dettagli',
      checkIn: '',
      checkOut: '',
      stars: 3,
      customColor: null,
    },
    transport: {
      title: 'Nuovo Trasporto',
      description: 'Clicca per aggiungere dettagli',
      departure: '',
      arrival: '',
      type: 'car' as const,
      customColor: null,
    },
    note: {
      title: 'Nota',
      content: 'Aggiungi le tue note qui...',
      color: 'yellow' as const,
      customColor: null,
    },
    dayDivider: {
      day: 1,
      date: new Date().toLocaleDateString('it-IT'),
      title: 'Giorno 1',
      customColor: null,
    },
    nestedCanvas: {
      title: 'Nuovo Canvas Annidato',
      description: 'Clicca per aprire il canvas di dettaglio',
      childNodes: [],
      childEdges: [],
      isExpanded: false,
      customColor: null,
    },
  };
  
  return defaults[type] || {};
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  history: [],
  historyIndex: -1,
  
  addNode: (type: NodeType, position: XYPosition, customData = {}) => {
    // Dimensioni default per ogni tipo di nodo
    const getDefaultDimensions = (nodeType: NodeType) => {
      switch (nodeType) {
        case 'destination': return { width: 220, height: 140 };
        case 'activity': return { width: 220, height: 160 };
        case 'restaurant': return { width: 220, height: 160 };
        case 'hotel': return { width: 220, height: 180 };
        case 'transport': return { width: 220, height: 160 };
        case 'note': return { width: 200, height: 120 };
        case 'dayDivider': return { width: 320, height: 140 };
        case 'nestedCanvas': return { width: 280, height: 180 };
        default: return { width: 220, height: 140 };
      }
    };
    
    const newNode: Node = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      data: { ...getDefaultNodeData(type), ...customData },
      ...getDefaultDimensions(type),
    };
    
    set(state => {
      const newState = {
        ...state,
        nodes: [...state.nodes, newNode],
      };
      // Save to history after adding
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ nodes: newState.nodes, edges: newState.edges });
      
      return {
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },
  
  updateNode: (id: string, data: Partial<any>) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },
  
  deleteNodes: (ids: string[]) => {
    set(state => {
      const newNodes = state.nodes.filter(node => !ids.includes(node.id));
      const newEdges = state.edges.filter(edge => 
        !ids.includes(edge.source) && !ids.includes(edge.target)
      );
      
      const newState = { nodes: newNodes, edges: newEdges };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newState);
      
      return {
        ...state,
        ...newState,
        selectedNodes: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },
  
  onConnect: (connection: Connection) => {
    set(state => ({
      edges: addEdge({
        ...connection,
        id: `${connection.source}-${connection.target}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      }, state.edges),
    }));
  },
  
  onNodesChange: (changes: NodeChange[]) => {
    set(state => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    set(state => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  
  setSelectedNodes: (nodeIds: string[]) => {
    set({ selectedNodes: nodeIds });
  },
  
  undo: () => {
    set(state => {
      if (state.historyIndex > 0) {
        const prevState = state.history[state.historyIndex - 1];
        return {
          ...state,
          ...prevState,
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    });
  },
  
  redo: () => {
    set(state => {
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          ...nextState,
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    });
  },
  
  saveToHistory: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ nodes: state.nodes, edges: state.edges });
      
      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },
  
  fitView: () => {
    // This will be handled by the ReactFlow instance
    console.log('Fit view triggered');
  },
  
  autoLayout: () => {
    set(state => {
      const layoutNodes = state.nodes.map((node, index) => ({
        ...node,
        position: {
          x: 100 + (index % 4) * 300,
          y: 100 + Math.floor(index / 4) * 200,
        },
      }));
      
      const newState = { nodes: layoutNodes, edges: state.edges };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newState);
      
      return {
        ...state,
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },
  
  clearCanvas: () => {
    set(state => {
      const newState = { nodes: [], edges: [] };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newState);
      
      return {
        ...state,
        ...newState,
        selectedNodes: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  loadSampleData: () => {
    const sampleNodes = [
      {
        id: 'destination_1',
        type: 'destination',
        position: { x: 200, y: 100 },
        data: {
          title: 'Roma',
          description: 'La città eterna ti aspetta con la sua storia millenaria',
          date: '15-18 Maggio 2024',
          location: 'Roma, Italia'
        }
      },
      {
        id: 'activity_1',
        type: 'activity',
        position: { x: 500, y: 100 },
        data: {
          title: 'Colosseo',
          description: 'Tour guidato con accesso prioritario ai sotterranei',
          time: 'Giorno 1 • 09:00-12:00',
          duration: '3 ore',
          category: 'Monumenti'
        }
      },
      {
        id: 'restaurant_1',
        type: 'restaurant',
        position: { x: 350, y: 300 },
        data: {
          title: 'Trattoria Monti',
          description: 'Cucina romana autentica nel cuore di Roma',
          time: 'Giorno 1 • 13:00',
          cuisine: 'Romana',
          priceRange: '€€',
          rating: 4.5
        }
      },
      {
        id: 'hotel_1',
        type: 'hotel',
        position: { x: 650, y: 300 },
        data: {
          title: 'Hotel Artemide',
          description: '4★ elegante hotel vicino alla Stazione Termini',
          checkIn: '15 Maggio, 15:00',
          checkOut: '18 Maggio, 11:00',
          stars: 4
        }
      }
    ];

    const sampleEdges = [
      {
        id: 'destination_1-activity_1',
        source: 'destination_1',
        target: 'activity_1',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 }
      },
      {
        id: 'activity_1-restaurant_1',
        source: 'activity_1',
        target: 'restaurant_1',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 }
      }
    ];

    set(state => {
      const newState = { nodes: sampleNodes, edges: sampleEdges };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newState);
      
      return {
        ...state,
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },
}));

// Mock AI functions
export const mockAI = {
  analyzePlan: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      suggestions: [
        {
          id: '1',
          type: 'warning' as const,
          title: 'Conflitto orario rilevato',
          description: 'Due attività si sovrappongono nel tempo',
          action: 'adjust_timing',
        },
        {
          id: '2',
          type: 'suggestion' as const,
          title: 'Aggiungi pausa pranzo',
          description: 'Consigliamo una pausa tra le attività mattutine e pomeridiane',
          action: 'add_restaurant',
        },
      ],
    };
  },
  
  optimizeRoute: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      optimizedNodes: [],
      savings: {
        time: '45 minuti',
        distance: '12 km',
      },
    };
  },
  
  generateSuggestions: async (nodeType: NodeType) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const suggestions: Record<string, string[]> = {
      destination: ['Roma Centro', 'Trastevere', 'Vaticano'],
      activity: ['Colosseo', 'Musei Vaticani', 'Fontana di Trevi'],
      restaurant: ['Trattoria Monti', 'Da Enzo', 'Piperno'],
      hotel: ['Hotel Artemide', 'Hotel de Russie', 'Hotel Hassler'],
      transport: ['Metro Linea A', 'Taxi', 'Bus turistico'],
      note: ['Ricorda di...', 'Non dimenticare...', 'Importante:'],
      dayDivider: ['Giorno 1', 'Giorno 2', 'Giorno 3'],
    };
    
    return suggestions[nodeType] || [];
  },
};
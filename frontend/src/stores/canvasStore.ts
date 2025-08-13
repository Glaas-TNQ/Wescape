import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, type Node, type Edge, type Connection, type NodeChange, type EdgeChange, type XYPosition } from '@/lib/reactflow-compat';
import { type NodeType } from '../components/canvas/nodes';
import { supabase } from '../lib/supabase';
import { sampleNodes, sampleEdges } from '../components/canvas/SampleData';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
}

export interface CanvasStore extends CanvasState {
  selectedNodes: string[];
  history: CanvasState[];
  historyIndex: number;
  currentTripId: string | null;
  
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
  
  // Trip Persistence
  loadTripCanvas: (tripId: string) => Promise<void>;
  saveTripCanvas: (tripId: string) => Promise<void>;
  setCurrentTrip: (tripId: string | null) => void;
  
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
    image: {
      imageUrl: '',
      caption: 'Nuova Immagine',
      title: '', // Editable title for didascalia
      width: 280,
      height: 200,
      customColor: null,
    },
    pinterestPin: {
      pinUrl: '',
      title: 'Pinterest Pin',
      description: 'Clicca per configurare il pin',
      embedMethod: 'react-component' as const,
      customColor: null,
      isPinned: false,
    },
    pinterestBoard: {
      boardUrl: '',
      boardName: 'Pinterest Board',
      description: 'Clicca per configurare la board',
      displayMode: 'grid' as const,
      maxPreviews: 6,
      pinCount: 0,
      previewPins: [],
      customColor: null,
    },
  };
  
  return defaults[type] || {};
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  history: [],
  historyIndex: -1,
  currentTripId: null,
  
  addNode: (type: NodeType, position: XYPosition, customData = {}) => {
    // Dimensioni default per ogni tipo di nodo
    const getDefaultDimensions = (nodeType: NodeType) => {
      const dimensions = {
        'destination': { width: 220, height: 140 },
        'activity': { width: 220, height: 160 },
        'restaurant': { width: 220, height: 160 },
        'hotel': { width: 220, height: 180 },
        'transport': { width: 220, height: 160 },
        'note': { width: 200, height: 120 },
        'dayDivider': { width: 320, height: 140 },
        'nestedCanvas': { width: 280, height: 180 },
        'image': { width: 280, height: 240 }
      };
      
      const { width, height } = dimensions[nodeType] || { width: 220, height: 140 };
      return {
        width,
        height,
        style: { width: `${width}px`, height: `${height}px` }
      };
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
          ? { 
              ...node, 
              data: { ...node.data, ...data },
              // Preserve original dimensions to prevent auto-resize
              style: {
                ...node.style,
                width: node.style?.width || node.width,
                height: node.style?.height || node.height
              }
            }
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

  loadTripCanvas: async (tripId: string) => {
    const startTime = performance.now();
    console.group(`📥 LOAD CANVAS: ${tripId}`);
    
    try {
      // Log pre-caricamento
      console.log('🔍 Loading Canvas for Trip:', {
        tripId,
        timestamp: new Date().toISOString()
      });

      // Log della query Supabase
      console.log('🔍 Supabase Query:', {
        table: 'trips',
        operation: 'select',
        fields: ['canvas_data'],
        filter: { id: tripId },
        modifier: 'single()'
      });

      const { data, error } = await supabase
        .from('trips')
        .select('canvas_data')
        .eq('id', tripId)
        .single();

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (error) {
        console.error('❌ Supabase Load Error:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          duration: `${duration.toFixed(2)}ms`,
          tripId
        });
        return;
      }

      // Log dei dati ricevuti
      console.log('📦 Raw Data Received:', {
        data,
        hasCanvasData: !!data?.canvas_data,
        canvasDataType: typeof data?.canvas_data,
        duration: `${duration.toFixed(2)}ms`
      });

      const canvasData = data?.canvas_data;
      
      // Log analisi canvas data
      if (canvasData) {
        console.log('🔍 Canvas Data Analysis:', {
          isObject: typeof canvasData === 'object',
          hasNodes: !!canvasData.nodes,
          hasEdges: !!canvasData.edges,
          nodeCount: canvasData.nodes?.length || 0,
          edgeCount: canvasData.edges?.length || 0,
          lastModified: canvasData.lastModified,
          canvasDataSize: JSON.stringify(canvasData).length
        });
        
        console.log('📝 Loaded Nodes:', canvasData.nodes);
        console.log('🔗 Loaded Edges:', canvasData.edges);
      } else {
        console.warn('⚠️ No Canvas Data Found:', {
          message: 'canvas_data is null, undefined, or empty',
          receivedData: data
        });
      }

      if (canvasData && typeof canvasData === 'object' && canvasData.nodes && canvasData.edges) {
        console.log('✅ Setting Canvas State with Loaded Data');
        
        set(state => ({
          ...state,
          nodes: canvasData.nodes,
          edges: canvasData.edges,
          selectedNodes: [],
          currentTripId: tripId,
          // Reset history with loaded state
          history: [{ nodes: canvasData.nodes, edges: canvasData.edges }],
          historyIndex: 0,
        }));

        console.log('✅ Canvas Loaded Successfully:', {
          tripId,
          nodesLoaded: canvasData.nodes.length,
          edgesLoaded: canvasData.edges.length,
          duration: `${duration.toFixed(2)}ms`
        });
      } else {
        console.log('🆕 Initializing Empty Canvas (no data found)');
        
        // No canvas data exists, start with empty canvas
        set(state => ({
          ...state,
          nodes: [],
          edges: [],
          selectedNodes: [],
          currentTripId: tripId,
          history: [{ nodes: [], edges: [] }],
          historyIndex: 0,
        }));

        console.log('✅ Empty Canvas Initialized:', {
          tripId,
          reason: 'No valid canvas_data found',
          duration: `${duration.toFixed(2)}ms`
        });
      }
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error('💥 Load Canvas Error:', {
        error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        duration: `${duration.toFixed(2)}ms`,
        tripId
      });
    } finally {
      console.groupEnd();
    }
  },

  saveTripCanvas: async (tripId: string) => {
    const startTime = performance.now();
    console.group(`🔄 SAVE CANVAS: ${tripId}`);
    
    try {
      const state = get();
      const canvasData = {
        nodes: state.nodes,
        edges: state.edges,
        lastModified: new Date().toISOString(),
      };

      // Log pre-salvataggio
      console.log('📊 Canvas State to Save:', {
        tripId,
        nodeCount: state.nodes.length,
        edgeCount: state.edges.length,
        canvasDataSize: JSON.stringify(canvasData).length,
        timestamp: new Date().toISOString()
      });
      
      console.log('📝 Nodes Data:', state.nodes);
      console.log('🔗 Edges Data:', state.edges);
      console.log('💾 Full Canvas Data:', canvasData);

      // Log della query Supabase
      console.log('🔍 Supabase Query:', {
        table: 'trips',
        operation: 'update',
        filter: { id: tripId },
        payload: {
          canvas_data: canvasData,
          updated_at: new Date().toISOString()
        }
      });

      const { data, error } = await supabase
        .from('trips')
        .update({
          canvas_data: canvasData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select(); // Aggiungiamo select per vedere cosa viene restituito

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (error) {
        console.error('❌ Supabase Error Details:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          duration: `${duration.toFixed(2)}ms`
        });
        throw error;
      }

      console.log('✅ Canvas Saved Successfully:', {
        tripId,
        duration: `${duration.toFixed(2)}ms`,
        responseData: data,
        nodesCount: state.nodes.length,
        edgesCount: state.edges.length
      });

    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error('💥 Save Canvas Error:', {
        error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
        duration: `${duration.toFixed(2)}ms`,
        tripId
      });
      
      throw error;
    } finally {
      console.groupEnd();
    }
  },

  setCurrentTrip: (tripId: string | null) => {
    set(state => ({
      ...state,
      currentTripId: tripId,
    }));
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
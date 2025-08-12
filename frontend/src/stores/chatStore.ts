import { create } from 'zustand';
import { type Node } from '@/lib/reactflow-compat';

// Tipi per il sistema chat
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    nodesCreated?: string[];
    action?: 'create_nodes' | 'modify_nodes' | 'analyze_canvas';
    status?: 'sending' | 'processing' | 'completed' | 'error';
  };
}

export interface CanvasContext {
  tripId: string | null;
  viewport: { x: number; y: number; zoom: number };
  existingNodes: Node[];
  selectedNodes: string[];
  lastModified?: string;
}

export interface ChatState {
  // UI State
  isOpen: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Messages
  messages: ChatMessage[];
  currentTyping: string | null;
  conversationId: string | null;
  
  // Context Awareness
  canvasContext: CanvasContext;
  
  // Preferences
  autoScroll: boolean;
  soundEnabled: boolean;
  
  // AI Response tracking
  pendingNodeIds: string[];
  lastAIAction?: {
    type: 'create_nodes' | 'modify_nodes';
    nodeIds: string[];
    timestamp: Date;
  };
}

export interface ChatStore extends ChatState {
  // UI Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  
  // Message Management
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  markMessageAsError: (messageId: string, error: string) => void;
  
  // Context Management
  setCanvasContext: (context: Partial<CanvasContext>) => void;
  refreshCanvasContext: () => void;
  
  // AI Response Handling
  startTyping: (content?: string) => void;
  stopTyping: () => void;
  handleAIResponse: (response: any) => void;
  
  // Node Creation Feedback
  setPendingNodes: (nodeIds: string[]) => void;
  confirmNodesCreated: (nodeIds: string[]) => void;
  
  // Error Handling
  setError: (error: string) => void;
  clearError: () => void;
  
  // Settings
  setAutoScroll: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Conversation Management
  startNewConversation: () => void;
  setConversationId: (id: string) => void;
}

// Suggerimenti predefiniti per l'input
export const chatSuggestions = [
  {
    category: 'Ristoranti',
    suggestions: [
      'Trova ristoranti vegani vicino a {location}',
      'Suggerisci posti per cena romantica in zona',
      'Ristoranti con terrazza panoramica',
      'Dove mangiare con bambini?'
    ]
  },
  {
    category: 'Attività',
    suggestions: [
      'Cosa vedere vicino a {location}?',
      'Attività per bambini a {location}',
      'Musei gratuiti in zona',
      'Tour guidati disponibili'
    ]
  },
  {
    category: 'Hotel',
    suggestions: [
      'Hotel 4 stelle economici in zona {location}',
      'B&B con colazione inclusa',
      'Alloggi pet-friendly',
      'Hotel con spa e benessere'
    ]
  },
  {
    category: 'Trasporti',
    suggestions: [
      'Come spostarsi da {origin} a {destination}?',
      'Mezzi pubblici per arrivare a {location}',
      'Parcheggi gratuiti vicino a {location}',
      'Taxi vs metro: quale conviene?'
    ]
  },
  {
    category: 'Pianificazione',
    suggestions: [
      'Ottimizza il mio itinerario per oggi',
      'Aggiungi una pausa pranzo tra queste attività',
      'Riorganizza per minimizzare gli spostamenti',
      'Quanto tempo serve per questo itinerario?'
    ]
  }
];

// Store Zustand per il chat
export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial State
  isOpen: false,
  isLoading: false,
  hasError: false,
  errorMessage: undefined,
  messages: [],
  currentTyping: null,
  conversationId: null,
  canvasContext: {
    tripId: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    existingNodes: [],
    selectedNodes: [],
  },
  autoScroll: true,
  soundEnabled: true,
  pendingNodeIds: [],
  lastAIAction: undefined,

  // UI Actions
  toggleChat: () => {
    set(state => ({ isOpen: !state.isOpen }));
  },

  openChat: () => {
    set({ isOpen: true });
  },

  closeChat: () => {
    set({ isOpen: false });
  },

  // Message Management
  sendMessage: async (message: string) => {
    const state = get();
    
    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: message,
        timestamp: new Date(),
        metadata: { status: 'sending' }
      };
      
      set(prevState => ({
        messages: [...prevState.messages, userMessage],
        isLoading: true,
        hasError: false
      }));

      // Prepare request payload
      const payload = {
        message,
        trip_id: state.canvasContext.tripId,
        canvas_context: {
          viewport: state.canvasContext.viewport,
          existing_nodes: state.canvasContext.existingNodes,
          selected_nodes: state.canvasContext.selectedNodes
        }
      };

      // Send to backend API
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update conversation ID
      set({ conversationId: result.conversation_id });
      
      // Start typing indicator
      get().startTyping('Mona sta elaborando la tua richiesta...');
      
      // Update user message status
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, metadata: { ...msg.metadata, status: 'completed' } }
            : msg
        )
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark user message as error and show error message
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, metadata: { ...msg.metadata, status: 'error' } }
            : msg
        ),
        isLoading: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Errore sconosciuto'
      }));
    }
  },

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `${message.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    set(state => ({
      messages: [...state.messages, newMessage]
    }));
  },

  clearMessages: () => {
    set({ 
      messages: [], 
      conversationId: null,
      currentTyping: null,
      isLoading: false 
    });
  },

  markMessageAsError: (messageId: string, error: string) => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === messageId
          ? { 
              ...msg, 
              metadata: { 
                ...msg.metadata, 
                status: 'error' 
              } 
            }
          : msg
      ),
      hasError: true,
      errorMessage: error
    }));
  },

  // Context Management
  setCanvasContext: (context: Partial<CanvasContext>) => {
    set(state => ({
      canvasContext: { ...state.canvasContext, ...context }
    }));
  },

  refreshCanvasContext: () => {
    // This will be called by the Canvas component to update context
    // when viewport changes, nodes are added/removed, etc.
    console.log('Refreshing canvas context for chat');
  },

  // AI Response Handling
  startTyping: (content?: string) => {
    set({ 
      currentTyping: content || 'Mona sta scrivendo...', 
      isLoading: true 
    });
  },

  stopTyping: () => {
    set({ 
      currentTyping: null, 
      isLoading: false 
    });
  },

  handleAIResponse: (response: any) => {
    const { stopTyping, addMessage, confirmNodesCreated } = get();
    
    stopTyping();

    // Add AI response message
    addMessage({
      type: 'assistant',
      content: response.message || 'Ho elaborato la tua richiesta.',
      metadata: {
        action: response.action || 'create_nodes',
        nodesCreated: response.nodes_created || [],
        status: 'completed'
      }
    });

    // Handle created nodes
    if (response.nodes_created && response.nodes_created.length > 0) {
      confirmNodesCreated(response.nodes_created);
    }
  },

  // Node Creation Feedback
  setPendingNodes: (nodeIds: string[]) => {
    set({ pendingNodeIds: nodeIds });
  },

  confirmNodesCreated: (nodeIds: string[]) => {
    set({
      pendingNodeIds: [],
      lastAIAction: {
        type: 'create_nodes',
        nodeIds,
        timestamp: new Date()
      }
    });

    // Add system message for user feedback
    get().addMessage({
      type: 'system',
      content: `✨ Ho creato ${nodeIds.length} nuov${nodeIds.length === 1 ? 'o nodo' : 'i nodi'} nel tuo canvas!`,
      metadata: {
        action: 'create_nodes',
        nodesCreated: nodeIds
      }
    });
  },

  // Error Handling
  setError: (error: string) => {
    set({ 
      hasError: true, 
      errorMessage: error, 
      isLoading: false 
    });
  },

  clearError: () => {
    set({ 
      hasError: false, 
      errorMessage: undefined 
    });
  },

  // Settings
  setAutoScroll: (enabled: boolean) => {
    set({ autoScroll: enabled });
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },

  // Conversation Management
  startNewConversation: () => {
    set({
      messages: [],
      conversationId: null,
      currentTyping: null,
      isLoading: false,
      hasError: false,
      errorMessage: undefined,
      pendingNodeIds: [],
      lastAIAction: undefined
    });

    // Add welcome message
    get().addMessage({
      type: 'assistant',
      content: '👋 Ciao! Sono Mona, la tua assistente AI per la pianificazione viaggi. Come posso aiutarti oggi?',
      metadata: { action: 'analyze_canvas' }
    });
  },

  setConversationId: (id: string) => {
    set({ conversationId: id });
  },
}));

// Helper functions per formattare le suggestions
export const getContextualSuggestions = (canvasContext: CanvasContext): string[] => {
  const suggestions: string[] = [];
  
  // Suggestions basate sui nodi esistenti
  const nodeTypes = canvasContext.existingNodes.map(node => node.type);
  const hasDestinations = nodeTypes.includes('destination');
  const hasRestaurants = nodeTypes.includes('restaurant');
  const hasActivities = nodeTypes.includes('activity');
  const hasHotels = nodeTypes.includes('hotel');

  if (!hasDestinations) {
    suggestions.push('Aggiungi delle destinazioni al tuo viaggio');
  }
  
  if (hasDestinations && !hasRestaurants) {
    suggestions.push('Trova ristoranti nelle tue destinazioni');
  }
  
  if (hasDestinations && !hasActivities) {
    suggestions.push('Scopri cosa fare nelle tue destinazioni');
  }
  
  if (hasDestinations && !hasHotels) {
    suggestions.push('Trova alloggi per il tuo soggiorno');
  }

  // Suggestions per ottimizzazione
  if (canvasContext.existingNodes.length >= 3) {
    suggestions.push('Ottimizza il mio itinerario');
    suggestions.push('Controlla i tempi di spostamento');
  }

  // Default suggestions se non ci sono nodi
  if (canvasContext.existingNodes.length === 0) {
    suggestions.push(
      'Pianifica un weekend a Roma',
      'Trova ristoranti vegani in centro',
      'Suggerisci attività per bambini',
      'Hotel economici con buone recensioni'
    );
  }

  return suggestions.slice(0, 4); // Massimo 4 suggestions
};

// Hook per keyboard shortcuts
export const useChatKeyboardShortcuts = () => {
  const { toggleChat, closeChat } = useChatStore();

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+M o Cmd+M per toggle chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
      event.preventDefault();
      toggleChat();
    }
    
    // Escape per chiudere chat
    if (event.key === 'Escape') {
      closeChat();
    }
  };

  return { handleKeyDown };
};
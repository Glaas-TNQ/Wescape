WeScape Canvas - React Flow Implementation Plan
📋 Executive Summary
Implementazione di un canvas interattivo per pianificazione viaggi usando React Flow, con focus su drag-and-drop intelligente, collaborazione real-time e assistenza AI contestuale.
🎯 Milestone Overview
Phase 1: Core Canvas (Week 1-2)
Goal: Canvas funzionante con drag-drop e tipi di nodi base
Phase 2: Smart Features (Week 3-4)
Goal: Connessioni intelligenti, auto-layout, realtime sync
Phase 3: AI Integration (Week 5-6)
Goal: Chat contestuale, suggerimenti AI, ottimizzazione automatica
Phase 4: Advanced UX (Week 7-8)
Goal: Multi-view, templates, mobile optimization

📦 Phase 1: Core Canvas Implementation
1.1 Setup Base Infrastructure
bashnpm install reactflow @reactflow/controls @reactflow/minimap @reactflow/background
npm install zustand @supabase/supabase-js
npm install framer-motion react-use-gesture
1.2 Node Types Definition
typescript// src/components/canvas/nodes/index.ts
export const nodeTypes = {
  destination: DestinationNode,  // Primary location (città, region)
  activity: ActivityNode,        // Museums, tours, experiences  
  restaurant: RestaurantNode,     // Food & dining
  accommodation: HotelNode,      // Where to sleep
  transport: TransportNode,       // How to move
  note: NoteNode,                // User annotations
  dayDivider: DayDividerNode     // Visual day separator
};

// Example: DestinationNode.tsx
const DestinationNode = ({ data, selected }) => (
  <div className={`
    min-w-[200px] p-4 rounded-lg border-2 
    ${selected ? 'border-purple-500' : 'border-gray-700'}
    bg-gradient-to-br from-purple-900/50 to-purple-800/30
  `}>
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2 mb-2">
      <span className="text-2xl">📍</span>
      <h3 className="font-bold text-white">{data.title}</h3>
    </div>
    <p className="text-xs text-purple-300">{data.date}</p>
    <p className="text-sm text-gray-300 mt-1">{data.description}</p>
    <Handle type="source" position={Position.Bottom} />
  </div>
);
1.3 Core Canvas Component
typescript// src/components/canvas/TripCanvas.tsx
const TripCanvas = ({ tripId }) => {
  const { nodes, edges, onNodesChange, onEdgesChange } = useTripStore();
  
  const onConnect = useCallback((params) => {
    // Validate connection logic
    if (!canConnect(params.source, params.target)) {
      toast.error("Impossibile connettere questi elementi");
      return;
    }
    
    // Add edge with metadata
    const newEdge = {
      ...params,
      id: `${params.source}-${params.target}`,
      type: 'smoothstep',
      animated: true,
      data: { 
        duration: calculateDuration(params.source, params.target)
      }
    };
    
    setEdges(eds => addEdge(newEdge, eds));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      snapToGrid
      snapGrid={[15, 15]}
    >
      <Background variant="dots" gap={30} size={1} />
      <MiniMap nodeColor={getNodeColor} />
      <Controls />
      <Panel position="top-left">
        <Toolbar />
      </Panel>
    </ReactFlow>
  );
};
1.4 State Management
typescript// src/stores/canvasStore.ts
interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNodes: (ids: string[]) => void;
  
  // Undo/Redo
  history: CanvasState[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
}

const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  
  addNode: (type, position) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: getDefaultDataForType(type)
    };
    
    set(state => ({
      nodes: [...state.nodes, newNode],
      history: [...state.history.slice(0, state.historyIndex + 1), { nodes: [...state.nodes, newNode] }]
    }));
    
    // Sync with Supabase
    supabase.from('cards').insert(nodeToCard(newNode));
  }
}));

🚀 Phase 2: Smart Features
2.1 Auto-Layout Engine
typescript// src/utils/layoutEngine.ts
export class LayoutEngine {
  static timeline(nodes: Node[]): Node[] {
    // Sort by date/time
    const sorted = nodes.sort((a, b) => 
      new Date(a.data.date) - new Date(b.data.date)
    );
    
    // Position in timeline
    return sorted.map((node, index) => ({
      ...node,
      position: {
        x: 200 + (index % 4) * 250,
        y: 100 + Math.floor(index / 4) * 200
      }
    }));
  }
  
  static geographic(nodes: Node[]): Node[] {
    // Cluster by proximity
    const clusters = clusterByLocation(nodes);
    return distributeCluster(clusters);
  }
  
  static autoOrganize(nodes: Node[], edges: Edge[]): Node[] {
    // Use d3-force for physics-based layout
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(400, 300));
    
    simulation.tick(100);
    return nodes;
  }
}
2.2 Smart Connection System
typescript// src/components/canvas/SmartEdge.tsx
const SmartEdge = ({ sourceX, sourceY, targetX, targetY, data }) => {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY });
  const [showTooltip, setShowTooltip] = useState(false);
  
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  return (
    <>
      <path
        d={edgePath}
        className="stroke-2 stroke-purple-500 hover:stroke-purple-400"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      
      {/* Edge Label */}
      <foreignObject x={midX - 30} y={midY - 10} width={60} height={20}>
        <div className="bg-gray-900 px-2 py-1 rounded text-xs text-white">
          {data.duration} min
        </div>
      </foreignObject>
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <foreignObject x={midX - 75} y={midY + 15} width={150} height={60}>
          <TransportOptions 
            from={data.source} 
            to={data.target}
            options={data.transportOptions}
          />
        </foreignObject>
      )}
    </>
  );
};
2.3 Realtime Collaboration
typescript// src/hooks/useRealtimeCanvas.ts
export const useRealtimeCanvas = (tripId: string) => {
  const { nodes, edges, updateNode } = useCanvasStore();
  const [cursors, setCursors] = useState<Map<string, Cursor>>();
  
  useEffect(() => {
    // Subscribe to changes
    const channel = supabase.channel(`canvas-${tripId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCursors(new Map(Object.entries(state)));
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        setCursors(prev => new Map(prev).set(payload.userId, payload));
      })
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cards', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            updateNode(payload.new.id, payload.new);
          }
        }
      )
      .subscribe();
    
    // Broadcast own cursor
    const handleMouseMove = throttle((e: MouseEvent) => {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { 
          userId: user.id, 
          x: e.clientX, 
          y: e.clientY,
          color: user.color 
        }
      });
    }, 50);
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      supabase.removeChannel(channel);
    };
  }, [tripId]);
  
  return { cursors };
};

🤖 Phase 3: AI Integration
3.1 Contextual Chat Component
typescript// src/components/chat/NodeChat.tsx
const NodeChat = ({ node, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    // Add user message
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    
    // Call AI with context
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [...messages, userMsg],
        context: {
          node: node,
          tripData: getTripContext(),
          userPreferences: getUserPreferences()
        }
      })
    });
    
    const aiResponse = await response.json();
    
    // Apply modifications if any
    if (aiResponse.modifications) {
      applyNodeModifications(node.id, aiResponse.modifications);
    }
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: aiResponse.message 
    }]);
  };
  
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 shadow-2xl">
      <ChatHeader node={node} onClose={onClose} />
      <MessageList messages={messages} />
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} />
      <QuickActions node={node} />
    </div>
  );
};
3.2 AI Suggestions System
typescript// src/hooks/useAISuggestions.ts
export const useAISuggestions = (nodes: Node[], edges: Edge[]) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  useEffect(() => {
    const analyze = async () => {
      const analysis = await aiService.analyzeItinerary({
        nodes,
        edges,
        rules: [
          'check_time_conflicts',
          'optimize_route',
          'suggest_missing_meals',
          'warn_rushed_schedule',
          'recommend_nearby_attractions'
        ]
      });
      
      setSuggestions(analysis.suggestions);
    };
    
    const debounced = debounce(analyze, 1000);
    debounced();
  }, [nodes, edges]);
  
  return suggestions;
};

// Visual suggestions overlay
const SuggestionsOverlay = () => {
  const suggestions = useAISuggestions();
  
  return (
    <Panel position="top-right">
      {suggestions.map(suggestion => (
        <SuggestionCard
          key={suggestion.id}
          icon={suggestion.type === 'warning' ? '⚠️' : '💡'}
          title={suggestion.title}
          action={() => applySuggestion(suggestion)}
        />
      ))}
    </Panel>
  );
};

🎨 Phase 4: Advanced UX
4.1 Multi-View System
typescript// src/components/canvas/ViewSwitcher.tsx
const ViewSwitcher = () => {
  const { viewMode, setViewMode, nodes, edges } = useCanvasStore();
  
  const views = {
    canvas: { icon: '🎨', label: 'Canvas', component: CanvasView },
    timeline: { icon: '📅', label: 'Timeline', component: TimelineView },
    map: { icon: '🗺️', label: 'Mappa', component: MapView },
    budget: { icon: '💰', label: 'Budget', component: BudgetView }
  };
  
  return (
    <>
      <Panel position="top-center">
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
          {Object.entries(views).map(([key, view]) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-3 py-2 rounded ${
                viewMode === key ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              {view.icon} {view.label}
            </button>
          ))}
        </div>
      </Panel>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {React.createElement(views[viewMode].component, { nodes, edges })}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
4.2 Template System
typescript// src/components/templates/TemplateLibrary.tsx
const templates = [
  {
    id: 'romantic-weekend',
    name: 'Weekend Romantico',
    preview: '/templates/romantic.jpg',
    structure: {
      nodes: [
        { type: 'destination', data: { title: 'Centro Storico' }},
        { type: 'restaurant', data: { title: 'Cena romantica', tags: ['intimo', 'vista'] }},
        { type: 'activity', data: { title: 'Passeggiata al tramonto' }}
      ],
      edges: [/* connections */]
    }
  }
];

const TemplateSelector = ({ onSelect }) => (
  <div className="grid grid-cols-3 gap-4 p-4">
    {templates.map(template => (
      <TemplateCard
        key={template.id}
        template={template}
        onSelect={() => {
          // Apply template with AI personalization
          applyTemplate(template).then(personalized => {
            onSelect(personalized);
          });
        }}
      />
    ))}
  </div>
);
4.3 Mobile Optimization
typescript// src/components/canvas/MobileCanvas.tsx
const MobileCanvas = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* Simplified toolbar */}
        <MobileToolbar />
        
        {/* Touch-optimized canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={mobileNodeTypes} // Simplified nodes
          zoomOnScroll={false} // Use pinch instead
          panOnScroll={true} // Single finger pan
          nodesDraggable={!isLocked}
        >
          <Controls position="bottom-right" />
        </ReactFlow>
        
        {/* Bottom sheet for editing */}
        <BottomSheet 
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
        >
          <NodeEditor node={selectedNode} />
        </BottomSheet>
      </div>
    );
  }
  
  return <DesktopCanvas />;
};

📊 Performance Optimization
typescript// src/utils/canvasOptimization.ts
export const optimizeCanvas = {
  // Virtual rendering for large node counts
  virtualizeNodes: (nodes: Node[], viewport: Viewport) => {
    const buffer = 200;
    return nodes.filter(node => 
      isInViewport(node.position, viewport, buffer)
    );
  },
  
  // Debounced saves
  debouncedSave: debounce((nodes, edges) => {
    saveToSupabase(nodes, edges);
  }, 1000),
  
  // Level of detail based on zoom
  getNodeLOD: (zoom: number) => {
    if (zoom < 0.3) return 'minimal';
    if (zoom < 0.7) return 'standard';
    return 'detailed';
  }
};

🚢 Deployment Checklist
MVP Requirements

 7 tipi di nodi base funzionanti
 Drag & drop con snap to grid
 Connessioni con validazione
 Save/load da Supabase
 Undo/redo functionality
 Basic realtime sync
 Mobile responsive

Testing Plan
typescript// cypress/e2e/canvas.cy.ts
describe('Canvas Operations', () => {
  it('should create and connect nodes', () => {
    cy.visit('/trip/new');
    cy.get('[data-testid="add-destination"]').click();
    cy.get('.react-flow__node').should('have.length', 1);
    
    // Test connection
    cy.get('[data-testid="add-activity"]').click();
    cy.get('.react-flow__handle-source').first().drag('.react-flow__handle-target');
    cy.get('.react-flow__edge').should('have.length', 1);
  });
});
Performance Metrics

Canvas load time: < 1s
Node drag response: < 16ms (60 FPS)
Save latency: < 500ms
Support 500+ nodes without lag
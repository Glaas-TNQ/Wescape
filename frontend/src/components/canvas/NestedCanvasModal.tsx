import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  SelectionMode,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes, type NodeType } from './nodes';
import { validateConnection } from '../../utils/connectionRules';
import { useCanvasStore } from '../../stores/canvasStore';
import NestedToolbar from './NestedToolbar';
import { useToast } from '../../hooks/useToast';
import ColorPickerOverlay from './ColorPickerOverlay';
import NodeEditModal from './NodeEditModal';

interface NestedCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string | null;
  nodeData?: any;
  onSaveNode?: (nodeId: string, data: any) => void; // Custom save function for nested canvases
}

const NestedCanvasModal: React.FC<NestedCanvasModalProps> = ({ 
  isOpen, 
  onClose, 
  nodeId, 
  nodeData,
  onSaveNode
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { updateNode } = useCanvasStore();
  const { toast } = useToast();
  const [editingChildNodeId, setEditingChildNodeId] = useState<string | null>(null);
  const [nestedCanvasChildId, setNestedCanvasChildId] = useState<string | null>(null);
  const [showTitleEdit, setShowTitleEdit] = useState(false);
  const [tempTitle, setTempTitle] = useState(nodeData?.title || '');
  const [tempDescription, setTempDescription] = useState(nodeData?.description || '');
  const [colorPickerState, setColorPickerState] = useState<{
    isOpen: boolean;
    nodeId: string;
    nodeType: any;
    currentColor: string | null;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    console.log('NestedCanvasModal useEffect:', { isOpen, nodeId, nodeData });
    if (isOpen && nodeData) {
      setNodes(nodeData.childNodes || []);
      setEdges(nodeData.childEdges || []);
      setTempTitle(nodeData.title || '');
      setTempDescription(nodeData.description || '');
    }
  }, [isOpen, nodeData, nodeId]);

  // Handle events from child nodes
  useEffect(() => {
    if (!isOpen) return;

    const handleEditChildNode = (event: CustomEvent) => {
      setEditingChildNodeId(event.detail.nodeId);
    };

    const handleDeleteChildNode = (event: CustomEvent) => {
      setNodes(prevNodes => prevNodes.filter(n => n.id !== event.detail.nodeId));
      setEdges(prevEdges => prevEdges.filter(e => 
        e.source !== event.detail.nodeId && e.target !== event.detail.nodeId
      ));
      toast.success('Nodo eliminato dal canvas annidato');
    };

    const handleOpenNestedCanvasChild = (event: CustomEvent) => {
      const childNode = nodes.find(n => n.id === event.detail.nodeId);
      if (childNode && childNode.type === 'nestedCanvas') {
        setNestedCanvasChildId(event.detail.nodeId);
      }
    };

    const handleOpenColorPicker = (event: CustomEvent) => {
      const { nodeId, nodeType, currentColor, position } = event.detail;
      setColorPickerState({
        isOpen: true,
        nodeId,
        nodeType,
        currentColor,
        position,
      });
    };

    window.addEventListener('editNode', handleEditChildNode as EventListener);
    window.addEventListener('deleteNode', handleDeleteChildNode as EventListener);
    window.addEventListener('openNestedCanvas', handleOpenNestedCanvasChild as EventListener);
    window.addEventListener('openColorPicker', handleOpenColorPicker as EventListener);

    return () => {
      window.removeEventListener('editNode', handleEditChildNode as EventListener);
      window.removeEventListener('deleteNode', handleDeleteChildNode as EventListener);
      window.removeEventListener('openNestedCanvas', handleOpenNestedCanvasChild as EventListener);
      window.removeEventListener('openColorPicker', handleOpenColorPicker as EventListener);
    };
  }, [isOpen, toast]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    const validation = validateConnection(connection, nodes);
    
    if (!validation.isValid) {
      toast.error(validation.reason || 'Connessione non valida');
      return;
    }
    
    setEdges((eds) => addEdge({
      ...connection,
      id: `${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 },
    }, eds));
  }, [nodes, toast]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (typeof type === 'undefined' || !type) {
      return;
    }

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode: Node = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as NodeType,
      position,
      data: getDefaultNodeData(type as NodeType),
      width: 220,
      height: 140,
    };

    setNodes((nds) => nds.concat(newNode));
  }, []);

  const handleSave = () => {
    if (nodeId) {
      const dataToSave = {
        title: tempTitle,
        description: tempDescription,
        childNodes: nodes,
        childEdges: edges,
      };

      if (onSaveNode) {
        // Use custom save function for nested canvases
        onSaveNode(nodeId, dataToSave);
      } else {
        // Use global store for top-level canvas
        updateNode(nodeId, dataToSave);
      }
      toast.success('Canvas annidato salvato');
    }
    onClose();
  };

  const handleTitleSave = () => {
    setShowTitleEdit(false);
    if (nodeId) {
      const dataToSave = {
        title: tempTitle,
        description: tempDescription,
        childNodes: nodes,
        childEdges: edges,
      };

      if (onSaveNode) {
        // Use custom save function for nested canvases
        onSaveNode(nodeId, dataToSave);
      } else {
        // Use global store for top-level canvas
        updateNode(nodeId, dataToSave);
      }
      toast.success('Titolo e descrizione aggiornati');
    }
  };

  const handleClose = () => {
    handleSave();
  };

  // Local node management functions for nested canvas
  const addNodeToNestedCanvas = (type: NodeType) => {
    const position = {
      x: 200 + Math.random() * 400,
      y: 200 + Math.random() * 300,
    };

    const newNode: Node = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as NodeType,
      position,
      data: getDefaultNodeData(type),
      width: getDefaultDimensions(type).width,
      height: getDefaultDimensions(type).height,
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const autoLayoutNestedCanvas = () => {
    setNodes(prevNodes => prevNodes.map((node, index) => ({
      ...node,
      position: {
        x: 100 + (index % 4) * 300,
        y: 100 + Math.floor(index / 4) * 200,
      },
    })));
  };

  const clearNestedCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

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

  const getNodeColor = (node: any) => {
    switch (node.type) {
      case 'destination': return '#8b5cf6';
      case 'activity': return '#06b6d4';
      case 'restaurant': return '#f59e0b';
      case 'hotel': return '#10b981';
      case 'transport': return '#ef4444';
      case 'note': return '#eab308';
      case 'dayDivider': return '#6366f1';
      case 'nestedCanvas': return '#a855f7';
      default: return '#6b7280';
    }
  };

  console.log('NestedCanvasModal render:', { isOpen, nodeId, hasNodeData: !!nodeData });
  
  if (!isOpen || !nodeId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-purple-900/20">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">🔗</span>
            {showTitleEdit ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-lg font-bold"
                  placeholder="Titolo canvas..."
                  autoFocus
                />
                <input
                  type="text"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-sm"
                  placeholder="Descrizione..."
                />
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {tempTitle || 'Senza titolo'}
                  </h2>
                  <button
                    onClick={() => setShowTitleEdit(true)}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    ✏️
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {tempDescription || 'Nessuna descrizione'}
                </p>
                <p className="text-xs text-purple-300 mt-1">
                  {nodes.length} elementi • {edges.length} connessioni
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showTitleEdit ? (
              <>
                <button
                  onClick={handleTitleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors"
                >
                  Salva Info
                </button>
                <button
                  onClick={() => setShowTitleEdit(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-colors"
                >
                  Annulla
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                >
                  Salva
                </button>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors text-lg"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            attributionPosition="bottom-right"
            className="w-full h-full"
            selectionOnDrag
            panOnDrag={[1, 2]}
            selectionMode={SelectionMode.Partial}
            multiSelectionKeyCode={['Meta', 'Shift']}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode={null}
            nodesConnectable={true}
            nodesDraggable={true}
            elementsSelectable={true}
            style={{
              background: '#0a0a0a',
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)
              `,
            }}
          >
            <Background 
              gap={20} 
              size={1} 
              color="rgba(168, 85, 247, 0.2)"
            />
            
            <MiniMap 
              nodeColor={getNodeColor}
              className="!bg-gray-900/90 !border-purple-500/30"
              maskColor="rgba(0, 0, 0, 0.8)"
              position="bottom-right"
            />
            
            <Controls 
              className="!bg-gray-900/90 !border-purple-500/30"
              position="bottom-left"
            />
            
            <Panel position="top-left" className="m-4">
              <NestedToolbar 
                onAddNode={addNodeToNestedCanvas}
                onAutoLayout={autoLayoutNestedCanvas}
                onClearCanvas={clearNestedCanvas}
              />
            </Panel>
          </ReactFlow>

          {/* Empty State for Nested Canvas */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-8 rounded-2xl bg-purple-900/20 backdrop-blur-md border border-purple-500/20">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">Canvas Annidato Vuoto</h3>
                <p className="text-gray-400 mb-4">
                  Trascina i componenti dalla toolbar per iniziare a costruire<br />
                  la struttura di dettaglio del tuo progetto
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <span>💡</span>
                  <span>Questo canvas è indipendente e può contenere qualsiasi tipo di nodo</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Child Node Edit Modal */}
        {editingChildNodeId && (
          <ChildNodeEditModal
            nodeId={editingChildNodeId}
            nodes={nodes}
            onClose={() => setEditingChildNodeId(null)}
            onSave={(nodeId, newData) => {
              setNodes(prevNodes => prevNodes.map(node => 
                node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
              ));
              setEditingChildNodeId(null);
              toast.success('Nodo aggiornato');
            }}
          />
        )}

        {/* Color Picker Overlay */}
        {colorPickerState && (
          <ColorPickerOverlay
            isOpen={colorPickerState.isOpen}
            nodeId={colorPickerState.nodeId}
            nodeType={colorPickerState.nodeType}
            currentColor={colorPickerState.currentColor}
            position={colorPickerState.position}
            onClose={() => setColorPickerState(null)}
            onSave={(color) => {
              // Update the local nodes array for the nested canvas
              setNodes(prevNodes => prevNodes.map(node => 
                node.id === colorPickerState.nodeId 
                  ? { ...node, data: { ...node.data, customColor: color } }
                  : node
              ));
            }}
            onPreview={(color) => {
              // Real-time preview: temporarily update node color without saving
              setNodes(prevNodes => prevNodes.map(node => 
                node.id === colorPickerState.nodeId 
                  ? { ...node, data: { ...node.data, customColor: color } }
                  : node
              ));
            }}
          />
        )}

        {/* Nested Canvas Child Modal */}
        {nestedCanvasChildId && (
          <NestedCanvasModal
            nodeId={nestedCanvasChildId}
            nodeData={nodes.find(n => n.id === nestedCanvasChildId)?.data}
            isOpen={!!nestedCanvasChildId}
            onClose={() => {
              setNestedCanvasChildId(null);
            }}
            onSaveNode={(childNodeId, newData) => {
              // Custom save function that updates the local nodes array
              setNodes(prevNodes => prevNodes.map(node => 
                node.id === childNodeId 
                  ? { ...node, data: { ...node.data, ...newData } }
                  : node
              ));
              console.log('Saved nested canvas child data:', childNodeId, newData);
            }}
          />
        )}
      </div>
    </div>
  );
};

const getDefaultNodeData = (type: NodeType) => {
  const defaults = {
    destination: {
      title: 'Nuova Destinazione',
      description: 'Clicca per aggiungere dettagli',
      date: '',
      customColor: null,
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
  
  return (defaults as any)[type] || {};
};

// Simple modal for editing child nodes
interface ChildNodeEditModalProps {
  nodeId: string;
  nodes: Node[];
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
}

const ChildNodeEditModal: React.FC<ChildNodeEditModalProps> = ({ nodeId, nodes, onClose, onSave }) => {
  const node = nodes.find(n => n.id === nodeId);
  const [formData, setFormData] = useState(node?.data || {});

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onSave(nodeId, formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Modifica Nodo: {formData.title || 'Senza titolo'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Titolo</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                placeholder="Inserisci titolo..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrizione</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 min-h-[100px]"
                placeholder="Inserisci descrizione..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};

const NestedCanvasModalWithProvider: React.FC<NestedCanvasModalProps> = (props) => {
  return (
    <ReactFlowProvider>
      <NestedCanvasModal {...props} />
    </ReactFlowProvider>
  );
};

export default NestedCanvasModalWithProvider;
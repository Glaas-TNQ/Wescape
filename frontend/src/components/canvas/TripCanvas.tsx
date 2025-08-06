import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from './nodes';
import { useCanvasStore } from '../../stores/canvasStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { validateConnection } from '../../utils/connectionRules';
import Toolbar from './Toolbar';
import ViewSwitcher from './ViewSwitcher';
import NodeEditModal from './NodeEditModal';
import EmptyState from './EmptyState';
import ToastContainer from '../ui/ToastContainer';
import { useToast } from '../../hooks/useToast';

const TripCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const { toasts, removeToast, toast } = useToast();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: storeOnConnect,
    deleteNodes,
  } = useCanvasStore();

  // Custom onConnect with validation
  const onConnect = useCallback((connection: any) => {
    const validation = validateConnection(connection, nodes);
    
    if (!validation.isValid) {
      toast.error(validation.reason || 'Connessione non valida');
      return;
    }
    
    storeOnConnect(connection);
    toast.success('Connessione creata');
  }, [nodes, storeOnConnect, toast]);

  // Handle node selection changes
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: any) => {
    // Update selected nodes in store if needed
    console.log('Selected nodes:', selectedNodes);
  }, []);

  // Handle delete key for selected nodes
  const onNodesDelete = useCallback((deletedNodes: any[]) => {
    const nodeIds = deletedNodes.map(node => node.id);
    deleteNodes(nodeIds);
    toast.success(`${nodeIds.length} nodi eliminati`);
  }, [deleteNodes, toast]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Handle node edit/delete events from nodes
  useEffect(() => {
    const handleEditNode = (event: CustomEvent) => {
      setEditingNodeId(event.detail.nodeId);
    };

    const handleDeleteNode = (event: CustomEvent) => {
      deleteNodes([event.detail.nodeId]);
      toast.success('Nodo eliminato con successo');
    };

    const handleShowToast = (event: CustomEvent) => {
      const { message, type } = event.detail;
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else if (type === 'warning') toast.warning(message);
      else toast.info(message);
    };

    window.addEventListener('editNode', handleEditNode as EventListener);
    window.addEventListener('deleteNode', handleDeleteNode as EventListener);
    window.addEventListener('showToast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('editNode', handleEditNode as EventListener);
      window.removeEventListener('deleteNode', handleDeleteNode as EventListener);
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, [deleteNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      useCanvasStore.getState().addNode(type as any, position);
    },
    []
  );

  // Custom node color for minimap
  const getNodeColor = (node: any) => {
    switch (node.type) {
      case 'destination': return '#8b5cf6';
      case 'activity': return '#06b6d4';
      case 'restaurant': return '#f59e0b';
      case 'hotel': return '#10b981';
      case 'transport': return '#ef4444';
      case 'note': return '#eab308';
      case 'dayDivider': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const canvasStyle = {
    background: '#050505',
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
    `,
  };

  return (
    <div className="w-screen h-screen flex flex-col" style={canvasStyle}>
      {/* Top Bar - Fixed Header */}
      <div className="h-20 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            WeScape Canvas
          </div>
          <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
            {nodes.length} elementi
          </div>
        </div>
        
        <ViewSwitcher />
        
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all hover:scale-105 font-medium">
            Share
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-105 shadow-lg shadow-indigo-600/25">
            Save Trip
          </button>
        </div>
      </div>

      {/* Canvas - Takes remaining space */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={onSelectionChange}
          onNodesDelete={onNodesDelete}
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
        >
          {/* Background with dots pattern */}
          <Background 
            gap={30} 
            size={1} 
            color="rgba(255, 255, 255, 0.1)"
          />
          
          {/* Mini Map */}
          <MiniMap 
            nodeColor={getNodeColor}
            className="!bg-gray-900/90 !border-white/20"
            maskColor="rgba(0, 0, 0, 0.8)"
            position="bottom-right"
          />
          
          {/* Controls */}
          <Controls 
            className="!bg-gray-900/90 !border-white/20"
            position="bottom-left"
          />
          
          {/* Toolbar Panel */}
          <Panel position="top-left" className="m-4">
            <Toolbar />
          </Panel>
        </ReactFlow>
        
        {/* Empty State */}
        {nodes.length === 0 && <EmptyState />}
      </div>

      {/* Node Edit Modal */}
      <NodeEditModal
        nodeId={editingNodeId}
        isOpen={!!editingNodeId}
        onClose={() => {
          setEditingNodeId(null);
          toast.success('Nodo aggiornato');
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

// Main component with ReactFlowProvider
const TripCanvasWithProvider = () => {
  return (
    <ReactFlowProvider>
      <TripCanvas />
    </ReactFlowProvider>
  );
};

export default TripCanvasWithProvider;
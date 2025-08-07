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
import { getNodeMinimapColor } from '../../utils/nodeColors';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors, getCanvasBackground, getReactFlowBackground, getMiniMapColors, getControlsColors } from '../../utils/themeColors';
import Toolbar from './Toolbar';
import ViewSwitcher from './ViewSwitcher';
import NodeEditModal from './NodeEditModal';
import NestedCanvasModal from './NestedCanvasModal';
import ColorPickerOverlay from './ColorPickerOverlay';
import EmptyState from './EmptyState';
import ToastContainer from '../ui/ToastContainer';
import ThemeToggle from '../ui/ThemeToggle';
import EditableText from '../ui/EditableText';
import TripSelector from '../trips/TripSelector';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../hooks/useToast';
import { useUserTrips } from '../../hooks/useTripData';
import { useAutoSave } from '../../hooks/useAutoSave';

interface TripCanvasProps {
  currentTripId?: string;
  onTripChange: (tripId: string) => void;
  tripData?: any;
  isTripLoading: boolean;
}

const TripCanvas: React.FC<TripCanvasProps> = ({ 
  currentTripId, 
  onTripChange, 
  tripData: _tripData, 
  isTripLoading 
}) => {
  const { signOut } = useAuth();
  const { trips, updateTrip } = useUserTrips();
  
  // Get current trip data
  const currentTrip = trips?.find(trip => trip.id === currentTripId);
  
  // Enable auto-save for the current trip
  const { saveNow } = useAutoSave(currentTripId);
  
  // Handle trip title update
  const handleTripTitleUpdate = async (newTitle: string) => {
    if (!currentTripId || !currentTrip) return;
    
    try {
      await updateTrip({
        tripId: currentTripId,
        tripData: { title: newTitle }
      });
      toast.success('Trip title updated!');
    } catch (error) {
      toast.error('Failed to update trip title');
    }
  };
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nestedCanvasNodeId, setNestedCanvasNodeId] = useState<string | null>(null);
  const [colorPickerState, setColorPickerState] = useState<{
    isOpen: boolean;
    nodeId: string;
    nodeType: any;
    currentColor: string | null;
    position: { x: number; y: number };
  } | null>(null);
  const { toasts, removeToast, toast } = useToast();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark);
  const canvasBackground = getCanvasBackground(isDark);
  const reactFlowBg = getReactFlowBackground(isDark);
  const miniMapColors = getMiniMapColors(isDark);
  const controlsColors = getControlsColors(isDark);
  
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

    const handleOpenNestedCanvas = (event: CustomEvent) => {
      console.log('Received openNestedCanvas event:', event.detail);
      setNestedCanvasNodeId(event.detail.nodeId);
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

    const handleShowToast = (event: CustomEvent) => {
      const { message, type } = event.detail;
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else if (type === 'warning') toast.warning(message);
      else toast.info(message);
    };

    window.addEventListener('editNode', handleEditNode as EventListener);
    window.addEventListener('deleteNode', handleDeleteNode as EventListener);
    window.addEventListener('openNestedCanvas', handleOpenNestedCanvas as EventListener);
    window.addEventListener('openColorPicker', handleOpenColorPicker as EventListener);
    window.addEventListener('showToast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('editNode', handleEditNode as EventListener);
      window.removeEventListener('deleteNode', handleDeleteNode as EventListener);
      window.removeEventListener('openNestedCanvas', handleOpenNestedCanvas as EventListener);
      window.removeEventListener('openColorPicker', handleOpenColorPicker as EventListener);
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

  // Custom node color for minimap with support for custom colors
  const getNodeColor = (node: any) => {
    return getNodeMinimapColor(node.type, node.data?.customColor);
  };

  const canvasStyle = canvasBackground;

  return (
    <div className="w-screen h-screen flex flex-col" style={canvasStyle}>
      {/* Top Bar - Fixed Header */}
      <div 
        className="h-20 backdrop-blur-xl flex items-center justify-between px-8 z-50 flex-shrink-0 border-b"
        style={{
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: themeColors.border.primary,
          color: themeColors.text.primary
        }}
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            WeScape
          </div>
          
          {currentTrip && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <EditableText
                value={currentTrip.title}
                onSave={handleTripTitleUpdate}
                className="text-xl font-semibold"
                placeholder="Trip Name"
              />
            </div>
          )}
          
          <TripSelector
            currentTripId={currentTripId}
            onTripSelect={onTripChange}
            onNewTrip={() => {/* handled in TripSelector */}}
          />
          
          <div 
            className="text-sm px-3 py-1 rounded-full"
            style={{
              color: themeColors.text.secondary,
              backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)'
            }}
          >
            {nodes.length} elementi
          </div>
        </div>
        
        <ViewSwitcher />
        
        <div className="flex gap-4">
          <ThemeToggle />
          {currentTripId && (
            <>
              <button 
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105 border"
                style={{
                  backgroundColor: themeColors.interactive.hover,
                  borderColor: themeColors.border.secondary,
                  color: themeColors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.interactive.active;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.interactive.hover;
                }}
                onClick={() => toast.info('Sharing functionality coming soon!')}
              >
                Share
              </button>
              <button 
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-500 hover:to-emerald-500 transition-all hover:scale-105 shadow-lg shadow-green-600/25"
                onClick={() => {
                  saveNow();
                  toast.success('Changes saved manually!');
                }}
                title="Auto-save is enabled. Click to save immediately."
              >
                💾 Auto-save
              </button>
            </>
          )}
          <button
            onClick={signOut}
            className="px-3 py-2.5 rounded-lg font-medium transition-all hover:scale-105 border"
            style={{
              backgroundColor: 'transparent',
              borderColor: themeColors.border.secondary,
              color: themeColors.text.secondary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.interactive.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🚪
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
          nodeExtent={undefined}
        >
          {/* Background with dots pattern */}
          <Background 
            gap={reactFlowBg.gap} 
            size={reactFlowBg.size} 
            color={reactFlowBg.color}
          />
          
          {/* Mini Map */}
          <MiniMap 
            nodeColor={getNodeColor}
            className={miniMapColors.className}
            maskColor={miniMapColors.maskColor}
            position="bottom-right"
          />
          
          {/* Controls */}
          <Controls 
            className={controlsColors.className}
            position="bottom-left"
          />
          
          {/* Toolbar Panel */}
          <Panel position="top-left" className="m-4">
            <Toolbar />
          </Panel>
        </ReactFlow>
        
        {/* Loading State */}
        {isTripLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-30">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700 dark:text-gray-300">Loading trip data...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isTripLoading && nodes.length === 0 && currentTripId && <EmptyState />}
        
        {/* No Trip Selected State */}
        {!currentTripId && !isTripLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md mx-4">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select a Trip
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose an existing trip or create a new one to start planning your adventure
              </p>
              <TripSelector
                currentTripId={currentTripId}
                onTripSelect={onTripChange}
                onNewTrip={() => {/* handled in TripSelector */}}
              />
            </div>
          </div>
        )}
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

      {/* Nested Canvas Modal */}
      <NestedCanvasModal
        nodeId={nestedCanvasNodeId}
        nodeData={nestedCanvasNodeId ? nodes.find(n => n.id === nestedCanvasNodeId)?.data : null}
        isOpen={!!nestedCanvasNodeId}
        onClose={() => {
          setNestedCanvasNodeId(null);
        }}
      />

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
            useCanvasStore.getState().updateNode(colorPickerState.nodeId, {
              customColor: color,
            });
            toast.success('Colore aggiornato');
          }}
          onPreview={(color) => {
            // Real-time preview: temporarily update node color without saving
            useCanvasStore.getState().updateNode(colorPickerState.nodeId, {
              customColor: color,
            });
          }}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

// Main component with ReactFlowProvider
const TripCanvasWithProvider: React.FC<TripCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <TripCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default TripCanvasWithProvider;
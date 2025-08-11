import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Panel, ReactFlowProvider, SelectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { handlePasteImage, uploadImage, getOptimalImageDimensions } from '../../utils/imageUpload';

const TripCanvas = () => {
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toasts, removeToast, toast } = useToast();
  const { user } = useAuth();
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

  // Handle paste for image screenshots
  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (!user) {
      toast.error('Devi essere loggato per caricare immagini');
      return;
    }

    if (isUploadingImage) {
      toast.warning('Upload già in corso...');
      return;
    }

    // Check if target is an input or textarea to avoid interfering with text paste
    const target = event.target as HTMLElement;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.contentEditable === 'true') {
      return;
    }

    const imageFile = await handlePasteImage(event);
    if (!imageFile) {
      return; // No image in clipboard
    }

    // Prevent default paste behavior
    event.preventDefault();

    setIsUploadingImage(true);
    toast.info('Caricamento screenshot in corso...');

    try {
      // Upload image to Supabase Storage
      const uploadResult = await uploadImage(imageFile, user.id, 'screenshot');
      
      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.error || 'Errore nel caricamento dell\'immagine');
        return;
      }

      // Get image dimensions for creating optimal node size
      const img = new Image();
      img.onload = () => {
        const { width, height } = getOptimalImageDimensions(img.width, img.height);
        
        // Get center position or use last mouse position
        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
        const position = reactFlowBounds ? {
          x: reactFlowBounds.width / 2 - width / 2,
          y: reactFlowBounds.height / 2 - height / 2,
        } : { x: 200, y: 200 };

        // Add image node to canvas
        useCanvasStore.getState().addNode('image', position, {
          imageUrl: uploadResult.url,
          caption: `Screenshot ${new Date().toLocaleTimeString('it-IT')}`,
          width,
          height,
        });

        toast.success('Screenshot aggiunto al canvas!');
      };
      
      img.onerror = () => {
        toast.error('Errore nel caricamento dell\'immagine');
      };
      
      img.src = uploadResult.url;
    } catch (error) {
      console.error('Error handling paste image:', error);
      toast.error('Errore nel caricamento dello screenshot');
    } finally {
      setIsUploadingImage(false);
    }
  }, [user, isUploadingImage, toast]);

  // Add paste event listener
  useEffect(() => {
    const handlePasteEvent = (event: ClipboardEvent) => {
      handlePaste(event);
    };

    document.addEventListener('paste', handlePasteEvent);
    return () => {
      document.removeEventListener('paste', handlePasteEvent);
    };
  }, [handlePaste]);

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
            WeScape Canvas
          </div>
          <div 
            className="text-sm px-3 py-1 rounded-full"
            style={{
              color: themeColors.text.secondary,
              backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)'
            }}
          >
            {nodes.length} elementi
          </div>
          
          {/* Paste hint */}
          {!isUploadingImage && (
            <div 
              className="text-xs px-2 py-1 rounded-full border"
              style={{
                color: themeColors.text.secondary,
                borderColor: themeColors.border.secondary,
                backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.5)'
              }}
              title="Incolla screenshot con Ctrl+V"
            >
              📋 Ctrl+V per screenshot
            </div>
          )}
          
          {/* Upload status */}
          {isUploadingImage && (
            <div 
              className="text-xs px-2 py-1 rounded-full border flex items-center gap-1"
              style={{
                color: themeColors.text.secondary,
                borderColor: themeColors.border.secondary,
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Upload...
            </div>
          )}
        </div>
        
        <ViewSwitcher />
        
        <div className="flex gap-4">
          <ThemeToggle />
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
          >
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
const TripCanvasWithProvider = () => {
  return (
    <ReactFlowProvider>
      <TripCanvas />
    </ReactFlowProvider>
  );
};

export default TripCanvasWithProvider;
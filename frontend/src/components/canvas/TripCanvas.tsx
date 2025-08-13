import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Panel, ReactFlowProvider, SelectionMode } from '@/lib/reactflow-compat';

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
import PinterestImportModal from './modals/PinterestImportModal';
import PinterestBoardModal from './modals/PinterestBoardModal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { handlePasteImage, uploadImage, getOptimalImageDimensions } from '../../utils/imageUpload';
import { ChatSidebar } from '../chat';
import { useChatStore } from '../../stores/chatStore';

interface TripCanvasProps {
  tripTitle?: string;
  onBackToDashboard?: () => void;
  user?: any;
  onSignOut?: () => void;
}

const TripCanvas = ({ tripTitle, onBackToDashboard, user: propUser, onSignOut }: TripCanvasProps) => {
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
  const [isPinterestModalOpen, setIsPinterestModalOpen] = useState(false);
  const [pinterestModalPosition, setPinterestModalPosition] = useState({ x: 100, y: 100 });
  const [pinterestBoardModal, setPinterestBoardModal] = useState<{
    isOpen: boolean;
    nodeId: string | null;
    boardData: any;
  }>({ isOpen: false, nodeId: null, boardData: null });
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, removeToast, toast } = useToast();
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  
  // Chat integration
  const { setCanvasContext, isOpen: isChatOpen } = useChatStore();
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
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
    currentTripId,
    setCurrentTrip,
    saveTripCanvas,
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

  // Update chat context when canvas changes
  useEffect(() => {
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport();
      setCanvasContext({
        tripId: currentTripId,
        viewport: {
          x: viewport.x,
          y: viewport.y,
          zoom: viewport.zoom
        },
        existingNodes: nodes,
        selectedNodes: nodes.filter(node => node.selected).map(node => node.id),
        lastModified: new Date().toISOString()
      });
    }
  }, [nodes, edges, currentTripId, reactFlowInstance, setCanvasContext]);

  // Track viewport changes for chat context
  const onViewportChange = useCallback((viewport: any) => {
    setCanvasContext({
      viewport: {
        x: viewport.x,
        y: viewport.y,
        zoom: viewport.zoom
      }
    });
  }, [setCanvasContext]);

  // Handle manual save
  const handleSaveTrip = useCallback(async () => {
    if (!currentTripId) {
      toast.error('Nessun trip selezionato per il salvataggio');
      return;
    }

    setIsSaving(true);
    try {
      await saveTripCanvas(currentTripId);
      toast.success('Canvas salvato con successo!');
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast.error('Errore nel salvataggio del canvas');
    } finally {
      setIsSaving(false);
    }
  }, [currentTripId, saveTripCanvas, toast]);

  // Auto-save when canvas changes (debounced)
  useEffect(() => {
    if (!currentTripId || nodes.length === 0) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        console.log('🔄 Auto-saving canvas...');
        await saveTripCanvas(currentTripId);
        console.log('✅ Auto-save completed');
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [nodes, edges, currentTripId, saveTripCanvas]);

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

    const handleOpenPinterestModalEvent = () => {
      setIsPinterestModalOpen(true);
    };

    const handleOpenPinterestBoard = (event: CustomEvent) => {
      const { nodeId, boardData } = event.detail;
      setPinterestBoardModal({
        isOpen: true,
        nodeId,
        boardData
      });
    };

    window.addEventListener('editNode', handleEditNode as EventListener);
    window.addEventListener('deleteNode', handleDeleteNode as EventListener);
    window.addEventListener('openNestedCanvas', handleOpenNestedCanvas as EventListener);
    window.addEventListener('openColorPicker', handleOpenColorPicker as EventListener);
    window.addEventListener('showToast', handleShowToast as EventListener);
    window.addEventListener('openPinterestModal', handleOpenPinterestModalEvent as EventListener);
    window.addEventListener('openPinterestBoard', handleOpenPinterestBoard as EventListener);

    return () => {
      window.removeEventListener('editNode', handleEditNode as EventListener);
      window.removeEventListener('deleteNode', handleDeleteNode as EventListener);
      window.removeEventListener('openNestedCanvas', handleOpenNestedCanvas as EventListener);
      window.removeEventListener('openColorPicker', handleOpenColorPicker as EventListener);
      window.removeEventListener('showToast', handleShowToast as EventListener);
      window.removeEventListener('openPinterestModal', handleOpenPinterestModalEvent as EventListener);
      window.removeEventListener('openPinterestBoard', handleOpenPinterestBoard as EventListener);
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

  // Handle Pinterest modal opening
  const handleOpenPinterestModal = useCallback((event?: React.MouseEvent) => {
    if (event && reactFlowWrapper.current) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      setPinterestModalPosition(position);
    }
    setIsPinterestModalOpen(true);
  }, []);

  // Custom node color for minimap with support for custom colors
  const getNodeColor = (node: any) => {
    return getNodeMinimapColor(node.type, node.data?.customColor);
  };

  const canvasStyle = canvasBackground;

  return (
    <div 
      className="w-screen h-screen flex flex-col relative" 
      style={canvasStyle}
    >
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
          <button
            onClick={() => {
              console.log('🔄 Back button clicked', { onBackToDashboard: !!onBackToDashboard });
              if (onBackToDashboard) {
                onBackToDashboard();
              } else {
                console.error('⚠️ onBackToDashboard prop is missing!');
              }
            }}
            className="p-2 rounded-lg transition-all hover:scale-110 hover:bg-white/10"
            style={{ color: themeColors.text.secondary }}
            title="Torna alla dashboard"
          >
            ←
          </button>
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {tripTitle} - Canvas
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
        
        <div className="flex items-center gap-4">
          {user && onSignOut && (
            <span 
              className="text-sm px-3 py-1 rounded-full"
              style={{
                color: themeColors.text.secondary,
                backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)'
              }}
            >
              {user.email}
            </span>
          )}
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
          <button 
            onClick={handleSaveTrip}
            disabled={isSaving || !currentTripId}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-105 shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvataggio...
              </>
            ) : (
              'Save Trip'
            )}
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 border"
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
              Logout
            </button>
          )}
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
          onInit={setReactFlowInstance}
          onMove={onViewportChange}
          onMoveEnd={onViewportChange}
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

      {/* Pinterest Import Modal */}
      <PinterestImportModal
        isOpen={isPinterestModalOpen}
        onClose={() => setIsPinterestModalOpen(false)}
        position={pinterestModalPosition}
      />

      {/* Pinterest Board Modal */}
      <PinterestBoardModal
        isOpen={pinterestBoardModal.isOpen}
        onClose={() => setPinterestBoardModal({ isOpen: false, nodeId: null, boardData: null })}
        boardData={pinterestBoardModal.boardData}
        nodeId={pinterestBoardModal.nodeId}
      />

      {/* Chat Sidebar */}
      <ChatSidebar />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

// Main component with ReactFlowProvider
const TripCanvasWithProvider = (props: TripCanvasProps) => {
  return (
    <ReactFlowProvider>
      <TripCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default TripCanvasWithProvider;
import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from './nodes';
import { useCanvasStore } from '../../stores/canvasStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import Toolbar from './Toolbar';
import ViewSwitcher from './ViewSwitcher';

const TripCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useCanvasStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

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
    <div className="w-screen h-screen relative overflow-hidden" style={canvasStyle}>
      {/* Canvas - Full Screen */}
      <div className="w-full h-full absolute inset-0" ref={reactFlowWrapper}>
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
          className="bg-transparent w-full h-full"
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
          <Panel position="top-left" className="mt-20">
            <Toolbar />
          </Panel>
        </ReactFlow>
      </div>

      {/* Top Bar - Overlay */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          WeScape Canvas
        </div>
        
        <ViewSwitcher />
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
            Share
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-colors">
            Save Trip
          </button>
        </div>
      </div>
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
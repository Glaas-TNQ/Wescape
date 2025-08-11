import ReactFlowLib from 'reactflow';
import 'reactflow/dist/style.css';

// Re-export the default ReactFlow component
export const ReactFlow = ReactFlowLib;
export default ReactFlowLib;

// Re-export all runtime exports (components, functions, etc.)
export * from 'reactflow';

// Re-export all TypeScript types
export type {
  NodeProps,
  WrapNodeProps,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  OnConnect,
  OnConnectStart,
  OnConnectStop,
  OnConnectEnd,
  OnNodesChange,
  OnEdgesChange,
  Viewport,
  ReactFlowInstance,
  ReactFlowState
} from 'reactflow';
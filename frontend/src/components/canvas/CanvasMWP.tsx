import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type EdgeChange,
  type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Start' },
    type: 'default',
  },
];

const initialEdges: Edge[] = [];

export default function CanvasMWP() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onAddNode = useCallback(() => {
    setNodes((prev) => {
      const nextId = (prev.length + 1).toString();
      const x = 80 + prev.length * 40;
      const y = 80 + prev.length * 20;
      return [
        ...prev,
        {
          id: nextId,
          position: { x, y },
          data: { label: `Node ${nextId}` },
          type: 'default',
        },
      ];
    });
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) =>
      changes.reduce((acc, change) => {
        switch (change.type) {
          case 'position':
            return acc.map((n) =>
              n.id === change.id
                ? { ...n, position: change.position ?? n.position }
                : n
            );
          case 'remove':
            return acc.filter((n) => n.id !== change.id);
          case 'select':
            return acc.map((n) =>
              n.id === change.id ? { ...n, selected: change.selected } : n
            );
          case 'add':
            // In React Flow v11, the property is 'item' not 'items'
            return change.item ? [...acc, change.item as Node] : acc;
          default:
            return acc;
        }
      }, nds)
    );
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) =>
      changes.reduce((acc, change) => {
        switch (change.type) {
          case 'remove':
            return acc.filter((e) => e.id !== change.id);
          case 'select':
            return acc.map((e) =>
              e.id === change.id ? { ...e, selected: change.selected } : e
            );
          case 'add':
            // In React Flow v11, the property is 'item' not 'items'
            return change.item ? [...acc, change.item as Edge] : acc;
          default:
            return acc;
        }
      }, eds)
    );
  }, []);

  const fitViewOptions = useMemo(() => ({ padding: 0.2 }), []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <h1 className="text-lg font-semibold">WeScape Canvas MWP</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddNode}
            className="rounded bg-blue-600 px-3 py-1.5 text-white shadow hover:bg-blue-500 active:bg-blue-700"
          >
            Add node
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
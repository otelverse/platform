import { useCallback, useMemo, useEffect, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { Pipeline, PipelineNode, PipelineEdge } from '@otelverse/api-hooks'

interface PipelineCanvasProps {
  pipeline: Pipeline
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  onChange: (nodes: PipelineNode[], edges: PipelineEdge[]) => void
}

const nodeTypeColors: Record<string, string> = {
  RECEIVER_OTLP: '#22c55e',
  PROCESSOR_BATCH: '#3b82f6',
  PROCESSOR_MEMORY_LIMITER: '#3b82f6',
  PROCESSOR_TAIL_SAMPLING: '#3b82f6',
  EXPORTER_LOGGING: '#f59e0b',
  EXPORTER_OTLP: '#f59e0b',
}

const nodeTypeLabels: Record<string, string> = {
  RECEIVER_OTLP: 'OTLP Receiver',
  PROCESSOR_BATCH: 'Batch',
  PROCESSOR_MEMORY_LIMITER: 'Memory Limiter',
  PROCESSOR_TAIL_SAMPLING: 'Tail Sampling',
  EXPORTER_LOGGING: 'Logging',
  EXPORTER_OTLP: 'OTLP Exporter',
}

function PipelineNodeComponent({ data }: { data: { label: string; type: string; isSelected: boolean } }) {
  const color = nodeTypeColors[data.type] || '#6b7280'
  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 text-white text-sm font-medium shadow-md ${
        data.isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''
      }`}
      style={{ backgroundColor: color, borderColor: data.isSelected ? '#60a5fa' : 'transparent', minWidth: 120 }}
    >
      <div className="text-xs opacity-80 mb-1">
        {data.type.startsWith('RECEIVER') ? 'Receiver' : data.type.startsWith('PROCESSOR') ? 'Processor' : 'Exporter'}
      </div>
      <div>{data.label}</div>
    </div>
  )
}

function pipelineNodesToReactFlow(p: Pipeline, selectedId: string | null): Node[] {
  return p.nodes.map((n) => ({
    id: n.id,
    type: 'pipelineNode',
    position: { x: n.position.x, y: n.position.y },
    data: {
      label: n.label || nodeTypeLabels[n.type] || n.type,
      type: n.type,
      isSelected: n.id === selectedId,
    },
  }))
}

function pipelineEdgesToReactFlow(p: Pipeline): Edge[] {
  return p.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle || undefined,
    targetHandle: e.targetHandle || undefined,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  }))
}

export default function PipelineCanvas({ pipeline, selectedNodeId, onSelectNode, onChange }: PipelineCanvasProps) {
  const initialNodes = useMemo(() => pipelineNodesToReactFlow(pipeline, selectedNodeId), [pipeline, selectedNodeId])
  const initialEdges = useMemo(() => pipelineEdgesToReactFlow(pipeline), [pipeline])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    setNodes(pipelineNodesToReactFlow(pipeline, selectedNodeId))
    setEdges(pipelineEdgesToReactFlow(pipeline))
  }, [pipeline, selectedNodeId, setNodes, setEdges])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdge: Edge = {
          id: `edge-${Date.now()}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        }
        return addEdge(newEdge, eds)
      })
    },
    [setEdges],
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node.id)
    },
    [onSelectNode],
  )

  const onPaneClick = useCallback(() => {
    onSelectNode(null)
  }, [onSelectNode])

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      pipelineNode: PipelineNodeComponent,
    }),
    [],
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => nodeTypeColors[n.data?.type] || '#6b7280'}
          nodeColor={(n) => nodeTypeColors[n.data?.type] || '#6b7280'}
          nodeBorderRadius={8}
        />
      </ReactFlow>
    </div>
  )
}

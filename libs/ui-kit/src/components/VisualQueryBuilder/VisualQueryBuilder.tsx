import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  Panel,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '../Button'; // Assuming there's a Button component

export interface VisualQueryBuilderProps {
  initialQuery?: string;
  onQueryChange: (query: string) => void;
}

// Very basic generator for UQL string based on connected graph
export const generateUQL = (nodes: Node[], edges: Edge[]): string => {
  // Find the source node (no incoming edges)
  const incomingEdges = new Set(edges.map(e => e.target));
  const sourceNode = nodes.find(n => !incomingEdges.has(n.id) && n.type === 'sourceNode');
  
  if (!sourceNode) return '';
  
  let uqlParts = [sourceNode.data.sourceType as string || 'traces'];
  
  // Follow the path
  let currentNodeId = sourceNode.id;
  while (true) {
    const outgoingEdge = edges.find(e => e.source === currentNodeId);
    if (!outgoingEdge) break;
    
    const nextNode = nodes.find(n => n.id === outgoingEdge.target);
    if (!nextNode) break;
    
    if (nextNode.type === 'filterNode') {
      const field = nextNode.data.field || 'service.name';
      const op = nextNode.data.operator || '=';
      let value = nextNode.data.value || '""';
      if (!value.toString().startsWith('"') && !value.toString().startsWith("'")) {
        value = `"${value}"`;
      }
      uqlParts.push(`where ${field} ${op} ${value}`);
    } else if (nextNode.type === 'aggregationNode') {
      const by = nextNode.data.groupByField ? `by ${nextNode.data.groupByField} | ` : '';
      const fn = nextNode.data.function || 'count';
      const fnField = nextNode.data.functionField;
      const fnStr = fn === 'count' ? 'count' : `${fn}(${fnField || 'duration'})`;
      uqlParts.push(`${by}${fnStr}`);
    } else if (nextNode.type === 'joinNode') {
      const target = nextNode.data.targetSignal || 'logs';
      const onField = nextNode.data.onField || 'traceId';
      uqlParts.push(`join ${target} on ${onField}`);
    } else if (nextNode.type === 'limitNode') {
      const limit = nextNode.data.limit || 100;
      uqlParts.push(`limit ${limit}`);
    }
    
    currentNodeId = nextNode.id;
  }
  
  return uqlParts.join(' | ');
};

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'sourceNode',
    position: { x: 50, y: 50 },
    data: { sourceType: 'traces' },
  },
];

const sourceNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[150px]">
      <div className="font-bold text-sm">Source</div>
      <select className="mt-1 block w-full rounded-md border border-gray-300 p-1" defaultValue={data.sourceType}>
        <option value="traces">traces</option>
        <option value="logs">logs</option>
      </select>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const filterNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-500 min-w-[150px]">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold text-sm">Filter</div>
      <input type="text" placeholder="Field" className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.field} />
      <select className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.operator}>
        <option value="=">=</option>
        <option value="!=">!=</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" placeholder="Value" className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.value} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const aggregationNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[150px]">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold text-sm">Aggregation</div>
      <input type="text" placeholder="Group By Field (opt)" className="block w-full border border-gray-300 p-1 rounded mt-1" defaultValue={data.groupByField} />
      <select className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.function}>
        <option value="count">count</option>
        <option value="avg">avg</option>
        <option value="p95">p95</option>
      </select>
      <input type="text" placeholder="Function Field (if avg/p95)" className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.functionField} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const joinNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px]">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold text-sm">Join</div>
      <select className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.targetSignal}>
        <option value="logs">logs</option>
      </select>
      <input type="text" placeholder="On Field" className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.onField} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const limitNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-500 min-w-[150px]">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold text-sm">Limit</div>
      <input type="number" placeholder="Limit" className="block w-full border border-gray-300 mt-1 p-1 rounded" defaultValue={data.limit} />
    </div>
  );
};

const nodeTypes = {
  sourceNode,
  filterNode,
  aggregationNode,
  joinNode,
  limitNode,
};

export const VisualQueryBuilder: React.FC<VisualQueryBuilderProps> = ({ onQueryChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Generate query on change
  useEffect(() => {
    const query = generateUQL(nodes, edges);
    onQueryChange(query);
  }, [nodes, edges, onQueryChange]);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Math.random().toString(),
      type,
      position: { x: 250, y: Math.random() * 200 },
      data: {},
    };
    if (type === 'filterNode') newNode.data = { field: 'service.name', operator: '=', value: 'api' };
    if (type === 'aggregationNode') newNode.data = { function: 'count' };
    if (type === 'joinNode') newNode.data = { targetSignal: 'logs', onField: 'traceId' };
    if (type === 'limitNode') newNode.data = { limit: 100 };
    
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div style={{ height: 400, border: '1px solid #ccc', borderRadius: 8 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Panel position="top-right" className="bg-white p-2 rounded shadow flex gap-2">
          <button className="bg-yellow-100 px-2 py-1 rounded" onClick={() => addNode('filterNode')}>+ Filter</button>
          <button className="bg-purple-100 px-2 py-1 rounded" onClick={() => addNode('aggregationNode')}>+ Aggregation</button>
          <button className="bg-green-100 px-2 py-1 rounded" onClick={() => addNode('joinNode')}>+ Join</button>
          <button className="bg-gray-100 px-2 py-1 rounded" onClick={() => addNode('limitNode')}>+ Limit</button>
        </Panel>
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

import { generateUQL } from '../VisualQueryBuilder';
import { Node, Edge } from '@xyflow/react';

describe('VisualQueryBuilder generateUQL', () => {
  it('should generate a simple traces query', () => {
    const nodes: Node[] = [
      { id: '1', type: 'sourceNode', position: { x: 0, y: 0 }, data: { sourceType: 'traces' } }
    ];
    const edges: Edge[] = [];
    
    expect(generateUQL(nodes, edges)).toBe('traces');
  });

  it('should generate a query with filter', () => {
    const nodes: Node[] = [
      { id: '1', type: 'sourceNode', position: { x: 0, y: 0 }, data: { sourceType: 'traces' } },
      { id: '2', type: 'filterNode', position: { x: 0, y: 0 }, data: { field: 'service.name', operator: '=', value: 'api' } }
    ];
    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' }
    ];
    
    expect(generateUQL(nodes, edges)).toBe('traces | where service.name = "api"');
  });

  it('should generate a query with aggregation', () => {
    const nodes: Node[] = [
      { id: '1', type: 'sourceNode', position: { x: 0, y: 0 }, data: { sourceType: 'traces' } },
      { id: '2', type: 'aggregationNode', position: { x: 0, y: 0 }, data: { function: 'count' } }
    ];
    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' }
    ];
    
    expect(generateUQL(nodes, edges)).toBe('traces | count');
  });

  it('should generate a query with join', () => {
    const nodes: Node[] = [
      { id: '1', type: 'sourceNode', position: { x: 0, y: 0 }, data: { sourceType: 'traces' } },
      { id: '2', type: 'joinNode', position: { x: 0, y: 0 }, data: { targetSignal: 'logs', onField: 'traceId' } }
    ];
    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' }
    ];
    
    expect(generateUQL(nodes, edges)).toBe('traces | join logs on traceId');
  });

  it('should generate a complex query', () => {
    const nodes: Node[] = [
      { id: '1', type: 'sourceNode', position: { x: 0, y: 0 }, data: { sourceType: 'traces' } },
      { id: '2', type: 'filterNode', position: { x: 0, y: 0 }, data: { field: 'service.name', operator: '=', value: 'api' } },
      { id: '3', type: 'joinNode', position: { x: 0, y: 0 }, data: { targetSignal: 'logs', onField: 'traceId' } },
      { id: '4', type: 'limitNode', position: { x: 0, y: 0 }, data: { limit: 50 } }
    ];
    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' }
    ];
    
    expect(generateUQL(nodes, edges)).toBe('traces | where service.name = "api" | join logs on traceId | limit 50');
  });
});

import type { Graph } from '@ankhorage/graph';
import type { StoredGraph } from '@ankhorage/graph/persistence';
import { expect, test } from 'bun:test';

import { toCytoscapeElements } from './graphCytoscape.js';

type PkgVizNodeData = Readonly<{
  path: string;
  parent: string;
  label: string;
  name: string;
  isIntrinsic?: boolean;
}>;

const pkgVizGraph: Graph<PkgVizNodeData, Readonly<{ weight: number }>> = {
  nodes: [
    {
      id: 'react',
      data: {
        path: 'react',
        parent: '',
        label: 'react',
        name: 'react',
      },
    },
    {
      id: 'src.components',
      data: {
        path: 'src.components',
        parent: 'src',
        label: 'components',
        name: 'components',
        isIntrinsic: true,
      },
    },
  ],
  edges: [
    {
      id: 'src.components->react',
      source: 'src.components',
      target: 'react',
      data: { weight: 2 },
    },
  ],
};

const storedGraph: StoredGraph = {
  nodes: [
    {
      id: 'person-1',
      labels: ['Person'],
      data: {
        properties: { name: 'Ada' },
        document: { profile: { languages: ['Ada', 'TypeScript'] } },
      },
    },
    {
      id: 'company-1',
      labels: ['Company'],
      data: { properties: { name: 'Ankhorage' } },
    },
  ],
  edges: [
    {
      id: 'role-current',
      source: 'person-1',
      target: 'company-1',
      type: 'ROLE_AT',
      data: { properties: { validFrom: '2026-01-01' } },
    },
    {
      id: 'role-history',
      source: 'person-1',
      target: 'company-1',
      type: 'ROLE_AT',
      data: { properties: { validFrom: '2025-01-01', validTo: '2026-01-01' } },
    },
  ],
};

test('preserves PKGViz metadata, compound parents, weights, and vendor classes', () => {
  const elements = toCytoscapeElements(pkgVizGraph, {
    nodeClasses: (node) => (node.data.isIntrinsic === true ? undefined : 'isVendor'),
  });

  expect(elements.nodes).toEqual([
    {
      group: 'nodes',
      data: {
        path: 'react',
        parent: '',
        label: 'react',
        name: 'react',
        id: 'react',
      },
      classes: 'isVendor',
    },
    {
      group: 'nodes',
      data: {
        path: 'src.components',
        parent: 'src',
        label: 'components',
        name: 'components',
        isIntrinsic: true,
        id: 'src.components',
      },
    },
  ]);
  expect(elements.edges).toEqual([
    {
      group: 'edges',
      data: {
        weight: 2,
        id: 'src.components->react',
        source: 'src.components',
        target: 'react',
      },
    },
  ]);
});

test('uses graph identity and endpoints instead of conflicting metadata', () => {
  const graph: Graph<
    Readonly<{ id: string; label: string }>,
    Readonly<{ id: string; source: string; target: string }>
  > = {
    nodes: [{ id: 'canonical-node', data: { id: 'wrong-node', label: 'Node' } }],
    edges: [
      {
        id: 'canonical-edge',
        source: 'canonical-node',
        target: 'canonical-node',
        data: {
          id: 'wrong-edge',
          source: 'wrong-source',
          target: 'wrong-target',
        },
      },
    ],
  };

  const elements = toCytoscapeElements(graph);

  expect(elements.nodes[0]?.data.id).toBe('canonical-node');
  expect(elements.edges[0]?.data).toMatchObject({
    id: 'canonical-edge',
    source: 'canonical-node',
    target: 'canonical-node',
  });
});

test('preserves canonical labels, relationship types, and conflicting native properties', () => {
  const graph: Graph<
    Readonly<{ labels: readonly string[]; id: string }>,
    Readonly<{ type: string; id: string; source: string; target: string }>
  > = {
    nodes: [
      {
        id: 'canonical-node',
        labels: ['Package', 'Workspace'],
        data: { labels: ['wrong-label'], id: 'wrong-node' },
      },
    ],
    edges: [
      {
        id: 'canonical-edge',
        source: 'canonical-node',
        target: 'canonical-node',
        type: 'DEPENDS_ON',
        data: {
          type: 'wrong-type',
          id: 'wrong-edge',
          source: 'wrong-source',
          target: 'wrong-target',
        },
      },
    ],
  };

  const elements = toCytoscapeElements(graph, {
    nodeClasses: () => ['consumer-node'],
    edgeClasses: () => 'consumer-edge',
  });

  expect(elements.nodes[0]).toMatchObject({
    data: { id: 'canonical-node', labels: ['Package', 'Workspace'] },
    classes: ['Package', 'Workspace', 'consumer-node'],
  });
  expect(elements.edges[0]).toMatchObject({
    data: {
      id: 'canonical-edge',
      source: 'canonical-node',
      target: 'canonical-node',
      type: 'DEPENDS_ON',
    },
    classes: ['DEPENDS_ON', 'consumer-edge'],
  });
});

test('accepts stored graphs with structured documents and parallel historical relationships', () => {
  const elements = toCytoscapeElements(storedGraph);

  expect(elements.nodes[1]?.data).toEqual({
    id: 'person-1',
    labels: ['Person'],
    properties: { name: 'Ada' },
    document: { profile: { languages: ['Ada', 'TypeScript'] } },
  });
  expect(elements.edges.map(({ data }) => data.id)).toEqual(['role-current', 'role-history']);
  expect(elements.edges[0]?.data).toMatchObject({ type: 'ROLE_AT' });
  expect(elements.edges[1]?.data).toMatchObject({ type: 'ROLE_AT' });
  for (const edge of elements.edges) expect(edge.classes).toEqual(['ROLE_AT']);
});

test('orders node and edge definitions deterministically', () => {
  const graph: Graph<Readonly<Record<string, never>>, Readonly<Record<string, never>>> = {
    nodes: [
      { id: 'z', data: {} },
      { id: 'a', data: {} },
    ],
    edges: [
      { id: 'z-a', source: 'z', target: 'a', data: {} },
      { id: 'a-z', source: 'a', target: 'z', data: {} },
    ],
  };

  const elements = toCytoscapeElements(graph);

  expect(elements.nodes.map(({ data }) => data.id)).toEqual(['a', 'z']);
  expect(elements.edges.map(({ data }) => data.id)).toEqual(['a-z', 'z-a']);
});

test('converts numeric identities and compound parents at the Cytoscape boundary', () => {
  const graph: Graph<
    Readonly<{ parent?: number; label: string }>,
    Readonly<{ weight: number }>,
    number
  > = {
    nodes: [
      { id: 2, data: { parent: 1, label: 'Child' } },
      { id: 1, data: { label: 'Parent' } },
    ],
    edges: [{ id: 3, source: 2, target: 1, data: { weight: 4 } }],
  };
  const observedNodeIds: number[] = [];
  const elements = toCytoscapeElements(graph, {
    nodeClasses: (node) => {
      observedNodeIds.push(node.id);
      return undefined;
    },
  });

  expect(observedNodeIds).toEqual([1, 2]);
  expect(elements.nodes.map(({ data }) => data)).toEqual([
    { id: '1', label: 'Parent' },
    { id: '2', parent: '1', label: 'Child' },
  ]);
  expect(elements.edges[0]?.data).toEqual({ id: '3', source: '2', target: '1', weight: 4 });
});

test('rejects numeric and string identities that collapse to one Cytoscape ID', () => {
  const graph: Graph<
    Readonly<Record<string, never>>,
    Readonly<Record<string, never>>,
    number | string
  > = {
    nodes: [
      { id: 1, data: {} },
      { id: '1', data: {} },
    ],
    edges: [],
  };

  expect(() => toCytoscapeElements(graph)).toThrow('collide after Cytoscape string conversion');
});

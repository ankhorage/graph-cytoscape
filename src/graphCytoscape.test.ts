import type { Graph } from '@ankhorage/graph';
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

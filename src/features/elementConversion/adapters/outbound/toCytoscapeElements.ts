import type { Graph, GraphEdge, GraphNode } from '@ankhorage/graph';
import type { EdgeDefinition, ElementsDefinition, NodeDefinition } from 'cytoscape';

import type {
  CytoscapeAdapterOptions,
  CytoscapeClasses,
  CytoscapeElementData,
} from '../../../../types/cytoscape.js';

/*** Convert a canonical graph to deterministic Cytoscape element definitions. */
export function toCytoscapeElements<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
>(
  graph: Graph<NodeData, EdgeData>,
  options: CytoscapeAdapterOptions<NodeData, EdgeData> = {},
): ElementsDefinition {
  return {
    nodes: [...graph.nodes]
      .sort((left, right) => compareIds(left.id, right.id))
      .map((node) => toNodeDefinition(node, options)),
    edges: [...graph.edges]
      .sort((left, right) => compareIds(left.id, right.id))
      .map((edge) => toEdgeDefinition(edge, options)),
  };
}

/*** Convert one graph node while preserving domain metadata and compound-parent data. */
function toNodeDefinition<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
>(
  node: GraphNode<NodeData>,
  options: CytoscapeAdapterOptions<NodeData, EdgeData>,
): NodeDefinition {
  const classes = normalizeClasses(options.nodeClasses?.(node));

  return {
    group: 'nodes',
    data: {
      ...node.data,
      id: node.id,
    },
    ...(classes === undefined ? {} : { classes }),
  };
}

/*** Convert one graph edge while enforcing canonical identity and endpoints. */
function toEdgeDefinition<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
>(
  edge: GraphEdge<EdgeData>,
  options: CytoscapeAdapterOptions<NodeData, EdgeData>,
): EdgeDefinition {
  const classes = normalizeClasses(options.edgeClasses?.(edge));

  return {
    group: 'edges',
    data: {
      ...edge.data,
      id: edge.id,
      source: edge.source,
      target: edge.target,
    },
    ...(classes === undefined ? {} : { classes }),
  };
}

/*** Convert readonly class arrays to Cytoscape-compatible mutable arrays. */
function normalizeClasses(classes: CytoscapeClasses | undefined): string[] | string | undefined {
  if (classes === undefined || typeof classes === 'string') return classes;
  return [...classes];
}

/*** Compare canonical identities without locale-dependent ordering. */
function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}

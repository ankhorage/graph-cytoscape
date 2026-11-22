import type { Graph, GraphEdge, GraphId, GraphNode } from '@ankhorage/graph';
import type { EdgeDefinition, ElementsDefinition, NodeDefinition } from 'cytoscape';

import type {
  CytoscapeAdapterOptions,
  CytoscapeClasses,
  CytoscapeElementData,
} from '../../types/cytoscape.js';

/*** Convert a canonical graph to deterministic Cytoscape element definitions. */
export function toCytoscapeElements<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
>(
  graph: Graph<NodeData, EdgeData, NodeId, EdgeId>,
  options: CytoscapeAdapterOptions<NodeData, EdgeData, NodeId, EdgeId> = {},
): ElementsDefinition {
  assertDistinctElementIds(graph);
  return {
    nodes: [...graph.nodes]
      .sort((left, right) => compareIds(String(left.id), String(right.id)))
      .map((node) => toNodeDefinition(node, options)),
    edges: [...graph.edges]
      .sort((left, right) => compareIds(String(left.id), String(right.id)))
      .map((edge) => toEdgeDefinition(edge, options)),
  };
}

/*** Convert one graph node while preserving domain metadata and compound-parent data. */
function toNodeDefinition<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
  NodeId extends GraphId,
  EdgeId extends GraphId,
>(
  node: GraphNode<NodeData, NodeId>,
  options: CytoscapeAdapterOptions<NodeData, EdgeData, NodeId, EdgeId>,
): NodeDefinition {
  const classes = mergeClasses(node.labels, options.nodeClasses?.(node));

  return {
    group: 'nodes',
    data: {
      ...node.data,
      ...(node.labels === undefined ? {} : { labels: [...node.labels] }),
      ...toCytoscapeCompoundParent(node.data),
      id: String(node.id),
    },
    ...(classes === undefined ? {} : { classes }),
  };
}

/*** Convert one graph edge while enforcing canonical identity and endpoints. */
function toEdgeDefinition<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
  NodeId extends GraphId,
  EdgeId extends GraphId,
>(
  edge: GraphEdge<EdgeData, NodeId, EdgeId>,
  options: CytoscapeAdapterOptions<NodeData, EdgeData, NodeId, EdgeId>,
): EdgeDefinition {
  const classes = mergeClasses(
    edge.type === undefined ? undefined : [edge.type],
    options.edgeClasses?.(edge),
  );

  return {
    group: 'edges',
    data: {
      ...edge.data,
      ...(edge.type === undefined ? {} : { type: edge.type }),
      id: String(edge.id),
      source: String(edge.source),
      target: String(edge.target),
    },
    ...(classes === undefined ? {} : { classes }),
  };
}

/*** Combine canonical graph categories with optional consumer-provided Cytoscape classes. */
function mergeClasses(
  canonicalClasses: readonly string[] | undefined,
  classes: CytoscapeClasses | undefined,
): string[] | string | undefined {
  if (canonicalClasses === undefined) return normalizeClasses(classes);
  return [...canonicalClasses, ...normalizeClassList(classes)];
}

/*** Convert readonly class arrays to Cytoscape-compatible mutable arrays. */
function normalizeClasses(classes: CytoscapeClasses | undefined): string[] | string | undefined {
  if (classes === undefined || typeof classes === 'string') return classes;
  return [...classes];
}

/*** Normalize optional Cytoscape classes into the array form used for canonical categories. */
function normalizeClassList(classes: CytoscapeClasses | undefined): string[] {
  if (classes === undefined) return [];
  return typeof classes === 'string' ? [classes] : [...classes];
}

/*** Convert numeric compound parents while preserving all other domain data. */
function toCytoscapeCompoundParent(data: object): Readonly<Record<string, string>> {
  if (!('parent' in data) || typeof data.parent !== 'number') return {};
  return { parent: String(data.parent) };
}

/*** Compare canonical identities without locale-dependent ordering. */
function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  return left > right ? 1 : 0;
}

/*** Reject graph identities that would collide after Cytoscape string conversion. */
function assertDistinctElementIds<
  NodeData,
  EdgeData,
  NodeId extends GraphId,
  EdgeId extends GraphId,
>(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>): void {
  const ids = [...graph.nodes, ...graph.edges].map(({ id }) => String(id));
  if (new Set(ids).size !== ids.length) {
    throw new Error('Graph IDs collide after Cytoscape string conversion.');
  }
}

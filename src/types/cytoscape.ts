import type { GraphEdge, GraphNode } from '@ankhorage/graph';

export type CytoscapeElementData = Readonly<Record<string, unknown>>;

export type CytoscapeClasses = string | readonly string[];

export interface CytoscapeAdapterOptions<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
> {
  readonly nodeClasses?: (node: GraphNode<NodeData>) => CytoscapeClasses | undefined;
  readonly edgeClasses?: (edge: GraphEdge<EdgeData>) => CytoscapeClasses | undefined;
}

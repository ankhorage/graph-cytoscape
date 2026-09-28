import type { GraphEdge, GraphId, GraphNode } from '@ankhorage/graph';

export type CytoscapeElementData = Readonly<Record<string, unknown>>;

export type CytoscapeClasses = string | readonly string[];

export interface CytoscapeAdapterOptions<
  NodeData extends CytoscapeElementData,
  EdgeData extends CytoscapeElementData,
  NodeId extends GraphId = string,
  EdgeId extends GraphId = NodeId,
> {
  readonly nodeClasses?: (node: GraphNode<NodeData, NodeId>) => CytoscapeClasses | undefined;
  readonly edgeClasses?: (
    edge: GraphEdge<EdgeData, NodeId, EdgeId>,
  ) => CytoscapeClasses | undefined;
}

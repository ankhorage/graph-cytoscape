# Public API

## CytoscapeAdapterOptions

Kind: `type`
Module: `src/types/cytoscape.ts`
Source: `src/types/cytoscape.ts:7:1`

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| edgeClasses | property | `(edge: GraphEdge<EdgeData, NodeId, EdgeId>) => CytoscapeClasses \| undefined` | no |  |
| nodeClasses | property | `(node: GraphNode<NodeData, NodeId>) => CytoscapeClasses \| undefined` | no |  |

## CytoscapeClasses

Kind: `unknown`
Module: `src/types/cytoscape.ts`
Source: `src/types/cytoscape.ts:5:1`

## CytoscapeElementData

Kind: `unknown`
Module: `src/types/cytoscape.ts`
Source: `src/types/cytoscape.ts:3:1`

## toCytoscapeElements

Kind: `function`
Module: `src/features/elementConversion/toCytoscapeElements.ts`
Source: `src/features/elementConversion/toCytoscapeElements.ts:11:1`

Convert a canonical graph to deterministic Cytoscape element definitions.

### Signatures

- `(graph: Graph<NodeData, EdgeData, NodeId, EdgeId>, options?: CytoscapeAdapterOptions<NodeData, EdgeData, NodeId, EdgeId>) => ElementsDefinition`
  - graph: `Graph<NodeData, EdgeData, NodeId, EdgeId>`
  - options: `CytoscapeAdapterOptions<NodeData, EdgeData, NodeId, EdgeId>` (optional)
  - returns: `ElementsDefinition`

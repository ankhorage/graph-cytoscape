import { createGraph } from '@ankhorage/graph';
import { toCytoscapeElements } from '@ankhorage/graph-cytoscape';

/***
 * Convert a canonical Ankhorage graph into Cytoscape element definitions.
 *
 * @usage
 * @readme
 */
const graph = createGraph({
  nodes: [
    { id: 'studio', data: { label: 'Studio' } },
    { id: 'zora', data: { label: 'ZORA' } },
  ],
  edges: [{ id: 'studio-zora', source: 'studio', target: 'zora', data: { weight: 1 } }],
});

console.log(toCytoscapeElements(graph));

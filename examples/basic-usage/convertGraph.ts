import { createGraph } from '@ankhorage/graph';
import { toCytoscapeElements } from '@ankhorage/graph-cytoscape';

const graph = createGraph({
  nodes: [
    { id: 'studio', data: { label: 'Studio' } },
    { id: 'zora', data: { label: 'ZORA' } },
  ],
  edges: [{ id: 'studio-zora', source: 'studio', target: 'zora', data: { weight: 1 } }],
});

console.log(toCytoscapeElements(graph));

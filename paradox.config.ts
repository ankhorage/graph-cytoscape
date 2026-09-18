import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/graph-cytoscape',
    description: 'Thin Cytoscape adapter for the canonical Ankhorage graph model.',
  },
  package: {
    root: '.',
    entrypoints: ['src/graphCytoscape.ts'],
  },
  output: { dir: './paradox' },
});

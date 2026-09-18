# AGENTS.md

## Repository

Package: `@ankhorage/graph-cytoscape`

Thin Cytoscape adapter for the canonical `@ankhorage/graph` model.

## Current architecture only

Only the current Ankhorage architecture is valid. Do not add deprecated APIs, compatibility aliases, shims, dual old/new paths, or historical-state fallbacks. Cross-package usage must go through published public APIs and declared dependencies.

## Required repository instructions

Before changing any file, read this file and inspect `.agents/skills/`. Load the repository-local coding-rules and project-structure skills for every change, plus hexagonal architecture for structural work.

## Scope

This package converts canonical graphs to Cytoscape element definitions. It does not own graph analysis, dependency semantics, project detection, layouts, styling, Cytoscape lifecycle, or UI behavior.

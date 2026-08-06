# OLFACTUS Knowledge Graph Engine

Model: `KGE-1.0.0`

## Nodes

- fragrance
- brand
- perfumer
- note
- accord
- family
- role
- season
- DNA dimension

## Relationships

- belongs to brand
- created by
- contains note
- has accord
- belongs to family
- fits role
- best in season
- expresses DNA
- similar to
- complements
- high overlap

## Shared APIs

- `buildKnowledgeGraph`
- `scoreFragranceRelationship`
- `getNeighbors`
- `getGraphMetrics`
- `getBridgeFragrances`
- `queryKnowledgeGraph`
- `findRecommendationPath`

## Workspace

`/graph` includes a functional SVG graph canvas, collection modes, selection,
zoom, node inspection, cluster summaries, graph metrics, and recommendation
paths.

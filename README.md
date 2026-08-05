# OLFACTUS OS

The permanent OLFACTUS application repository.

## Current permanent capabilities

- Shared Next.js application shell
- Today, Collection, Decisions, Discover, and Profile routes
- Reusable OLFACTUS component system
- Typed canonical fragrance records
- Explainable Collection Health Engine (`CHE-1.0.0`)
- Persistent Collection Manager
- Search, filtering, sorting, add/remove, favorites, and wear logging
- Automatic intelligence recalculation when collection state changes
- Vitest regression coverage

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm run test
npm run lint
npm run build
```

## Product routes

- `/today`
- `/collection`
- `/decisions`
- `/discover`
- `/profile`

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/SPRINT-001.md`
- `docs/SPRINT-002.md`

## Engineering rule

Every sprint modifies this repository. No disconnected prototypes or report-derived application layouts.


## Implemented sprints

- Sprint 001: permanent application shell and Collection Health Engine
- Sprint 002: persistent Collection Management
- Sprint 003: explainable Buy Decision Engine

# OLFACTUS Architecture

OLFACTUS begins as a modular Next.js application, not a collection of prototypes.

## Layers

1. `lib/domain` — canonical TypeScript domain types.
2. `lib/data` — temporary calibration data; later replaced by PostgreSQL repositories.
3. `lib/intelligence` — deterministic, UI-independent engines.
4. `components/ui` — shared visual primitives.
5. `components/features` — reusable product components.
6. `app/(app)` — permanent product routes.

## Permanent routes

- `/today`
- `/collection`
- `/decisions`
- `/discover`
- `/profile`

The engine never imports UI code. Pages consume typed engine outputs.

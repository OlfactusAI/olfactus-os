# OLFACTUS v2.1.0-beta.2

## Included

- seven ordered PostgreSQL migrations
- migration runner and migration history
- structured sync-record model
- field-level revisions and soft deletion
- browser-local offline operation queue
- batched operation upload
- field-level conflict preservation and review
- device registry and revocation endpoint
- manual/cloud restore-point endpoint
- request-size checks and in-memory rate limiting
- expanded health endpoint
- single-server JSON compatibility adapter for local beta use

## Production mode

Set `DATABASE_URL`, install the optional `pg` package, and run:

`npm run db:migrate`

The included migration runtime creates all production tables. The current
application continues using the local compatibility adapter until a PostgreSQL
implementation of `ProductionDataAdapter` is selected in deployment.

## Sync model

Each record contains:

- entity type and ID
- revision
- device ID
- timestamps
- optional deletion timestamp
- entity payload

Independent records can synchronize without rewriting the user's complete
account snapshot. Revision mismatches become field-level conflicts rather than
whole-account conflicts.

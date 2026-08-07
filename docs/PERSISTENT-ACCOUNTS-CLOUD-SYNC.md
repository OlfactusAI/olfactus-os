# OLFACTUS v2.1.0-beta.1 — Persistent Accounts, Server Database & Sync

## Implemented

- account creation and login
- password hashing with Node.js scrypt
- signed HTTP-only session cookies
- guest/local mode remains available
- account deletion and server-data deletion
- server-backed user snapshots
- local-to-account upload
- revision-based conflict detection
- server-version restore
- sync status in the app header
- account and privacy workspace
- health-check endpoint
- environment validation for production session secrets
- PostgreSQL production schema contract

## Persistence adapter

The installable beta uses a server-side JSON database stored under
`.olfactus-data/server-database.json`. This provides working persistent accounts
and synchronization without requiring an external service during local testing.

On a deployed single-server instance, different devices signed into the same
account share the same server snapshot.

The included `database/schema.sql` defines the PostgreSQL target. The next
deployment step is replacing `lib/server/store.ts` with a transactional
PostgreSQL adapter for multi-instance hosting.

## Security

- passwords are hashed with scrypt and unique random salts
- sessions are signed and stored in HTTP-only cookies
- secure cookies are enabled in production
- production requires a 32+ character `OLFACTUS_SESSION_SECRET`
- collections remain private by default
- no public profile is created
- the account page supports export, sign-out, and deletion

## Sync strategy

Each snapshot contains a revision number. A client uploads against its known
base revision. If the server revision changed, OLFACTUS returns a conflict
instead of silently overwriting newer data.

The user may:

- upload the local browser state
- use the existing server version
- retry synchronization

## Health check

`GET /api/health`

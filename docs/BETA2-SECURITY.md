# Beta.2 security controls

- request-size limit for operation batches
- maximum 250 operations per request
- in-memory synchronization rate limiting
- signed HTTP-only account sessions from beta.1
- soft deletion for synchronized records
- device revocation foundation
- private-by-default account data
- no public profile or sharing behavior

For multi-instance deployment, replace the in-memory limiter with a shared
Redis or database-backed limiter.

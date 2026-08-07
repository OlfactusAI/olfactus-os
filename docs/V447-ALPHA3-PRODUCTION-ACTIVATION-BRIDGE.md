# OLFACTUS OS v4.4.7-alpha.3 — Production Activation Bridge

This milestone introduces the controlled boundary between approved production
packages and runtime-safe OLFACTUS reference entities.

## Activation requires

- approved production promotion
- matching activation package
- exact registry reference/version/certificate match
- exact production fingerprint bundle match
- 100% complete required fingerprints
- locked Gold Standard certificate
- fingerprint consensus ID matching the certificate consensus ID

## Runtime entity

Activation publishes a derived `RuntimeReferenceEntity` containing:

- reference identity
- version/certificate identity
- certificate hash
- source consensus ID
- normalized fingerprint metrics
- activation actor/time

It does not mutate Reference Lab calibration, evidence, consensus, certificates,
or production fingerprint source artifacts.

## Idempotent reference slot

The runtime registry holds one active runtime entity per Reference Registry ID.
Activating a version replaces only the runtime projection for that reference;
source history remains untouched.

## Rollback

Rollback requires:

- currently active registry state
- currently activated promotion
- matching runtime reference/version
- explicit reason

Rollback removes the runtime entity, marks the promotion rolled back, returns
the registry reference to a non-active state, and appends an audit record.

## Route

`/production-activation`

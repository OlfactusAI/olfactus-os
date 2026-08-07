# OLFACTUS OS v4.4.7-alpha.1 — Reference Registry + Production Promotion Pipeline

This milestone bridges the completed Reference Intelligence Laboratory into
production governance.

## Reference Registry

Gold Standard certificates can now be registered as permanent reference records
with:

- reference identity
- current certificate/version
- lifecycle
- production status
- quality/confidence/evidence
- engine coverage
- version history
- timeline/audit events

Registration does not activate production.

## Compatibility scanner

Before production approval, a certified reference is checked for:

- Gold Standard certificate
- locked version
- normalized DNA/performance intelligence
- season/weather profile
- recommendation/role fingerprint
- similarity fingerprint
- Collection Twin fingerprint

Missing compatibility data blocks promotion.

## Production promotion pipeline

Lifecycle:

Registered → compatibility scan → blocked/ready → approved → activation package

Approval generates a `ProductionActivationPackage`. It does not directly mutate
NRE, Similarity, Collection Twin, Decision Lab, Weather, Blind Buy, or Global
Intelligence.

This keeps production execution as a separate future milestone.

## Rollback

Activated promotion records can be rolled back only with an auditable reason.
Rollback returns the registry lifecycle to `registered` and records a timeline
event.

## Routes

- `/reference-registry`
- `/reference-registry/[referenceId]`
- `/production-pipeline`

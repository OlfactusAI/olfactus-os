# OLFACTUS OS v4.4.6-alpha.6 — Reference Intelligence Laboratory: Gold Standard Certification

Milestone 5 completes the Reference Intelligence Laboratory governance pipeline.

## Certification gate

A calibration version can only be certified when:

- the certifier is an active Reference Laboratory administrator
- at least two independent approved reviewers contributed
- consensus confidence meets the configured threshold
- evidence completeness meets the configured threshold
- all required calibration metrics have consensus coverage
- zero moderate/high conflicts remain open
- reference quality meets threshold
- the target version is not already locked
- the consensus run matches the target fragrance/version

There is no override path.

## Issuance

Successful certification:

1. changes the calibration version to `gold-standard`
2. permanently locks the version
3. issues an OLFACTUS Gold Standard certificate
4. generates a deterministic certificate hash
5. creates an immutable-style certification audit record
6. creates a separate production-promotion queue item

## Production safety boundary

Certification does **not** activate the reference in NRE, Similarity, Decision
Lab, or Collection Twin.

Every certificate enters the production-promotion queue with explicit blockers
until a future production-promotion milestone reviews the reference for runtime
compatibility.

## Laboratory lifecycle

Calibration → Evidence Review → Consensus → Conflict Resolution →
Gold Standard Certification → Production Promotion Queue

This completes the laboratory governance infrastructure. The next milestone is
the Reference Registry and first certified production candidate.

# OLFACTUS OS v5.0.0-alpha.3.2 — Canonical Hash & Contract Alignment

This stabilization release closes the blockers reported after alpha.3.1.

## Frozen digest

The stored Aventus Evidence Digest v1 is updated to the digest produced by the installed deterministic generator:

`sha256:6299c5ecebce5d784c902c630b117117b5129db298d4f2e11ce338a0ecae0b97`

The integrity hash is a derived field. Verification hashes the digest payload without `integrityHash`, then compares the derived SHA-256 to the stored value.

## Contract alignment

- Dataset Builder performs a null-safe read of optional readiness state. No default readiness or certification result is manufactured.
- Dataset Review Console removes only a stale unresolved `reviewProgress` dependency when it is provably non-semantic. The installer aborts instead of guessing if the symbol is used elsewhere.
- Dataset Orchestrator adds a post-certification certificate guard before registry/fingerprint/promotion work. The certificate remains mandatory; the contract is not weakened.

## Gate

Reviewer A remains blocked until the complete test suite and production build both pass.

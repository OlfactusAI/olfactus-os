# OLFACTUS OS v4.4.2-alpha.1 — Stabilization Repair

Repairs the two blockers reported by the v4.4.2 release gate:

- stale `tests/system-manifest.test.ts` expectation for v4.4.1
- unsafe direct property access on the optional unified Analyst `preview`

The Analyst fix preserves the unified-result design introduced in v4.4:
`preview` remains optional and is accessed with optional chaining rather
than being forced with a non-null assertion.

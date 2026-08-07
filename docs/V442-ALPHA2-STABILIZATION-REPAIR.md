# OLFACTUS OS v4.4.2-alpha.2 — Stabilization Repair

Repairs the two release-gate blockers reported after Source Adapters +
Catalog Staging & Activation:

- `catalog-v2-manifest.test.ts` still expected `4.4.2-alpha.1`
- an optional Analyst preview member still flowed into a required `string`
  slot, producing `string | undefined` during production type checking

The Analyst repair preserves preview optionality and adds a conservative
empty-string fallback only at the UI string boundary.

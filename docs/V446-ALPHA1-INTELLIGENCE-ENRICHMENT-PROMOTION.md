# OLFACTUS OS v4.4.6-alpha.1 — Catalog Intelligence Enrichment + Promotion Workflow

This release creates the missing trust layer between sourced Catalog V2
discovery records and recommendation-ready intelligence records.

## Evidence-backed drafts

Intelligence attributes are no longer represented as naked values during
enrichment. Every claim carries:

- value
- confidence
- evidence method
- evidence explanation
- optional provenance

Supported evidence methods:

- official-source
- licensed-source
- curated-review
- calculated
- calibrated-model

## Promotion gate

A draft cannot become a `CatalogV2IntelligenceProfile` unless it has:

- approved review status
- confident role evidence
- confident seasonal evidence
- at least 12 confident DNA dimensions
- confident mood evidence
- complete longevity/projection/sillage evidence
- evidence text for every claim
- acceptable aggregate confidence

The gate also warns when evidence-source diversity is weak.

## No auto-enrichment

This milestone does not automatically convert the 89 sourced records into
intelligence candidates. It establishes the workflow that allows future
enrichment to happen safely and audibly.

## Next

The next milestone should build the first calibrated reference set and
promote a small number of fragrances through this workflow end-to-end.

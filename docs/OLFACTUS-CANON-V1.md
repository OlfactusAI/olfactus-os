# OLFACTUS Canon v1.0

Status: Foundation contract  
Applies to: OLFACTUS OS v5 and later  
First reference target: `creed:aventus`

## 1. Mission

OLFACTUS exists to turn fragrance evidence into traceable, reproducible, certified intelligence. The system prefers an explicit unknown over fabricated precision.

## 2. Governing principles

1. Evidence before opinion.
2. Traceability before automation.
3. Independent review before consensus.
4. Consensus before certification.
5. Certification before production intelligence.
6. No silent mutation: material changes create a new version or superseding artifact.
7. Confidence must describe uncertainty; it must not disguise missing evidence.
8. Raw evidence, reviewer interpretation, consensus, and runtime output are distinct layers.
9. Draft or disputed values may not enter production runtime.
10. Every production value must be explainable through an artifact chain.

## 3. Canonical artifact chain

`Source -> Evidence Record -> Research Pack -> Reviewer A/B Calibration -> Review -> Consensus -> Certificate -> Registry -> Fingerprints -> Promotion -> Activation Package -> Runtime Reference`

No stage may manufacture a missing upstream artifact merely to unblock a downstream stage.

## 4. Reference identity

A Gold Standard reference represents a specifically identified fragrance edition/version, not an ambiguous marketing name. Identity must include a stable `fragranceId`, brand, display name, edition/concentration where relevant, reference version, evidence version, and lifecycle state.

A reformulation, concentration, or materially distinct release may require a new reference version or a distinct reference identity according to evidence.

## 5. Evidence classes

OLFACTUS recognizes evidence as claims derived from identifiable sources. Source classes include official/primary, scientific or laboratory, technical, historical, expert/editorial, community aggregate, and market/contextual evidence.

Source class is not the same thing as truth. Primary sources are authoritative for their own claims but may not settle perception-based questions such as wear behavior.

## 6. Calibration

Calibration is reviewer interpretation, never raw evidence. Each calibrated field must carry: value, confidence, rationale, evidence IDs, reviewer identity, status, and version.

Reviewer A and Reviewer B must be isolated until both independent packages are frozen or submitted. Shared evidence is allowed; shared scoring is not.

## 7. Consensus

Consensus is an adjudicated synthesis, not automatic averaging. Differences are classified as agreement, minor variance, substantive variance, or adjudication required. The consensus record must preserve the reviewer values, evidence considered, resolution rationale, resulting value, confidence, and decision status.

## 8. Certification

Certification is allowed only when required evidence, independent reviewer packages, review state, consensus, conflict closure, integrity checks, registry eligibility, and runtime compatibility checks pass. A certificate identifies exactly which versions and hashes it certifies.

## 9. Runtime

Production runtime contains only certified, compatibility-validated fields. Runtime is a derived projection of certification, not another authoring surface. Intelligence modules must consume runtime contracts rather than reviewer drafts or ad-hoc research data.

## 10. Versioning and supersession

Artifacts are never rewritten in a way that destroys provenance. Corrections and material updates create new artifact versions. A newer certified reference may supersede an older active reference while preserving the historical chain.

## 11. Explainability invariant

For every production field, OLFACTUS must be able to answer:

- Which runtime reference supplied it?
- Which certificate authorized that runtime reference?
- Which consensus decision produced it?
- Which reviewer assessments informed that decision?
- Which evidence records supported those assessments?
- Which sources produced those evidence records?

Failure to reconstruct this chain is a traceability failure.

## 12. First-reference rule

Creed Aventus is Reference #001 for validation of the complete system. Aventus must pass the same rules intended for all future references. It receives no special bypasses.

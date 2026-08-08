# Certification Engine Specification v1

## Objective

Convert a frozen research pack into a Gold Standard reference through independent judgment, explicit disagreement handling, certification, and auditable activation.

## Reviewer package

Each reviewer package contains one assessment per required calibration field:

- field ID / section ID
- typed value
- confidence (0-100)
- rationale
- evidence IDs
- reviewer ID
- package version
- state
- timestamps

States: `draft -> frozen -> submitted -> reviewed -> approved | returned`.

Reviewer A and Reviewer B must not read one another's values or rationale before both packages are frozen/submitted.

## Comparison classifications

- `agreement`: no material difference.
- `minor_variance`: difference is within the field's accepted tolerance and does not alter downstream interpretation materially.
- `substantive_variance`: difference exceeds tolerance or changes meaning.
- `adjudication_required`: evidence or rationale conflict prevents deterministic resolution.

Tolerance is field-specific; one global numeric threshold is prohibited.

## Consensus

Consensus records must retain both reviewer positions. A consensus decision can choose one interpretation, synthesize a new supported interpretation, or mark the field unresolved. It may not hide disagreement.

No unresolved required field may be certified.

## Certification gates

Certification requires all of the following:

- frozen research pack
- evidence integrity valid
- Reviewer A approved
- Reviewer B approved
- all required fields present
- comparison complete
- zero open required conflicts
- consensus approved
- schema validation passed
- reference identity verified
- certificate hash generated
- registry compatibility passed
- runtime compatibility passed

## Downstream artifact order

`Consensus -> Certificate -> Registry Record -> Production Fingerprints -> Promotion Approval -> Activation Package -> Runtime Activation`

Each artifact records the upstream artifact IDs/hashes from which it was derived.

## Aventus first-live acceptance state

The first milestone is complete only when the live page can truthfully report:

- AUTHORING COMPLETE
- REVIEW COMPLETE
- CONSENSUS COMPLETE
- CONFLICTS 0 OPEN
- GOLD STANDARD CERTIFIED
- REGISTRY REGISTERED
- FINGERPRINTS COMPLETE
- PRODUCTION APPROVED
- RUNTIME ACTIVE
- TRACEABILITY VERIFIED

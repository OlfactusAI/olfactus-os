# OLFACTUS v2.0.0a — Repair

This repair resolves the initial `2.0.0-alpha.1` validation and type-check
failures.

## Database fixes

- registers catalog-specific concentration entities such as `parfum-intense`
- prevents relationships from targeting missing concentration records
- reads ratings from each fragrance record
- preserves dynamically completed concentrations during migration

## Lineage fixes

- moves collection-aware Upgrade Intelligence into `LineageDossier`
- removes invalid access to `collection` from `LineCard`
- restores typed upgrade and redundancy analysis scope
- narrows optional fragrance results safely

## Application and test fixes

- passes the Deal Lab candidate ID as a string
- strengthens the lineage registry generic constraint
- updates stale `CollectionItem` fixtures to use `daysSinceLastWear`

# OLFACTUS v2.0.0a — Global Fragrance Database Core

Schema version: `GFD-2.0.0`

## Single source of truth

The new database snapshot stores:

- fragrances
- brands
- perfumers
- notes
- accords
- concentrations
- countries
- ingredients
- fragrance lines
- relationships
- assets
- ratings
- dataset metadata

## Repository API

`GlobalDatabaseRepository` provides:

- validated snapshot loading
- constant-time entity lookup
- source and target relationship indexes
- connected-entity queries
- centralized fragrance search

## Native relationships

The core generates relationships for:

- fragrance to brand
- fragrance to perfumer
- fragrance to note
- fragrance to accord
- fragrance to concentration

The model also supports:

- fragrance lines
- flankers
- successors and predecessors
- inspiration
- clones
- similarity
- ingredients
- country of origin

## Validation

The validator detects:

- duplicate IDs
- missing references
- invalid scores
- broken line membership
- invalid relationships
- metadata mismatches

## Migration

The existing `GFD-1.0.0` foundation can be migrated into a `GFD-2.0.0`
snapshot without changing existing application-facing intelligence engines.

## Next phase

v2.0.0b will add the Import Engine, including batch ingestion, validation,
duplicate detection, conflict resolution, and import reports.

# OLFACTUS OS v4.4.2-alpha.2 — Source Adapters + Catalog Staging & Activation

This release turns Catalog V2 from an import parser into a controlled data
acquisition system.

## Source adapters
CSV and JSON are the first adapters. Licensed APIs, open structured sources,
migrations, and future admin tooling can implement the same adapter contract.

## Identity resolution
Canonical matching is flanker-aware. Similar names do not automatically merge
EDT, EDP, Parfum, Extrait, Elixir, or other concentration/flanker identities.

## Field conflicts
Conflicting facts are stored as source-backed claims instead of being silently
overwritten.

## Staging
Imported records remain pending/review/approved/rejected until the activation
gateway evaluates completeness, provenance confidence, hard validation errors,
and unresolved conflicts.

## Rollback
Batch staging can be rolled back without altering the active intelligence
catalog.

## First expansion batch
This package includes a target manifest for a 400-record / 70-house first
expansion batch. It intentionally contains no fabricated fragrance facts.
A real source dataset should be fed through these adapters next.

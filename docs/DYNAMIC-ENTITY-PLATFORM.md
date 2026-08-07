# OLFACTUS v2.2.0-alpha.1 — Dynamic Entity Platform

## Universal routing

Every registered entity uses one route family:

- `/entity/fragrance/[identifier]`
- `/entity/brand/[identifier]`
- `/entity/perfumer/[identifier]`
- `/entity/note/[identifier]`
- `/entity/accord/[identifier]`
- `/entity/family/[identifier]`

The identifier may be a canonical ID, database ID, generated slug, label, or
registered alias.

## Active-catalog generation

The registry is rebuilt from the active catalog. Imported and activated
fragrances automatically create:

- fragrance entities
- brand entities
- perfumer entities
- accord entities
- note entities
- family entities
- relationship edges

No route source code changes are required when the catalog grows.

## Optional-safe dossiers

The dossier generator renders only sections supported by the entity metadata.
Missing notes, accords, perfumers, performance metrics, or release information
do not crash the page.

## Legacy URLs

`/fragrance/[slug]` is now a compatibility resolver. It redirects matching
records into the universal entity router. Unknown slugs display an active-
catalog explanation rather than a Next.js 404.

## Entity browser

`/entities` lists and searches the complete generated registry.

## Important data behavior

The router does not fabricate missing fragrance records. For example, a
`creed-aventus` URL will resolve only when Aventus exists in the bundled or
imported active catalog. Until then, OLFACTUS shows a clear inactive-entity
state and offers the import workflow.

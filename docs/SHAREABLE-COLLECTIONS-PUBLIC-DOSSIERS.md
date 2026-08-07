# OLFACTUS v2.1.0-beta.3

## Privacy-safe sharing

All publishing is explicit and opt-in. No account or collection becomes public
automatically.

A share records:

- type
- unlisted or public visibility
- expiration
- revocation
- view count
- last viewed date
- privacy flags
- share payload

## Public routes

- `/share/collection/[token]`
- `/share/simulation/[token]`
- `/share/recommendation/[token]`
- `/fragrance/[slug]`
- `/u/[username]`

The profile route is only a foundation. It does not expose account data unless
a future explicit publishing workflow writes a public profile.

## Share management

The account workspace can:

- create unlisted share links
- copy a link
- regenerate its token
- monitor view count
- revoke access

## Default privacy

New shares hide:

- purchase prices
- wear history
- acquisition dates
- private notes

Search indexing is disabled by default.

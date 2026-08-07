# Public Intelligence security notes

- share tokens use cryptographically random base64url values
- revoked and expired shares are inaccessible
- publishing requires an authenticated account
- rate limits apply to share creation
- public pages are read-only
- private collection data is not included unless placed into the share payload
- privacy sanitization removes prices, wear history, acquisition dates, and
  private notes when enabled
- public profiles are opt-in foundations only

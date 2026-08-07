# Search Parameter Suspense Boundary Repair

The production build first failed on `/brands`. After that route was
fixed, Next.js continued and exposed the same issue on `/database`.

A complete scan found two remaining route pages that directly combined
`"use client"` with `useSearchParams()`:

- `/database`
- `/perfumers`

Both have now been split into:

- a server `page.tsx` containing `<Suspense>`
- a client child containing the existing page implementation and
  `useSearchParams()`

Regression tests scan every `app/**/page.tsx` file and fail if another
client route directly calls `useSearchParams()`.

# Brands Suspense Boundary Repair

Next.js requires a client component that calls `useSearchParams()` to
render beneath a Suspense boundary during production prerendering.

The repair separates the route into:

- `page.tsx`: server component that owns `<Suspense>`
- `brands-client.tsx`: client component containing the existing Brands
  workspace and its `useSearchParams()` call

Wrapping `useSearchParams()` inside Suspense from within the same client
component is insufficient because the hook executes before that
component can return its boundary.

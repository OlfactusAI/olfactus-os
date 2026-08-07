# Account Client Directive Fix

The account authentication form contained an invalid first line:

`"'"use client";`

This prevented Turbopack from parsing the component.

The repair normalizes the client directives in:

- `components/account/auth-form.tsx`
- `components/account/sync-status.tsx`
- `components/providers/account-provider.tsx`
- `app/(app)/account/page.tsx`

A regression test now verifies that each file begins with the exact valid
directive:

`"use client";`

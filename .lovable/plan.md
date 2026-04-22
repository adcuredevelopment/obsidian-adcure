

## Fix: User profile page not rendering when clicking a user card

### Root cause

TanStack Router's flat file convention treats `agency.users.$userId.tsx` as a **child route** of `agency.users.tsx` (because they share the `agency.users` prefix). Child routes only render when the parent route renders `<Outlet />`. The current `agency.users.tsx` is a full page (renders the list directly) with no `<Outlet />`, so navigating to `/agency/users/u2` changes the URL but the child profile component never mounts. You stay looking at the user list.

This also explains why you never see the Edit button — the profile page isn't being rendered at all, so the modal trigger is never on screen.

### The fix (single-file rename)

Rename the profile route file so it is **not** treated as a child of the list:

- `src/routes/agency.users.$userId.tsx` → `src/routes/agency.users_.$userId.tsx`

The trailing underscore on a path segment (`users_`) is TanStack Router's official "non-nested" escape hatch. The URL stays `/agency/users/$userId` (the underscore is stripped from the path), but the route is no longer nested under `agency.users`, so it renders as a standalone page instead of trying to render inside a non-existent parent `<Outlet />`.

This is the cleanest fix because:
- Both pages keep using `AppShell` directly (no need to refactor either page).
- The URLs the user already bookmarked (`/agency/users`, `/agency/users/u2`) keep working unchanged.
- No `<Link to="/agency/users/$userId">` calls need to change — the route path generated for the type-safe link stays the same.

### Steps

1. Rename `src/routes/agency.users.$userId.tsx` → `src/routes/agency.users_.$userId.tsx`. File contents stay byte-for-byte identical.
2. Let the TanStack Router Vite plugin regenerate `routeTree.gen.ts` automatically.
3. Verify in preview:
   - Go to `/agency/users` → click any client card → the profile page renders (hero, stats, accounts table).
   - The **Edit** button appears in the hero card's top-right action cluster (next to Deactivate / Delete).
   - Clicking Edit opens the modal with editable Name/Phone/Email and locked KVK/VAT/Company.

### Files touched

- Rename: `src/routes/agency.users.$userId.tsx` → `src/routes/agency.users_.$userId.tsx` (no content changes)

No other files need changes. The link in `agency.users.tsx` (`<Link to="/agency/users/$userId" params={{ userId: c.id }}>`) continues to work as-is.


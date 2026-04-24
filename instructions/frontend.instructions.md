# Frontend Instructions

## Stack

- React 19 + TypeScript, Vite, TanStack Router, TanStack Query, TanStack Table, TanStack Virtual
- Supabase JS client for auth
- CSS Modules for all styling
- Vitest + Testing Library + MSW for tests

## Adding a new route

1. Create `src/routes/<path>.tsx` — TanStack Router's Vite plugin auto-generates `routeTree.gen.ts` on the next build/dev start.
2. Export `export const Route = createFileRoute('<path>')({ component: MyPage })`
3. Use `Route.useParams()` or `Route.useSearch()` for params; never read `window.location` directly.
4. Add a link in `Sidebar.tsx` if it's a top-level nav item.

## Adding a new query hook

```ts
// src/hooks/useMyQuery.ts
import { useQuery } from '@tanstack/react-query'
import { getMyData } from '@/api/my-module'

export function useMyQuery(id: string) {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: () => getMyData(id),
  })
}
```

Query key conventions — keep these consistent:
- `['pokedex']` — species list
- `['species', id]` — species detail
- `['livingDex']` — full living dex grid
- `['collection']` — user's Pokémon list
- `['boxes']` — all boxes
- `['box', id]` — box slots
- `['teams']` — team list
- `['team', id]` — team members

## Mutations and cache invalidation

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCollection } from '@/api/collection'

export function useAddToCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addToCollection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['livingDex'] })
      qc.invalidateQueries({ queryKey: ['collection'] })
    },
  })
}
```

## CSS Modules

- One `.module.css` file per component, same base name: `BoxSlot.module.css`
- Import: `import styles from './BoxSlot.module.css'`
- Use semantic names that describe purpose, not appearance: `slot`, `slotOccupied`, `caughtOverlay`, not `greenBox`

## Auth

- Auth state lives in `src/hooks/useAuth.ts` which wraps `supabase.auth.onAuthStateChange`
- The `__root.tsx` route guard redirects to `/auth/login` if no session
- All API calls go through `src/api/client.ts` which injects the Bearer token automatically

## Virtual lists

For the Living Dex grid (~1800 cells), use `@tanstack/react-virtual`:

```ts
const parentRef = useRef<HTMLDivElement>(null)
const rowVirtualizer = useVirtualizer({
  count: entries.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 5,
})
```

Always measure performance with React DevTools Profiler before adding virtualization to smaller lists.

## Testing patterns

- Use `renderWithProviders` helper (wrap in `QueryClientProvider` + `RouterProvider` or `MemoryRouter`)
- Mock API calls with MSW handlers in `src/tests/mocks/handlers.ts`
- Test behaviour, not implementation: click buttons, check visible text, don't inspect state

```ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormDexCell } from '../components/living-dex/FormDexCell'

test('shows caught overlay when Pokémon is caught', () => {
  render(<FormDexCell entry={caughtEntry} onCatch={vi.fn()} />)
  expect(screen.getByRole('img', { name: /caught/i })).toBeInTheDocument()
})
```

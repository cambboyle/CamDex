import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, vi } from 'vitest'
import {
  useDexesQuery,
  useDexAllQuery,
  useCreateDex,
  useDeleteDex,
  useToggleCaught,
  DEX_KEYS,
} from '@/hooks/useDexQuery'
import { server } from '../mocks/server'
import { MOCK_DEX_ID, MOCK_FORM_ID } from '../mocks/handlers'

// ── Test wrapper ──────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, Wrapper }
}

// ── useDexesQuery ─────────────────────────────────────────────────────────────

describe('useDexesQuery', () => {
  it('fetches and returns the dex list', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDexesQuery(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('My Living Dex')
    expect(result.current.data?.[0].stats?.completionPercent).toBe(42)
  })

  it('surfaces an error when the server returns 500', async () => {
    server.use(
      http.get('/api/dex', () => HttpResponse.json({ message: 'Server Error' }, { status: 500 })),
    )

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDexesQuery(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ── useDexAllQuery ────────────────────────────────────────────────────────────

describe('useDexAllQuery', () => {
  it('fetches entries for a given dex id', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDexAllQuery(MOCK_DEX_ID), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.entries).toHaveLength(1)
    expect(result.current.data?.entries[0].displayName).toBe('Bulbasaur')
    expect(result.current.data?.entries[0].nationalDexNumber).toBe(1)
    expect(result.current.data?.total).toBe(1)
  })

  it('stays idle (disabled) when id is an empty string', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDexAllQuery(''), { wrapper: Wrapper })

    // Query should not fire — fetchStatus stays idle
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})

// ── useCreateDex ──────────────────────────────────────────────────────────────

describe('useCreateDex', () => {
  it('invalidates the dex list on success', async () => {
    const { queryClient, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateDex(), { wrapper: Wrapper })
    result.current.mutate({ name: 'New Dex' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: DEX_KEYS.all }),
    )
  })
})

// ── useDeleteDex ──────────────────────────────────────────────────────────────

describe('useDeleteDex', () => {
  it('invalidates the dex list on success', async () => {
    const { queryClient, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteDex(), { wrapper: Wrapper })
    result.current.mutate(MOCK_DEX_ID)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: DEX_KEYS.all }),
    )
  })
})

// ── useToggleCaught ───────────────────────────────────────────────────────────

describe('useToggleCaught', () => {
  it('calls POST /entries/:formId when caught=true', async () => {
    let postCalled = false
    server.use(
      http.post(`/api/dex/${MOCK_DEX_ID}/entries/${MOCK_FORM_ID}`, () => {
        postCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useToggleCaught(MOCK_DEX_ID), { wrapper: Wrapper })
    result.current.mutate({ formId: MOCK_FORM_ID, caught: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(postCalled).toBe(true)
  })

  it('calls DELETE /entries/:formId when caught=false', async () => {
    let deleteCalled = false
    server.use(
      http.delete(`/api/dex/${MOCK_DEX_ID}/entries/${MOCK_FORM_ID}`, () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useToggleCaught(MOCK_DEX_ID), { wrapper: Wrapper })
    result.current.mutate({ formId: MOCK_FORM_ID, caught: false })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(deleteCalled).toBe(true)
  })

  it('invalidates dex-all and stats queries on success', async () => {
    const { queryClient, Wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useToggleCaught(MOCK_DEX_ID), { wrapper: Wrapper })
    result.current.mutate({ formId: MOCK_FORM_ID, caught: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: DEX_KEYS.dexAll(MOCK_DEX_ID) }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: DEX_KEYS.stats(MOCK_DEX_ID) }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: DEX_KEYS.all }),
    )
  })
})

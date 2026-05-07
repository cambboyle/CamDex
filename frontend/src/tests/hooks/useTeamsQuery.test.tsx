import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import {
  useTeamsQuery,
  useCreateTeam,
  useDeleteTeam,
} from '@/hooks/useTeamsQuery'
import { server } from '../mocks/server'
import { MOCK_TEAM_ID } from '../mocks/handlers'

// ── Test wrapper ──────────────────────────────────────────────────────────────

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// ── useTeamsQuery ─────────────────────────────────────────────────────────────

describe('useTeamsQuery', () => {
  it('fetches and returns the team list', async () => {
    const { result } = renderHook(() => useTeamsQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe(MOCK_TEAM_ID)
    expect(result.current.data?.[0].name).toBe('My Team')
    expect(result.current.data?.[0].game).toBe('scarlet-violet')
  })
})

// ── useCreateTeam ─────────────────────────────────────────────────────────────

describe('useCreateTeam', () => {
  it('invalidates the teams query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const testWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateTeam(), { wrapper: testWrapper })
    result.current.mutate({ name: 'New Team', game: 'scarlet-violet' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['teams'] }),
    )
  })
})

// ── useDeleteTeam ─────────────────────────────────────────────────────────────

describe('useDeleteTeam', () => {
  it('invalidates the teams query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const testWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteTeam(), { wrapper: testWrapper })
    result.current.mutate(MOCK_TEAM_ID)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['teams'] }),
    )
  })
})

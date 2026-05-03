import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDexes, createDex, updateDex, deleteDex,
  getDexPage, getDexAll, getDexStats, checkCaught, markCaught, markUncaught,
} from '@/api/dex'
import type { CreateDexDto, UpdateDexDto } from '@/types/dex'

export const DEX_KEYS = {
  all: ['dexes'] as const,
  page: (id: string, page: number) => ['dex-page', id, page] as const,
  dexAll: (id: string) => ['dex-all', id] as const,
  stats: (id: string) => ['dex-stats', id] as const,
  check: (id: string, formIds: string[]) => ['dex-check', id, ...formIds] as const,
}

export function useDexesQuery() {
  return useQuery({
    queryKey: DEX_KEYS.all,
    queryFn: getDexes,
  })
}

export function useDexAllQuery(id: string) {
  return useQuery({
    queryKey: DEX_KEYS.dexAll(id),
    queryFn: () => getDexAll(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useDexPageQuery(id: string, page: number) {
  return useQuery({
    queryKey: DEX_KEYS.page(id, page),
    queryFn: () => getDexPage(id, page),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useDexStatsQuery(id: string) {
  return useQuery({
    queryKey: DEX_KEYS.stats(id),
    queryFn: () => getDexStats(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

/** Check caught status for a list of form IDs across a single dex. */
export function useDexCheckQuery(dexId: string, formIds: string[]) {
  return useQuery({
    queryKey: DEX_KEYS.check(dexId, formIds),
    queryFn: () => checkCaught(dexId, formIds),
    enabled: !!dexId && formIds.length > 0,
    staleTime: 15_000,
  })
}

export function useCreateDex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateDexDto) => createDex(dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: DEX_KEYS.all }),
  })
}

export function useUpdateDex(dexId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateDexDto) => updateDex(dexId, dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: DEX_KEYS.all }),
  })
}

export function useDeleteDex() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDex(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: DEX_KEYS.all }),
  })
}

export function useToggleCaught(dexId: string, page?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ formId, caught }: { formId: string; caught: boolean }) =>
      caught ? markCaught(dexId, formId) : markUncaught(dexId, formId),
    onSuccess: () => {
      if (page !== undefined) {
        void qc.invalidateQueries({ queryKey: DEX_KEYS.page(dexId, page) })
      }
      void qc.invalidateQueries({ queryKey: DEX_KEYS.dexAll(dexId) })
      void qc.invalidateQueries({ queryKey: DEX_KEYS.stats(dexId) })
      void qc.invalidateQueries({ queryKey: DEX_KEYS.all })
      // Invalidate any check queries for this dex so caught badges update
      void qc.invalidateQueries({ queryKey: ['dex-check', dexId] })
    },
  })
}

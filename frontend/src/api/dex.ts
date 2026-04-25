import { api } from './client'
import type { DexConfig, DexPage, DexStats, CreateDexDto, UpdateDexDto } from '@/types/dex'

export function getDexes(): Promise<DexConfig[]> {
  return api.get<DexConfig[]>('/dex')
}

export function createDex(dto: CreateDexDto): Promise<DexConfig> {
  return api.post<DexConfig>('/dex', dto)
}

export function updateDex(id: string, dto: UpdateDexDto): Promise<DexConfig> {
  return api.patch<DexConfig>(`/dex/${id}`, dto)
}

export function deleteDex(id: string): Promise<void> {
  return api.delete<void>(`/dex/${id}`)
}

export function getDexPage(id: string, page: number): Promise<DexPage> {
  return api.get<DexPage>(`/dex/${id}/page?page=${page}`)
}

export function getDexStats(id: string): Promise<DexStats> {
  return api.get<DexStats>(`/dex/${id}/stats`)
}

export function markCaught(dexId: string, formId: string): Promise<void> {
  return api.post<void>(`/dex/${dexId}/entries/${formId}`, {})
}

export function markUncaught(dexId: string, formId: string): Promise<void> {
  return api.delete<void>(`/dex/${dexId}/entries/${formId}`)
}

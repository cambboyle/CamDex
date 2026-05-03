import { api } from './client'
import type { UserPokemon } from '@/types/collection'

export function getCollection(): Promise<UserPokemon[]> {
  return api.get<UserPokemon[]>('/collection')
}

export function updatePokemon(
  id: string,
  dto: Partial<{ nickname: string; isShiny: boolean; ball: string; notes: string }>,
): Promise<UserPokemon> {
  return api.patch<UserPokemon>(`/collection/${id}`, dto)
}

export function releasePokemon(id: string): Promise<void> {
  return api.delete<void>(`/collection/${id}`)
}

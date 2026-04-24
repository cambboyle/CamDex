import { api } from './client'
import type { AddPokemonDto, LivingDexResponse, UserPokemon } from '@/types/collection'

export function getLivingDex(): Promise<LivingDexResponse> {
  return api.get<LivingDexResponse>('/collection/living-dex')
}

export function getCollection(): Promise<UserPokemon[]> {
  return api.get<UserPokemon[]>('/collection')
}

export function addToCollection(dto: AddPokemonDto): Promise<UserPokemon> {
  return api.post<UserPokemon>('/collection', dto)
}

export function updatePokemon(id: string, dto: Partial<AddPokemonDto>): Promise<UserPokemon> {
  return api.patch<UserPokemon>(`/collection/${id}`, dto)
}

export function releasePokemon(id: string): Promise<void> {
  return api.delete<void>(`/collection/${id}`)
}

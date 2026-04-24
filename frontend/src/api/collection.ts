import { api } from './client'
import type { CreateUserPokemonDto, LivingDexResponse, UserPokemon } from '@/types/collection'

export function getLivingDex(): Promise<LivingDexResponse> {
  return api.get<LivingDexResponse>('/collection/living-dex')
}

export function getCollection(params?: { formId?: string; speciesId?: string }): Promise<UserPokemon[]> {
  const query = new URLSearchParams()
  if (params?.formId) query.set('formId', params.formId)
  if (params?.speciesId) query.set('speciesId', params.speciesId)
  const qs = query.toString()
  return api.get<UserPokemon[]>(`/collection${qs ? `?${qs}` : ''}`)
}

export function addToCollection(dto: CreateUserPokemonDto): Promise<UserPokemon> {
  return api.post<UserPokemon>('/collection', dto)
}

export function updatePokemon(id: string, dto: Partial<CreateUserPokemonDto>): Promise<UserPokemon> {
  return api.patch<UserPokemon>(`/collection/${id}`, dto)
}

export function releasePokemon(id: string): Promise<void> {
  return api.delete<void>(`/collection/${id}`)
}

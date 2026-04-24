import { api } from './client'
import type { PaginatedSpecies, PokemonForm, PokemonSpeciesDetail } from '@/types/pokemon'

export interface SpeciesListParams {
  search?: string
  type?: string
  gen?: number
  page?: number
  limit?: number
}

export function getSpeciesList(params: SpeciesListParams = {}): Promise<PaginatedSpecies> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.type) query.set('type', params.type)
  if (params.gen) query.set('gen', String(params.gen))
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return api.get<PaginatedSpecies>(`/pokemon/species${qs ? `?${qs}` : ''}`)
}

export function getSpeciesDetail(id: string): Promise<PokemonSpeciesDetail> {
  return api.get<PokemonSpeciesDetail>(`/pokemon/species/${id}`)
}

export function getFormDetail(id: string): Promise<PokemonForm> {
  return api.get<PokemonForm>(`/pokemon/forms/${id}`)
}

export function getTypes(): Promise<string[]> {
  return api.get<string[]>('/pokemon/types')
}

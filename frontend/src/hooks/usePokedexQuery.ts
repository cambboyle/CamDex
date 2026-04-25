import { useQuery } from '@tanstack/react-query'
import { getSpeciesList, getSpeciesDetail, getTypes } from '@/api/pokedex'

export interface PokedexQueryParams {
  search?: string
  type?: string
  gen?: number
  page?: number
}

export function usePokedexQuery(params: PokedexQueryParams) {
  return useQuery({
    queryKey: ['pokedex', params],
    queryFn: () => getSpeciesList({ ...params, limit: 60 }),
  })
}

export function useSpeciesDetailQuery(id: string) {
  return useQuery({
    queryKey: ['species', id],
    queryFn: () => getSpeciesDetail(id),
    enabled: !!id,
  })
}

export function useTypesQuery() {
  return useQuery({
    queryKey: ['pokemon-types'],
    queryFn: getTypes,
    staleTime: Infinity,
  })
}

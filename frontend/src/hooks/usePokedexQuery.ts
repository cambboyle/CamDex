import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getSpeciesList, getSpeciesDetail, getTypes } from '@/api/pokedex'

export interface PokedexQueryParams {
  search?: string
  type?: string
  gen?: number
  page?: number
}

const POKEDEX_LIMIT = 60

export function usePokedexQuery(params: PokedexQueryParams) {
  return useQuery({
    queryKey: ['pokedex', params],
    queryFn: () => getSpeciesList({ ...params, limit: POKEDEX_LIMIT }),
  })
}

export function usePokedexInfiniteQuery(params: Omit<PokedexQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['pokedex-infinite', params],
    queryFn: ({ pageParam }) =>
      getSpeciesList({ ...params, page: pageParam as number, limit: POKEDEX_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    },
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

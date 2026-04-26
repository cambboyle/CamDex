import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getSpeciesList, getSpeciesDetail, getTypes } from '@/api/pokedex'

export interface PokedexQueryParams {
  search?: string
  type?: string
  gen?: number
  /** Show all Pokémon introduced up to and including this generation */
  maxGen?: number
  /** Restrict to the Pokémon Champions launch roster */
  championsOnly?: boolean
  page?: number
}

/** Default page size for the main Pokédex browser (infinite scroll) */
const POKEDEX_LIMIT = 60
/** Larger page size for the team builder picker — loads most game rosters in one shot */
export const PICKER_LIMIT = 300

export function usePokedexQuery(params: PokedexQueryParams) {
  return useQuery({
    queryKey: ['pokedex', params],
    queryFn: () => getSpeciesList({ ...params, limit: POKEDEX_LIMIT }),
  })
}

export function usePokedexInfiniteQuery(
  params: Omit<PokedexQueryParams, 'page'>,
  limit = POKEDEX_LIMIT,
) {
  return useInfiniteQuery({
    queryKey: ['pokedex-infinite', params, limit],
    queryFn: ({ pageParam }) =>
      getSpeciesList({ ...params, page: pageParam as number, limit }),
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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLivingDex, addToCollection, releasePokemon } from '@/api/collection'
import type { AddPokemonDto } from '@/types/collection'

export function useLivingDexQuery() {
  return useQuery({
    queryKey: ['living-dex'],
    queryFn: getLivingDex,
    staleTime: 30_000,
  })
}

export function useAddToCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddPokemonDto) => addToCollection(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['living-dex'] })
    },
  })
}

export function useReleasePokemon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => releasePokemon(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['living-dex'] })
    },
  })
}
